package fin.c3po.assignment.dto;

import fin.c3po.assignment.AssignmentType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class AssignmentResponse {
    UUID id;
    UUID courseId;
    String title;
    AssignmentType type;
    Instant deadline;
    Boolean allowResubmit;
    Integer maxResubmit;
    List<CreateAssignmentRequest.RubricItem> gradingRubric;
    List<String> visibilityTags;
    Instant releaseAt;
    Boolean published;
    Instant publishedAt;
    Instant createdAt;
    Instant updatedAt;
}


