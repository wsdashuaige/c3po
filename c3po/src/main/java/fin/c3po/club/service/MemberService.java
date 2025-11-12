package fin.c3po.club.service;

import fin.c3po.club.dto.CommonListResponse;
import fin.c3po.club.model.Member;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class MemberService {
	private final Map<Integer, Member> storage = new ConcurrentHashMap<>();
	private final IdGenerator idGen = new IdGenerator();

	public Member create(Member toCreate) {
		int id = idGen.nextId();
		toCreate.setId(id);
		storage.put(id, toCreate);
		return toCreate;
	}

	public Member get(int id) {
		return storage.get(id);
	}

	public Member update(int id, Member changes) {
		Member existing = storage.get(id);
		if (existing == null) {
			return null;
		}
		if (changes.getName() != null) existing.setName(changes.getName());
		if (changes.getStudentId() != null) existing.setStudentId(changes.getStudentId());
		if (changes.getMajor() != null) existing.setMajor(changes.getMajor());
		if (changes.getJoinDate() != null) existing.setJoinDate(changes.getJoinDate());
		if (changes.getStatus() != null) existing.setStatus(changes.getStatus());
		if (changes.getRole() != null) existing.setRole(changes.getRole());
		if (changes.getEmail() != null) existing.setEmail(changes.getEmail());
		if (changes.getPhone() != null) existing.setPhone(changes.getPhone());
		return existing;
	}

	public boolean delete(int id) {
		return storage.remove(id) != null;
	}

	public CommonListResponse<Member> list(int page, int limit) {
		List<Member> all = new ArrayList<>(storage.values());
		all.sort(Comparator.comparing(Member::getId));
		int from = Math.max(0, (page - 1) * limit);
		int to = Math.min(all.size(), from + limit);
		List<Member> items = from >= all.size() ? List.of() : all.subList(from, to);
		return new CommonListResponse<>(all.size(), items);
	}

	public Map<String, Object> stats() {
		long total = storage.size();
		long active = storage.values().stream().filter(m -> "active".equalsIgnoreCase(m.getStatus())).count();
		long inactive = storage.values().stream().filter(m -> "inactive".equalsIgnoreCase(m.getStatus())).count();
		long pending = storage.values().stream().filter(m -> "pending".equalsIgnoreCase(m.getStatus())).count();
		double averageAttendance = 0.0; // placeholder
		return Map.of(
			"total", total,
			"active", active,
			"inactive", inactive,
			"pending", pending,
			"averageAttendance", averageAttendance
		);
	}
}


