package fin.c3po.score.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class ScoreResponse {
    UUID id;
    UUID studentId;
    UUID courseId;
    String component;
    Integer value;
    Instant releasedAt;
    Instant createdAt;
    Instant updatedAt;
}


