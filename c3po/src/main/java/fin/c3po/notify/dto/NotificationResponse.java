package fin.c3po.notify.dto;

import fin.c3po.notify.NotificationChannel;
import fin.c3po.notify.NotificationStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Value
@Builder
public class NotificationResponse {
    UUID id;
    String targetType;
    String title;
    String content;
    List<NotificationChannel> sendChannels;
    NotificationStatus status;
    Instant sentAt;
    Instant createdAt;
    Instant updatedAt;
}


