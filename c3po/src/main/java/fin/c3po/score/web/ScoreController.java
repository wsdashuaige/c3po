package fin.c3po.score.web;

import fin.c3po.common.web.ApiResponse;
import fin.c3po.course.Course;
import fin.c3po.course.CourseRepository;
import fin.c3po.score.Score;
import fin.c3po.score.ScoreRepository;
import fin.c3po.score.dto.PublishScoresRequest;
import fin.c3po.score.dto.ScoreResponse;
import fin.c3po.user.UserAccount;
import fin.c3po.user.UserRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Validated
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreRepository scoreRepository;
    private final CourseRepository courseRepository;

    @GetMapping("/students/{studentId}/scores")
    public ApiResponse<List<ScoreResponse>> studentScores(
            @PathVariable UUID studentId,
            @AuthenticationPrincipal UserAccount currentUser) {

        ensureViewPermission(studentId, currentUser);
        List<ScoreResponse> responses = scoreRepository.findByStudentId(studentId)
                .stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(responses);
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping("/courses/{courseId}/scores")
    public ApiResponse<List<ScoreResponse>> courseScores(
            @PathVariable UUID courseId,
            @AuthenticationPrincipal UserAccount currentUser) {

        ensureCoursePermission(currentUser, courseId);
        List<ScoreResponse> responses = scoreRepository.findByCourseId(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
        return ApiResponse.success(responses);
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping("/courses/{courseId}/scores/publish")
    public ResponseEntity<ApiResponse<List<ScoreResponse>>> publishScores(
            @PathVariable UUID courseId,
            @Valid @RequestBody PublishScoresRequest request,
            @AuthenticationPrincipal UserAccount currentUser) {

        ensureCoursePermission(currentUser, courseId);
        Instant releaseTime = request.getPublishAt() != null ? request.getPublishAt() : Instant.now();

        List<ScoreResponse> responses = request.getScores().stream()
                .map(entry -> upsertScore(courseId, entry.getStudentId(), entry.getComponent(), entry.getValue(), releaseTime))
                .map(this::toResponse)
                .toList();

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(responses));
    }

    private void ensureViewPermission(UUID studentId, UserAccount currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.TEACHER) {
            return;
        }
        if (!currentUser.getId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to view scores");
        }
    }

    private void ensureCoursePermission(UserAccount currentUser, UUID courseId) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }
        if (currentUser.getRole() == UserRole.TEACHER) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
            if (!course.getTeacherId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to manage this course");
            }
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to access course scores");
    }

    private Score upsertScore(UUID courseId, UUID studentId, String component, Integer value, Instant releaseTime) {
        Score score = scoreRepository.findByStudentIdAndCourseIdAndComponent(studentId, courseId, component)
                .orElseGet(Score::new);
        score.setCourseId(courseId);
        score.setStudentId(studentId);
        score.setComponent(component);
        score.setValue(value);
        score.setReleasedAt(releaseTime);
        return scoreRepository.save(score);
    }

    private ScoreResponse toResponse(Score score) {
        return ScoreResponse.builder()
                .id(score.getId())
                .studentId(score.getStudentId())
                .courseId(score.getCourseId())
                .component(score.getComponent())
                .value(score.getValue())
                .releasedAt(score.getReleasedAt())
                .createdAt(score.getCreatedAt())
                .updatedAt(score.getUpdatedAt())
                .build();
    }
}


