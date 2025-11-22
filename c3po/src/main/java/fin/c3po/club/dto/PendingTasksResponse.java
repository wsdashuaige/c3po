package fin.c3po.club.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PendingTasksResponse {
    long pendingApplications;
    long activityCount;
    long activeMembers;
    long totalMembers;
}

