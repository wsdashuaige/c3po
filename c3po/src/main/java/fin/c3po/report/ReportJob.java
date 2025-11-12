package fin.c3po.report;

import fin.c3po.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "report_jobs")
public class ReportJob extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private ReportJobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ReportJobStatus status = ReportJobStatus.QUEUED;

    @Column(length = 2048)
    private String params; // JSON string of parameters

    private Instant completedAt;

    @Column(length = 2048)
    private String resultUrl;
}


