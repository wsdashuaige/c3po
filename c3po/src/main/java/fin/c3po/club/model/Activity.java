package fin.c3po.club.model;

import lombok.Data;

@Data
public class Activity {
	private Integer id;
	private String name;
	private String description;
	private String startTime;
	private String endTime;
	private String location;
	private Integer maxParticipants;
	private String status;
	private String createdBy;
}


