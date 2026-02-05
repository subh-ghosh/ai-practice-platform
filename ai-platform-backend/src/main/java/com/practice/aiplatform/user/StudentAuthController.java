// Force Update
package com.practice.aiplatform.user;

import com.practice.aiplatform.notifications.NotificationService;
import com.practice.aiplatform.security.JwtUtil;
// import com.practice.aiplatform.user.GoogleAuthService; // Uncomment if you have this class
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin // Fixes CORS issues
public class StudentAuthController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    
    // If you haven't created GoogleAuthService yet, comment this line out
    // private final GoogleAuthService googleAuthService; 

    @Autowired
    public StudentAuthController(StudentRepository studentRepository, 
                                 PasswordEncoder passwordEncoder,
                                 JwtUtil jwtUtil,
                                 NotificationService notificationService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
        // this.googleAuthService = googleAuthService;
    }

    // --- 1. REGISTER ---
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (studentRepository.findByEmail(req.email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }

        Student student = new Student();
        student.setEmail(req.email);
        student.setPassword(passwordEncoder.encode(req.password));
        student.setFirstName(req.firstName);
        student.setLastName(req.lastName);
        
        // Set defaults
        student.setFreeActionsUsed(0); 
        student.setSubscriptionStatus("FREE");

        Student savedStudent = studentRepository.save(student);
        
        // Notify
        try {
            notificationService.notify(savedStudent.getId(), "REGISTER", "Welcome! Registration successful.");
        } catch (Exception e) {
            System.out.println("Notification failed: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    // --- 2. LOGIN (Fixed for Frontend) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<Student> studentOpt = studentRepository.findByEmail(req.email);

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (passwordEncoder.matches(req.password, student.getPassword())) {
                
                // Generate Token
                String token = jwtUtil.generateToken(student);

                // Notify
                try {
                    notificationService.notify(student.getId(), "LOGIN", "New login detected.");
                } catch (Exception e) { 
                    // Ignore notification errors during login
                }

                // Return JSON structure that Frontend expects
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("student", student);
                response.put("message", "Login successful");
                
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    // --- 3. GOOGLE LOGIN (Simplified) ---
    /* UNCOMMENT THIS BLOCK ONLY IF YOU HAVE GoogleAuthService READY
       
    @PostMapping("/oauth/google")
    public ResponseEntity<?> handleGoogleLogin(@RequestBody Map<String, String> request) {
        String idToken = request.get("token");
        try {
            // Verify Token with Google
            var payload = googleAuthService.verifyToken(idToken);
            if (payload == null) return ResponseEntity.status(401).body("Invalid Token");

            String email = payload.getEmail();
            Optional<Student> existingUser = studentRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                // LOGIN
                Student student = existingUser.get();
                String jwt = jwtUtil.generateToken(student);
                
                return ResponseEntity.ok(Map.of(
                    "status", "LOGIN_SUCCESS",
                    "token", jwt,
                    "student", student
                ));
            } else {
                // REGISTER NEEDED
                return ResponseEntity.ok(Map.of(
                    "status", "NEEDS_REGISTRATION",
                    "email", email,
                    "firstName", payload.get("given_name"),
                    "lastName", payload.get("family_name")
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Google Auth Failed");
        }
    }
    */

    // --- INNER CLASSES (DTOs) ---
    // Using static inner classes ensures you don't need extra files
    static class RegisterRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String password;
    }

    static class LoginRequest {
        public String email;
        public String password;
    }
}