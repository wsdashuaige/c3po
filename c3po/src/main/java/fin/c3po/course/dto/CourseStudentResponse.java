package fin.c3po.course.dto;

import fin.c3po.selection.SelectionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class CourseStudentResponse {
    private UUID studentId;
    private String username;
    private String email;
    private SelectionStatus status;
    private Instant enrolledAt;
}
