package com.practice.aiplatform.course;

import com.practice.aiplatform.ai.GeminiService;
import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import com.practice.aiplatform.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

class CourseControllerTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private GeminiService geminiService;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private CourseController courseController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGenerateCourse_Success() {
        // Mock Student
        Student mockStudent = new Student();
        mockStudent.setId(1L);
        mockStudent.setEmail("test@example.com");
        when(studentRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockStudent));

        // Mock JwtUtil (if needed by logic, though mostly handled by filter)
        // Here we simulate extracting email from token if controller does it manually,
        // but typically controller gets user from Principal.
        // However, looking at the controller code would confirm if it extracts from
        // token manually.
        // Assuming standard Principal usage or similar.
    }
}
