package fin.c3po.course.dto;

import fin.c3po.course.CourseStatus;
import fin.c3po.selection.SelectionStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class StudentCourseResponse {
    UUID courseId;
    String name;
    CourseStatus status;
    SelectionStatus selectionStatus;
    Instant selectedAt;
    int pendingAssignments;
    int completedAssignments;
    int totalAssignments;
}


