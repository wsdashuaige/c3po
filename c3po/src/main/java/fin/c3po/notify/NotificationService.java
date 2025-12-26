package fin.c3po.notify;

import fin.c3po.selection.CourseSelection;
import fin.c3po.selection.CourseSelectionRepository;
import fin.c3po.selection.SelectionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CourseSelectionRepository courseSelectionRepository;

    /**
     * 创建并发送通知
     */
    @Transactional
    public Notification createAndSendNotification(String targetType, String title, String content,
                                                   List<NotificationChannel> channels) {
        Notification notification = new Notification();
        notification.setTargetType(targetType);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setSendChannels(channels != null ? new ArrayList<>(channels) : List.of(NotificationChannel.INBOX));
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(Instant.now());
        return notificationRepository.save(notification);
    }

    /**
     * 通知课程的所有选课学生
     */
    @Transactional
    public void notifyEnrolledStudents(UUID courseId, String targetType, String title, String content) {
        List<CourseSelection> enrollments = courseSelectionRepository.findByCourseIdAndStatus(
                courseId, SelectionStatus.ENROLLED);
        
        if (enrollments.isEmpty()) {
            log.debug("No enrolled students found for course {}", courseId);
            return;
        }

        List<NotificationChannel> channels = List.of(NotificationChannel.INBOX);
        Notification notification = createAndSendNotification(targetType, title, content, channels);
        
        log.info("Created notification {} for {} enrolled students in course {}", 
                notification.getId(), enrollments.size(), courseId);
    }

    /**
     * 通知单个学生
     */
    @Transactional
    public void notifyStudent(UUID studentId, String targetType, String title, String content) {
        List<NotificationChannel> channels = List.of(NotificationChannel.INBOX);
        Notification notification = createAndSendNotification(targetType, title, content, channels);
        
        log.info("Created notification {} for student {}", notification.getId(), studentId);
    }

    /**
     * 通知教师
     */
    @Transactional
    public void notifyTeacher(UUID teacherId, String targetType, String title, String content) {
        List<NotificationChannel> channels = List.of(NotificationChannel.INBOX);
        Notification notification = createAndSendNotification(targetType, title, content, channels);
        
        log.info("Created notification {} for teacher {}", notification.getId(), teacherId);
    }
}

