package fin.c3po.course.dto;

import fin.c3po.selection.SelectionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class CourseEnrollmentResponse {
    UUID selectionId;
    UUID courseId;
    UUID studentId;
    SelectionStatus status;
    Instant selectedAt;
}


