package fin.c3po.submission;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findByAssignmentId(UUID assignmentId);
    List<QuizAttempt> findByStudentId(UUID studentId);
}


