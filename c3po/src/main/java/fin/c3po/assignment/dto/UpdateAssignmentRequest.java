package fin.c3po.assignment.dto;

import fin.c3po.assignment.AssignmentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class UpdateAssignmentRequest {

    @Size(max = 128)
    private String title;

    private AssignmentType type;

    private Instant deadline;

    private Boolean allowResubmit;

    private Integer maxResubmit;

    @Valid
    private List<CreateAssignmentRequest.RubricItem> gradingRubric;

    @Valid
    private CreateAssignmentRequest.Visibility visibility;
}


