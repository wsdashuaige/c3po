package fin.c3po.course.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateCourseRequest {

    @NotBlank
    @Size(max = 128)
    private String name;

    @Size(max = 32)
    private String semester;

    @Positive
    @Max(10)
    private Integer credit;

    @Positive
    private Integer enrollLimit;

    private UUID teacherId;
}


