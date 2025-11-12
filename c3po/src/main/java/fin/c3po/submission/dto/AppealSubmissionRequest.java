package fin.c3po.submission.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppealSubmissionRequest {

    @NotBlank
    @Size(max = 2048)
    private String reason;
}


