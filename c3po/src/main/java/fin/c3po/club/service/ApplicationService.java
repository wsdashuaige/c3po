package fin.c3po.club.service;

import fin.c3po.club.dto.CommonListResponse;
import fin.c3po.club.model.Application;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class ApplicationService {
	private final Map<Integer, Application> storage = new ConcurrentHashMap<>();
	private final IdGenerator idGen = new IdGenerator();

	public Application create(Application toCreate) {
		int id = idGen.nextId();
		toCreate.setId(id);
		if (toCreate.getStatus() == null) {
			toCreate.setStatus("pending");
		}
		storage.put(id, toCreate);
		return toCreate;
	}

	public Application get(int id) {
		return storage.get(id);
	}

	public Application process(int id, Application changes) {
		Application existing = storage.get(id);
		if (existing == null) return null;
		if (changes.getStatus() != null) existing.setStatus(changes.getStatus());
		if (changes.getProcessorName() != null) existing.setProcessorName(changes.getProcessorName());
		if (changes.getProcessComment() != null) existing.setProcessComment(changes.getProcessComment());
		return existing;
	}

	public boolean delete(int id) {
		return storage.remove(id) != null;
	}

	public CommonListResponse<Application> list(int page, int limit) {
		List<Application> all = new ArrayList<>(storage.values());
		all.sort(Comparator.comparing(Application::getId));
		int from = Math.max(0, (page - 1) * limit);
		int to = Math.min(all.size(), from + limit);
		List<Application> items = from >= all.size() ? List.of() : all.subList(from, to);
		return new CommonListResponse<>(all.size(), items);
	}

	public Map<String, Object> stats() {
		long total = storage.size();
		long pending = storage.values().stream().filter(a -> "pending".equalsIgnoreCase(a.getStatus())).count();
		long approved = storage.values().stream().filter(a -> "approved".equalsIgnoreCase(a.getStatus())).count();
		long rejected = storage.values().stream().filter(a -> "rejected".equalsIgnoreCase(a.getStatus())).count();
		return Map.of(
			"total", total,
			"pending", pending,
			"approved", approved,
			"rejected", rejected
		);
	}
}


