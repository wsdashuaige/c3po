package fin.c3po.report.dto;

import fin.c3po.report.ReportJobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class CreateReportJobRequest {

    @NotNull
    private ReportJobType jobType;

    @NotNull
    private Map<String, Object> params;

    private Map<String, Object> options;

    @Size(max = 3)
    private String[] notifyChannels;
}


