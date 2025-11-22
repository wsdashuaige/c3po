package fin.c3po.club.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class UsageTrendResponse {
    List<String> dates;
    List<Double> activeUsers;
    List<Double> courseVisits;
    List<Double> assignmentSubmissions;
}

