package com.practice.aiplatform.user;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class StudentLookupService {

    private final StudentRepository studentRepository;

    public StudentLookupService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Cacheable(value = "UserStudentIdCache", key = "#email", sync = true)
    public Long getRequiredStudentId(String email) {
        return studentRepository.findIdByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }
}
