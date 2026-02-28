package com.practice.aiplatform.user;

import com.practice.aiplatform.course.CourseRepository;
import com.practice.aiplatform.gamification.DailyChallengeRepository;
import com.practice.aiplatform.gamification.DailyXpHistoryRepository;
import com.practice.aiplatform.gamification.UserBadgeRepository;
import com.practice.aiplatform.notifications.NotificationRepository;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.security.RefreshTokenService;
import com.practice.aiplatform.studyplan.StudyPlanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentAccountServiceTest {

    @Mock
    private StudentRepository studentRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private DailyChallengeRepository dailyChallengeRepository;
    @Mock
    private DailyXpHistoryRepository dailyXpHistoryRepository;
    @Mock
    private UserBadgeRepository userBadgeRepository;
    @Mock
    private AnswerRepository answerRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private StudyPlanRepository studyPlanRepository;
    @Mock
    private RefreshTokenService refreshTokenService;

    private StudentAccountService service;

    @BeforeEach
    void setUp() {
        service = new StudentAccountService(
                studentRepository,
                notificationRepository,
                dailyChallengeRepository,
                dailyXpHistoryRepository,
                userBadgeRepository,
                answerRepository,
                questionRepository,
                courseRepository,
                studyPlanRepository,
                refreshTokenService);
    }

    @Test
    void deleteAccountByEmail_deletesStudentLinkedDataThenStudent() {
        String email = "cachedebug@example.com";
        Long studentId = 42L;

        Student student = new Student();
        student.setId(studentId);
        student.setEmail(email);

        when(studentRepository.findByEmail(email)).thenReturn(Optional.of(student));

        service.deleteAccountByEmail(email);

        InOrder ordered = inOrder(
                notificationRepository,
                refreshTokenService,
                dailyChallengeRepository,
                dailyXpHistoryRepository,
                answerRepository,
                questionRepository,
                userBadgeRepository,
                courseRepository,
                studyPlanRepository,
                studentRepository);

        ordered.verify(notificationRepository).deleteByStudentId(studentId);
        ordered.verify(refreshTokenService).deleteByUserId(studentId);
        ordered.verify(dailyChallengeRepository).deleteByStudentId(studentId);
        ordered.verify(dailyXpHistoryRepository).deleteByStudentId(studentId);
        ordered.verify(answerRepository).deleteByStudentId(studentId);
        ordered.verify(questionRepository).deleteByStudentId(studentId);
        ordered.verify(userBadgeRepository).deleteByStudentId(studentId);
        ordered.verify(courseRepository).deleteByStudentId(studentId);
        ordered.verify(studyPlanRepository).deleteByStudentId(studentId);
        ordered.verify(studentRepository).delete(student);
    }

    @Test
    void deleteAccountByEmail_throwsWhenStudentMissing() {
        when(studentRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.deleteAccountByEmail("missing@example.com"));
        verify(studentRepository).findByEmail("missing@example.com");
    }
}
