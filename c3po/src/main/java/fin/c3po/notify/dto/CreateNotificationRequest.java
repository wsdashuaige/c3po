package fin.c3po.notify.dto;

import fin.c3po.notify.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CreateNotificationRequest {

    @NotBlank
    @Size(max = 32)
    private String targetType;

    @NotBlank
    @Size(max = 128)
    private String title;

    @NotBlank
    @Size(max = 4096)
    private String content;

    @NotEmpty
    private List<NotificationChannel> sendChannels = new ArrayList<>();
}


