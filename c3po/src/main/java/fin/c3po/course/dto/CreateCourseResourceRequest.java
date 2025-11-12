package fin.c3po.course.dto;

import fin.c3po.course.CourseResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCourseResourceRequest {

    @NotNull
    private CourseResourceType type;

    @NotBlank
    @Size(max = 128)
    private String name;

    private Long fileSize;

    @Size(max = 2048)
    private String downloadUrl;
}


