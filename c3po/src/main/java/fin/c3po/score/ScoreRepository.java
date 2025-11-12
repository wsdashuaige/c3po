package fin.c3po.score;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    List<Score> findByStudentId(UUID studentId);
    List<Score> findByCourseId(UUID courseId);
    List<Score> findByStudentIdAndCourseId(UUID studentId, UUID courseId);
    Optional<Score> findByStudentIdAndCourseIdAndComponent(UUID studentId, UUID courseId, String component);
}


