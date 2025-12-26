package fin.c3po.course.dto;

import fin.c3po.course.CourseStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class CoursePlazaResponse {
    UUID id;
    String name;
    String semester;
    Integer credit;
    CourseStatus status;
    Integer enrollLimit;
    Integer enrolledCount;
    Integer assignments;
    Integer modules;
    
    // 教师信息
    TeacherInfo teacher;
    
    // 选课状态（仅当学生已登录时返回）
    EnrollmentStatus enrollmentStatus;
    
    Instant createdAt;
    Instant updatedAt;

    @Value
    @Builder
    public static class TeacherInfo {
        UUID id;
        String username;
        String department;
        String title;
    }

    @Value
    @Builder
    public static class EnrollmentStatus {
        boolean enrolled;
        boolean canEnroll;
        String reason; // 如果canEnroll为false，说明原因
    }
}

