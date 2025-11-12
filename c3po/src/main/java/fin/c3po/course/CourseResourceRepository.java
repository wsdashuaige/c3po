package fin.c3po.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseResourceRepository extends JpaRepository<CourseResource, UUID> {
    List<CourseResource> findByModuleId(UUID moduleId);
}


