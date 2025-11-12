package fin.c3po.course;

import fin.c3po.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "course_resources")
public class CourseResource extends BaseEntity {

    @Column(nullable = false)
    private UUID moduleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private CourseResourceType type = CourseResourceType.OTHER;

    @Column(nullable = false, length = 128)
    private String name;

    private Long fileSize;

    @Column(length = 2048)
    private String downloadUrl;
}


