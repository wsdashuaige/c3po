package fin.c3po.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {
    List<CourseModule> findByCourseIdOrderByDisplayOrderAsc(UUID courseId);
    long countByCourseId(UUID courseId);
}


