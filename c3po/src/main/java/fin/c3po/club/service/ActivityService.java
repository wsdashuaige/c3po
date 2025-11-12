package fin.c3po.club.service;

import fin.c3po.club.dto.CommonListResponse;
import fin.c3po.club.model.Activity;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class ActivityService {
	private final Map<Integer, Activity> storage = new ConcurrentHashMap<>();
	private final IdGenerator idGen = new IdGenerator();

	public Activity create(Activity toCreate) {
		int id = idGen.nextId();
		toCreate.setId(id);
		storage.put(id, toCreate);
		return toCreate;
	}

	public Activity get(int id) {
		return storage.get(id);
	}

	public Activity update(int id, Activity changes) {
		Activity existing = storage.get(id);
		if (existing == null) return null;
		if (changes.getName() != null) existing.setName(changes.getName());
		if (changes.getDescription() != null) existing.setDescription(changes.getDescription());
		if (changes.getStartTime() != null) existing.setStartTime(changes.getStartTime());
		if (changes.getEndTime() != null) existing.setEndTime(changes.getEndTime());
		if (changes.getLocation() != null) existing.setLocation(changes.getLocation());
		if (changes.getMaxParticipants() != null) existing.setMaxParticipants(changes.getMaxParticipants());
		if (changes.getStatus() != null) existing.setStatus(changes.getStatus());
		if (changes.getCreatedBy() != null) existing.setCreatedBy(changes.getCreatedBy());
		return existing;
	}

	public boolean delete(int id) {
		return storage.remove(id) != null;
	}

	public CommonListResponse<Activity> list(int page, int limit) {
		List<Activity> all = new ArrayList<>(storage.values());
		all.sort(Comparator.comparing(Activity::getId));
		int from = Math.max(0, (page - 1) * limit);
		int to = Math.min(all.size(), from + limit);
		List<Activity> items = from >= all.size() ? List.of() : all.subList(from, to);
		return new CommonListResponse<>(all.size(), items);
	}

	public Map<String, Object> stats() {
		long total = storage.size();
		long approved = storage.values().stream().filter(a -> "approved".equalsIgnoreCase(a.getStatus())).count();
		long pending = storage.values().stream().filter(a -> "pending".equalsIgnoreCase(a.getStatus())).count();
		long completed = storage.values().stream().filter(a -> "completed".equalsIgnoreCase(a.getStatus())).count();
		return Map.of(
			"total", total,
			"approved", approved,
			"pending", pending,
			"completed", completed
		);
	}
}


