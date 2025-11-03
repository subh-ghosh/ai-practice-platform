package com.practice.aiplatform.user;

// --- ADD THIS IMPORT ---
import com.practice.aiplatform.security.JwtUtil;
// -----------------------

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

// --- ADD THIS DTO (can be in this file or its own .java file) ---
// This record defines the JSON object we will send back on successful login
record LoginResponse(Long id, String email, String firstName, String token) {}
// ----------------------------------------------------------------

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    // --- INJECT JWTUTIL ---
    private final JwtUtil jwtUtil;

    // Constructor Injection: Spring automatically provides the beans
    public StudentController(StudentRepository studentRepository,
                             PasswordEncoder passwordEncoder,
                             JwtUtil jwtUtil) { // Add JwtUtil to the constructor
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil; // Add this line
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

    // --- THIS IS THE UPDATED /login METHOD ---
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginStudent(@RequestBody LoginRequest loginRequest) {

        // --- START OF DEBUG LOGGING (can be removed later) ---
        System.out.println("--- LOGIN ATTEMPT ---");
        System.out.println("Email provided: " + loginRequest.email());
        // --- END OF DEBUG LOGGING ---

        Optional<Student> studentOptional = studentRepository.findByEmail(loginRequest.email());

        if (studentOptional.isPresent()) {
            Student student = studentOptional.get();
            String storedHash = student.getPassword();
            String rawPasswordFromRequest = loginRequest.password();

            // --- START OF DEBUG LOGGING (can be removed later) ---
            System.out.println("User found in database.");
            System.out.println("Stored Hash: " + storedHash);
            // --- END OF DEBUG LOGGING ---

            if (passwordEncoder.matches(rawPasswordFromRequest, storedHash)) {

                // --- START OF NEW JWT LOGIC ---
                // 1. Generate a JWT token
                String token = jwtUtil.generateToken(student);
                System.out.println("Login SUCCESSFUL. Token generated: " + token);

                // 2. Create the response object
                LoginResponse response = new LoginResponse(
                        student.getId(),
                        student.getEmail(),
                        student.getFirstName(),
                        token
                );

                // 3. Return the response with the token
                return ResponseEntity.ok(response);
                // --- END OF NEW JWT LOGIC ---
            } else {
                System.out.println("Login FAILED: Passwords do not match.");
            }
        } else {
            System.out.println("Login FAILED: No user found with that email.");
        }

        System.out.println("---------------------");
        // If user not found or password mismatch
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}