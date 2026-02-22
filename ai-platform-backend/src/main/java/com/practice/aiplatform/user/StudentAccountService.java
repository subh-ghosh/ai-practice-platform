package com.practice.aiplatform.user;

import com.practice.aiplatform.course.Course;
import com.practice.aiplatform.course.CourseRepository;
import com.practice.aiplatform.gamification.DailyChallengeRepository;
import com.practice.aiplatform.gamification.DailyXpHistoryRepository;
import com.practice.aiplatform.gamification.UserBadgeRepository;
import com.practice.aiplatform.notifications.NotificationRepository;
import com.practice.aiplatform.practice.AnswerRepository;
import com.practice.aiplatform.practice.QuestionRepository;
import com.practice.aiplatform.security.RefreshTokenService;
import com.practice.aiplatform.studyplan.StudyPlan;
import com.practice.aiplatform.studyplan.StudyPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentAccountService {

    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;
    private final DailyChallengeRepository dailyChallengeRepository;
    private final DailyXpHistoryRepository dailyXpHistoryRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final CourseRepository courseRepository;
    private final StudyPlanRepository studyPlanRepository;
    private final RefreshTokenService refreshTokenService;

    public StudentAccountService(
            StudentRepository studentRepository,
            NotificationRepository notificationRepository,
            DailyChallengeRepository dailyChallengeRepository,
            DailyXpHistoryRepository dailyXpHistoryRepository,
            UserBadgeRepository userBadgeRepository,
            AnswerRepository answerRepository,
            QuestionRepository questionRepository,
            CourseRepository courseRepository,
            StudyPlanRepository studyPlanRepository,
            RefreshTokenService refreshTokenService) {
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.dailyChallengeRepository = dailyChallengeRepository;
        this.dailyXpHistoryRepository = dailyXpHistoryRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.courseRepository = courseRepository;
        this.studyPlanRepository = studyPlanRepository;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public void deleteAccountByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Long studentId = student.getId();

        notificationRepository.deleteByStudentId(studentId);
        refreshTokenService.deleteByUserId(studentId);
        dailyChallengeRepository.deleteByStudentId(studentId);
        dailyXpHistoryRepository.deleteByStudentId(studentId);
        answerRepository.deleteByStudentId(studentId);
        questionRepository.deleteByStudentId(studentId);
        userBadgeRepository.deleteByStudentId(studentId);

        List<Course> courses = courseRepository.findByStudentId(studentId);
        if (!courses.isEmpty()) {
            courseRepository.deleteAll(courses);
        }

        List<StudyPlan> studyPlans = studyPlanRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        if (!studyPlans.isEmpty()) {
            studyPlanRepository.deleteAll(studyPlans);
        }

        studentRepository.delete(student);
    }
}
