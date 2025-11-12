package fin.c3po.admin.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PlatformMetricsResponse {
    long totalUsers;
    long totalCourses;
    long activeCourses;
    long totalAssignments;
    long pendingApprovals;
}


