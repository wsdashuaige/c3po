package fin.c3po.profile;

import fin.c3po.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "teacher_profiles")
public class TeacherProfile extends BaseEntity {

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 32)
    private String teacherNo;

    @Column(length = 64)
    private String department;

    @Column(length = 64)
    private String title;

    @Column(length = 512)
    private String subjects; // CSV text or JSON string (kept simple for data layer)
}


