package fin.c3po.club.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class DashboardOverviewResponse {
    long totalMembers;
    long activeMembers;
    long totalActivities;
    long pendingApplications;
}

