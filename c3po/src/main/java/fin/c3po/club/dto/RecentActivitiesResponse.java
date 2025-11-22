package fin.c3po.club.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class RecentActivitiesResponse {
    long totalActivities;
    long activeMembers;
    double approvalRate;
}

