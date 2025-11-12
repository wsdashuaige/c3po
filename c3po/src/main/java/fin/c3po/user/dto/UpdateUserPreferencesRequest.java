package fin.c3po.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserPreferencesRequest {

    @Size(max = 8)
    private String language;

    private Boolean emailNotifications;

    private Boolean smsNotifications;

    private Boolean aiAssistantEnabled;
}


