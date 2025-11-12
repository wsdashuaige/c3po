package fin.c3po.club.model;

import lombok.Data;

@Data
public class Attendance {
	private Integer id;
	private Integer activityId;
	private Integer memberId;
	private String status;
}


