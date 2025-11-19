package fin.c3po.user.dto;

import fin.c3po.user.UserRole;
import fin.c3po.user.UserStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class UserDetailResponse {
    UUID id;
    String username;
    String email;
    UserRole role;
    UserStatus status;
    Instant createdAt;
    Instant updatedAt;
    StudentProfileSummary studentProfile;
    TeacherProfileSummary teacherProfile;
}

