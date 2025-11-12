package fin.c3po.course;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID>, JpaSpecificationExecutor<Course> {
    Page<Course> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
    long countByStatus(CourseStatus status);
    List<Course> findByTeacherId(UUID teacherId);
}


