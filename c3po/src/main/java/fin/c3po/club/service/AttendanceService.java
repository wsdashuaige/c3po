package fin.c3po.club.service;

import fin.c3po.club.dto.CommonListResponse;
import fin.c3po.club.model.Attendance;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {
	private final Map<Integer, Attendance> storage = new ConcurrentHashMap<>();
	private final IdGenerator idGen = new IdGenerator();

	public Attendance create(Attendance toCreate) {
		int id = idGen.nextId();
		toCreate.setId(id);
		storage.put(id, toCreate);
		return toCreate;
	}

	public CommonListResponse<Attendance> listByActivity(int activityId, int page, int limit) {
		List<Attendance> filtered = storage.values().stream()
			.filter(a -> a.getActivityId() != null && a.getActivityId() == activityId)
			.sorted(Comparator.comparing(Attendance::getId))
			.collect(Collectors.toList());
		int from = Math.max(0, (page - 1) * limit);
		int to = Math.min(filtered.size(), from + limit);
		List<Attendance> items = from >= filtered.size() ? List.of() : filtered.subList(from, to);
		return new CommonListResponse<>(filtered.size(), new ArrayList<>(items));
	}
}


