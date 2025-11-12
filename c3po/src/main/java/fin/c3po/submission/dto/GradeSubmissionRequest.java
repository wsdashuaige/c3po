package fin.c3po.submission.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class GradeSubmissionRequest {

    @NotNull
    @Min(0)
    @Max(100)
    private Integer score;

    @Size(max = 4096)
    private String feedback;

    @Valid
    private List<RubricScore> rubricScores = new ArrayList<>();

    private boolean publish = true;

    @Getter
    @Setter
    public static class RubricScore {
        @NotNull
        private String criterion;
        @NotNull
        @Min(0)
        private Integer score;
    }
}


