package fin.c3po.user.web;

import fin.c3po.common.web.ApiResponse;
import fin.c3po.profile.StudentProfile;
import fin.c3po.profile.StudentProfileRepository;
import fin.c3po.profile.TeacherProfile;
import fin.c3po.profile.TeacherProfileRepository;
import fin.c3po.user.UserAccount;
import fin.c3po.user.dto.StudentProfileSummary;
import fin.c3po.user.dto.TeacherProfileSummary;
import fin.c3po.user.dto.UserDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me")
@Validated
@RequiredArgsConstructor
public class UserController {

    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    @GetMapping
    public ApiResponse<UserDetailResponse> getCurrentUser(
            @AuthenticationPrincipal UserAccount currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        StudentProfile studentProfile = null;
        TeacherProfile teacherProfile = null;

        if (currentUser.getRole() == fin.c3po.user.UserRole.STUDENT) {
            studentProfile = studentProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        } else if (currentUser.getRole() == fin.c3po.user.UserRole.TEACHER) {
            teacherProfile = teacherProfileRepository.findByUserId(currentUser.getId()).orElse(null);
        }

        UserDetailResponse response = toResponse(currentUser, studentProfile, teacherProfile);
        return ApiResponse.success(response);
    }

    private UserDetailResponse toResponse(UserAccount user, StudentProfile studentProfile, TeacherProfile teacherProfile) {
        StudentProfileSummary studentSummary = null;
        if (studentProfile != null) {
            studentSummary = StudentProfileSummary.builder()
                    .studentNo(studentProfile.getStudentNo())
                    .grade(studentProfile.getGrade())
                    .major(studentProfile.getMajor())
                    .className(studentProfile.getClassName())
                    .build();
        }

        TeacherProfileSummary teacherSummary = null;
        if (teacherProfile != null) {
            teacherSummary = TeacherProfileSummary.builder()
                    .teacherNo(teacherProfile.getTeacherNo())
                    .department(teacherProfile.getDepartment())
                    .title(teacherProfile.getTitle())
                    .subjects(parseSubjects(teacherProfile.getSubjects()))
                    .build();
        }

        return UserDetailResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .studentProfile(studentSummary)
                .teacherProfile(teacherSummary)
                .build();
    }

    private List<String> parseSubjects(String subjects) {
        if (!StringUtils.hasText(subjects)) {
            return List.of();
        }
        String[] parts = subjects.split(",");
        List<String> parsed = new ArrayList<>();
        for (String part : parts) {
            String trimmed = part.trim();
            if (StringUtils.hasText(trimmed)) {
                parsed.add(trimmed);
            }
        }
        return parsed;
    }
}

