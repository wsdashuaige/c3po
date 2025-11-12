package fin.c3po.approval.dto;

import fin.c3po.approval.ApprovalStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprovalDecisionRequest {

    @NotNull
    private ApprovalStatus status;

    @Size(max = 1024)
    private String comment;
}


