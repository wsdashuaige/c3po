package fin.c3po.club.web;

import fin.c3po.club.dto.DashboardOverviewResponse;
import fin.c3po.club.dto.PendingTasksResponse;
import fin.c3po.club.dto.RecentActivitiesResponse;
import fin.c3po.club.dto.UsageTrendResponse;
import fin.c3po.club.service.ActivityService;
import fin.c3po.club.service.ApplicationService;
import fin.c3po.club.service.MemberService;
import fin.c3po.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

	private final MemberService memberService;
	private final ActivityService activityService;
	private final ApplicationService applicationService;

	@GetMapping("/overview")
	public ApiResponse<DashboardOverviewResponse> overview() {
		// Calculate metrics from services
		Map<String, Object> memberStats = memberService.stats();
		Map<String, Object> activityStats = activityService.stats();
		Map<String, Object> applicationStats = applicationService.stats();

		long totalMembers = ((Number) memberStats.get("total")).longValue();
		long activeMembers = ((Number) memberStats.get("active")).longValue();
		long totalActivities = ((Number) activityStats.get("total")).longValue();
		long pendingApplications = ((Number) applicationStats.get("pending")).longValue();

		DashboardOverviewResponse response = DashboardOverviewResponse.builder()
			.totalMembers(totalMembers)
			.activeMembers(activeMembers)
			.totalActivities(totalActivities)
			.pendingApplications(pendingApplications)
			.build();

		return ApiResponse.success(response);
	}

	@GetMapping("/recent-activities")
	public ApiResponse<RecentActivitiesResponse> recentActivities() {
		Map<String, Object> activityStats = activityService.stats();
		Map<String, Object> memberStats = memberService.stats();
		Map<String, Object> applicationStats = applicationService.stats();

		long totalActivities = ((Number) activityStats.get("total")).longValue();
		long activeMembers = ((Number) memberStats.get("active")).longValue();
		
		// Calculate approval rate
		long totalApplications = ((Number) applicationStats.get("total")).longValue();
		long approvedApplications = ((Number) applicationStats.get("approved")).longValue();
		double approvalRate = totalApplications > 0 
			? (approvedApplications * 100.0 / totalApplications) 
			: 0.0;

		RecentActivitiesResponse response = RecentActivitiesResponse.builder()
			.totalActivities(totalActivities)
			.activeMembers(activeMembers)
			.approvalRate(approvalRate)
			.build();

		return ApiResponse.success(response);
	}

	@GetMapping("/pending-tasks")
	public ApiResponse<PendingTasksResponse> pendingTasks() {
		Map<String, Object> applicationStats = applicationService.stats();
		Map<String, Object> activityStats = activityService.stats();
		Map<String, Object> memberStats = memberService.stats();

		long pendingApplications = ((Number) applicationStats.get("pending")).longValue();
		long activityCount = ((Number) activityStats.get("total")).longValue();
		long activeMembers = ((Number) memberStats.get("active")).longValue();
		long totalMembers = ((Number) memberStats.get("total")).longValue();

		PendingTasksResponse response = PendingTasksResponse.builder()
			.pendingApplications(pendingApplications)
			.activityCount(activityCount)
			.activeMembers(activeMembers)
			.totalMembers(totalMembers)
			.build();

		return ApiResponse.success(response);
	}

	@GetMapping("/usage-trend")
	public ApiResponse<UsageTrendResponse> usageTrend(
			@RequestParam(value = "days", defaultValue = "7") int days) {
		
		// Generate dates for the last N days
		List<String> dates = new ArrayList<>();
		List<Double> activeUsers = new ArrayList<>();
		List<Double> courseVisits = new ArrayList<>();
		List<Double> assignmentSubmissions = new ArrayList<>();

		LocalDate today = LocalDate.now();
		for (int i = days - 1; i >= 0; i--) {
			LocalDate date = today.minusDays(i);
			dates.add(date.toString());

			// For now, generate mock data based on existing data
			// In a real implementation, these would come from database queries
			Map<String, Object> memberStats = memberService.stats();
			long totalMembers = ((Number) memberStats.get("total")).longValue();
			
			// Mock data: simulate daily active users (60-80% of total)
			double mockActiveUsers = totalMembers > 0 
				? (65 + (i % 5) * 2.5)  // Range: 65-75%
				: 0.0;
			activeUsers.add(mockActiveUsers);

			// Mock course visits (currently low)
			courseVisits.add(0.0);

			// Mock assignment submissions (currently low)
			assignmentSubmissions.add(0.0);
		}

		UsageTrendResponse response = UsageTrendResponse.builder()
			.dates(dates)
			.activeUsers(activeUsers)
			.courseVisits(courseVisits)
			.assignmentSubmissions(assignmentSubmissions)
			.build();

		return ApiResponse.success(response);
	}
}


