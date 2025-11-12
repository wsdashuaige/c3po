package fin.c3po.submission.dto;

import fin.c3po.submission.SubmissionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class SubmissionResponse {
    UUID id;
    UUID assignmentId;
    UUID studentId;
    SubmissionStatus status;
    Integer score;
    Instant submittedAt;
    List<String> attachments;
    String feedback;
    List<GradeSubmissionRequest.RubricScore> rubricScores;
    String appealReason;
    Instant appealedAt;
    UUID gradingTeacherId;
    Instant createdAt;
    Instant updatedAt;
}


