package fin.c3po.approval.dto;

import fin.c3po.approval.ApprovalStatus;
import fin.c3po.approval.ApprovalType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ApprovalResponse {
    UUID id;
    ApprovalType type;
    ApprovalStatus status;
    UUID applicantId;
    String payload;
    UUID processedBy;
    String comment;
    Instant processedAt;
    Instant createdAt;
    Instant updatedAt;
}


