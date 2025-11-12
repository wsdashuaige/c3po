package fin.c3po.course.dto;

import fin.c3po.course.CourseResourceType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class CourseModuleResponse {
    UUID id;
    UUID courseId;
    String title;
    Integer displayOrder;
    Instant releaseAt;
    List<Resource> resources;

    @Value
    @Builder
    public static class Resource {
        UUID id;
        CourseResourceType type;
        String name;
        Long fileSize;
        String downloadUrl;
    }
}


