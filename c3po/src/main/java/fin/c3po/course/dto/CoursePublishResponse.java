package fin.c3po.course.dto;

import fin.c3po.course.CourseStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class CoursePublishResponse {
    UUID courseId;
    CourseStatus status;
    UUID approvalRequestId;
    Instant submittedAt;
}


