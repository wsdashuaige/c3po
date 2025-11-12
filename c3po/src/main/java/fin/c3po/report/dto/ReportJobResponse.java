package fin.c3po.report.dto;

import fin.c3po.report.ReportJobStatus;
import fin.c3po.report.ReportJobType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Value
@Builder
public class ReportJobResponse {
    UUID id;
    ReportJobType jobType;
    ReportJobStatus status;
    Map<String, Object> params;
    Instant createdAt;
    Instant completedAt;
    String resultUrl;
}


