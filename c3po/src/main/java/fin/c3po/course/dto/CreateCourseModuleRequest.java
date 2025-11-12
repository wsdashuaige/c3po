package fin.c3po.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CreateCourseModuleRequest {

    @NotBlank
    @Size(max = 128)
    private String title;

    @NotNull
    @Min(1)
    private Integer displayOrder;

    private Instant releaseAt;
}


