package fin.c3po.user.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserPreferencesResponse {
    String language;
    boolean emailNotifications;
    boolean smsNotifications;
    boolean aiAssistantEnabled;
}


