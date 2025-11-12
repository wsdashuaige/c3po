package fin.c3po.club.model;

import lombok.Data;

@Data
public class Application {
	private Integer id;
	private String applicantName;
	private String applicantId;
	private String contactInfo;
	private String eventName;
	private String eventDate;
	private String location;
	private String reason;
	private String applicationTime;
	private String status;
	private String processorName;
	private String processComment;
}


