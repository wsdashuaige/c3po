package fin.c3po.course.dto;

import fin.c3po.course.CourseStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class CourseResponse {
    UUID id;
    String name;
    String semester;
    Integer credit;
    CourseStatus status;
    Integer enrollLimit;
    UUID teacherId;
    Instant createdAt;
    Instant updatedAt;
    CourseSummaryMetrics metrics;

    @Value
    @Builder
    public static class CourseSummaryMetrics {
        int enrolledCount;
        int assignments;
        int modules;
    }
}


