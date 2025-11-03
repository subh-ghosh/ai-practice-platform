package com.practice.aiplatform.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection: Spring automatically provides the beans
    public StudentController(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Student> registerStudent(@RequestBody Student newStudent) {
        // 1. Check if email already exists
        Optional<Student> existingStudent = studentRepository.findByEmail(newStudent.getEmail());
        if (existingStudent.isPresent()) {
            // If email is in use, return 409 Conflict
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // 2. We MUST hash the password before saving!
        String hashedPassword = passwordEncoder.encode(newStudent.getPassword());
        newStudent.setPassword(hashedPassword);

        // 3. Save the new student to the database
        Student savedStudent = studentRepository.save(newStudent);
        savedStudent.setPassword(null); // Don't send the hash back
        return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);
    }

    @PostMapping("/login")
    public ResponseEntity<Student> loginStudent(@RequestBody LoginRequest loginRequest) {
        // --- START OF NEW DEBUG LOGGING ---
        System.out.println("--- LOGIN ATTEMPT ---");
        System.out.println("Email provided: " + loginRequest.email());

        Optional<Student> studentOptional = studentRepository.findByEmail(loginRequest.email());

        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            String storedHash = student.getPassword();
            System.out.println("User found in database.");
            System.out.println("Stored Hash: " + storedHash);

            String rawPasswordFromRequest = loginRequest.password();
            System.out.println("Raw password from request: " + rawPasswordFromRequest);

            boolean matches = passwordEncoder.matches(rawPasswordFromRequest, storedHash);
            System.out.println("Do they match? " + matches);

            if (matches) {
                System.out.println("Login SUCCESSFUL.");
                System.out.println("---------------------");
                student.setPassword(null); // Don't send hash back
                return ResponseEntity.ok(student);
            } else {
                System.out.println("Login FAILED: Passwords do not match.");
            }
        } else {
            System.out.println("Login FAILED: No user found with that email.");
        }

        System.out.println("---------------------");
        // --- END OF NEW DEBUG LOGGING ---

        // If user not found or password mismatch
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}

