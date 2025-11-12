package fin.c3po.assignment.dto;

import fin.c3po.assignment.AssignmentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CreateAssignmentRequest {

    @NotBlank
    @Size(max = 128)
    private String title;

    @NotNull
    private AssignmentType type;

    private Instant deadline;

    private Boolean allowResubmit;

    @Positive
    private Integer maxResubmit;

    @Valid
    private List<RubricItem> gradingRubric = new ArrayList<>();

    @Valid
    private Visibility visibility;

    @Getter
    @Setter
    public static class RubricItem {
        @NotBlank
        private String criterion;
        @NotNull
        private Double weight;
    }

    @Getter
    @Setter
    public static class Visibility {
        private Instant releaseAt;
        private List<String> visibleTo = new ArrayList<>();
    }
}


