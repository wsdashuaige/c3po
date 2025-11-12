package fin.c3po.course.dto;

import fin.c3po.course.CourseResourceType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class CourseResourceResponse {
    UUID id;
    UUID moduleId;
    CourseResourceType type;
    String name;
    Long fileSize;
    String downloadUrl;
    Instant createdAt;
    Instant updatedAt;
}


