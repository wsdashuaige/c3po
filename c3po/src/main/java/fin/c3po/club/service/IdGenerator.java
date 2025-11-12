package fin.c3po.club.service;

import java.util.concurrent.atomic.AtomicInteger;

public class IdGenerator {
	private final AtomicInteger counter = new AtomicInteger(0);

	public int nextId() {
		return counter.incrementAndGet();
	}
}


