package fin.c3po.selection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseSelectionRepository extends JpaRepository<CourseSelection, UUID> {
    List<CourseSelection> findByStudentId(UUID studentId);
    List<CourseSelection> findByCourseId(UUID courseId);
    boolean existsByCourseIdAndStudentId(UUID courseId, UUID studentId);
    List<CourseSelection> findByCourseIdAndStatus(UUID courseId, SelectionStatus status);
    long countByCourseIdAndStatus(UUID courseId, SelectionStatus status);
    Optional<CourseSelection> findByCourseIdAndStudentId(UUID courseId, UUID studentId);
}


