package fin.c3po.assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class DuplicateAssignmentRequest {

    @NotNull
    private UUID targetCourseId;

    private String newTitle;
}


