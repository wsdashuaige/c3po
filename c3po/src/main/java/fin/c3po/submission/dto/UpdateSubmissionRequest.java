package fin.c3po.submission.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateSubmissionRequest {

    @NotEmpty
    @Size(max = 10)
    private List<@Size(max = 2048) String> attachments;
}


