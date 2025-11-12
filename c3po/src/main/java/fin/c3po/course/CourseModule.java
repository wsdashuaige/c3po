package fin.c3po.course;

import fin.c3po.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "course_modules")
public class CourseModule extends BaseEntity {

    @Column(nullable = false)
    private UUID courseId;

    @Column(nullable = false, length = 128)
    private String title;

    @Column(nullable = false)
    private Integer displayOrder;

    private Instant releaseAt;
}


