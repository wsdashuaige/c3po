package fin.c3po.course.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCourseRequest {

    @Size(max = 128)
    private String name;

    @Size(max = 32)
    private String semester;

    @Max(10)
    private Integer credit;

    private Integer enrollLimit;
}


