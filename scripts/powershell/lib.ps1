#!/usr/bin/env pwsh
# API testing helper functions for PowerShell scripts

param()

$Script:ScriptDir = Split-Path -LiteralPath $MyInvocation.MyCommand.Path -Parent
. (Join-Path $Script:ScriptDir "config.ps1")

function Get-FullApiUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if ($Path.StartsWith("http")) {
        return $Path
    }

    $base = $Script:ApiBaseUrl.TrimEnd("/")
    if ($Path.StartsWith("/")) {
        return "$base$Path"
    }

    return "$base/$Path"
}

function Get-Token {
    if (Test-Path -LiteralPath $Script:TokenFile) {
        return (Get-Content -LiteralPath $Script:TokenFile -Raw).Trim()
    }
    return ""
}

function Invoke-ApiRequest {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("GET", "POST", "PUT", "DELETE")]
        [string]$Method,

        [Parameter(Mandatory = $true)]
        [string]$Path,

        [string]$Body
    )

    $uri = Get-FullApiUrl -Path $Path
    $headers = @{
        "Content-Type" = "application/json"
    }

    $token = Get-Token
    if (-not [string]::IsNullOrEmpty($token)) {
        $headers["Authorization"] = "Bearer $token"
    }

    $payload = $null
    if ($Body) {
        $payload = [System.Text.Encoding]::UTF8.GetBytes($Body)
    }

    try {
        $response = Invoke-WebRequest -Uri $uri -Method $Method -Headers $headers -TimeoutSec $Script:ApiTimeout -Body $payload -ErrorAction Stop
        return [pscustomobject]@{
            Body       = $response.Content
            StatusCode = [int]$response.StatusCode
        }
    }
    catch [System.Net.WebException] {
        $webResponse = $_.Exception.Response
        if ($null -ne $webResponse) {
            try {
                $stream = $webResponse.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $content = $reader.ReadToEnd()
                $reader.Dispose()
                $stream.Dispose()
            }
            catch {
                $content = ""
            }

            return [pscustomobject]@{
                Body       = $content
                StatusCode = [int]$webResponse.StatusCode
            }
        }

        return [pscustomobject]@{
            Body       = ""
            StatusCode = 0
        }
    }
}

function http_get {
    param([string]$Path)
    return Invoke-ApiRequest -Method "GET" -Path $Path
}

function http_post {
    param([string]$Path, [string]$Body)
    return Invoke-ApiRequest -Method "POST" -Path $Path -Body $Body
}

function http_put {
    param([string]$Path, [string]$Body)
    return Invoke-ApiRequest -Method "PUT" -Path $Path -Body $Body
}

function http_delete {
    param([string]$Path)
    return Invoke-ApiRequest -Method "DELETE" -Path $Path
}

function log_info {
    param([string]$Message)
    Write-Host "(INFO) $Message" -ForegroundColor Cyan
}

function log_success {
    param([string]$Message)
    Write-Host "(✓) $Message" -ForegroundColor Green
    $Script:TestsPassed++
}

function log_error {
    param([string]$Message)
    Write-Host "(✗) $Message" -ForegroundColor Red
    $Script:TestsFailed++
}

function log_warn {
    param([string]$Message)
    Write-Host "(WARN) $Message" -ForegroundColor Yellow
}

function assert_status {
    param(
        [string]$Expected,
        [string]$Actual,
        [string]$Message
    )

    if ($Actual -eq $Expected) {
        log_success "$Message (HTTP $Actual)"
        return $true
    }

    log_error "$Message (Expected HTTP $Expected, got $Actual)"
    return $false
}

function Get-JsonFieldValue {
    param(
        [Parameter(Mandatory = $true)]
        [object]$JsonObject,
        [Parameter(Mandatory = $true)]
        [string]$FieldPath
    )

    $current = $JsonObject
    foreach ($segment in $FieldPath.Split('.')) {
        if ($null -eq $current) {
            return $null
        }

        if ($current -is [System.Collections.IDictionary]) {
            if (-not $current.Contains($segment)) {
                return $null
            }
            $current = $current[$segment]
            continue
        }

        $property = $current.PSObject.Properties[$segment]
        if ($null -eq $property) {
            return $null
        }
        $current = $property.Value
    }

    return $current
}

function assert_json_field {
    param(
        [string]$Json,
        [string]$Field,
        [string]$Message
    )

    if ([string]::IsNullOrWhiteSpace($Json)) {
        log_error "$Message (empty JSON payload)"
        return $false
    }

    try {
        $parsed = $Json | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        log_error "$Message (invalid JSON payload)"
        return $false
    }

    $value = Get-JsonFieldValue -JsonObject $parsed -FieldPath $Field
    if ($null -ne $value) {
        log_success "$Message (field '$Field' exists)"
        return $true
    }

    log_error "$Message (field '$Field' missing)"
    return $false
}

function save_token {
    param([string]$Json)

    if ([string]::IsNullOrWhiteSpace($Json)) {
        log_error "No token in response"
        return $false
    }

    try {
        $parsed = $Json | ConvertFrom-Json -ErrorAction Stop
        $token = Get-JsonFieldValue -JsonObject $parsed -FieldPath "accessToken"
    }
    catch {
        log_error "No token in response"
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($token)) {
        log_error "No token in response"
        return $false
    }

    $token | Out-File -LiteralPath $Script:TokenFile -Encoding utf8 -Force
    log_info "Token saved"
    return $true
}

function clear_token {
    if (Test-Path -LiteralPath $Script:TokenFile) {
        Remove-Item -LiteralPath $Script:TokenFile -Force
    }
    log_info "Token cleared"
}

function print_summary {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor White
    Write-Host "Test Summary" -ForegroundColor White
    Write-Host "==================================" -ForegroundColor White
    Write-Host ("Passed: {0}" -f $Script:TestsPassed) -ForegroundColor Green
    Write-Host ("Failed: {0}" -f $Script:TestsFailed) -ForegroundColor Red
    Write-Host ("Total:  {0}" -f ($Script:TestsPassed + $Script:TestsFailed)) -ForegroundColor White
    Write-Host "==================================" -ForegroundColor White

    if ($Script:TestsFailed -eq 0) {
        return $true
    }

    return $false
}


