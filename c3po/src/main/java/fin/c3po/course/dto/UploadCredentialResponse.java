package fin.c3po.course.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class UploadCredentialResponse {
    String uploadUrl;
    String method;
    Instant expiresAt;
    String callbackUrl;
}


