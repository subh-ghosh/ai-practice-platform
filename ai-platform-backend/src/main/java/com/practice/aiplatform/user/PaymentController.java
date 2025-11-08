package com.practice.aiplatform.user;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.practice.aiplatform.security.JwtUtil; // 👈 --- ADD THIS IMPORT

import java.security.Principal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final StudentRepository studentRepository;
    private final JwtUtil jwtUtil; // 👈 --- ADD THIS

    public PaymentController(StudentRepository studentRepository, JwtUtil jwtUtil) { // 👈 --- UPDATE CONSTRUCTOR
        this.studentRepository = studentRepository;
        this.jwtUtil = jwtUtil; // 👈 --- ADD THIS
    }

    // A simple map to define your plans
    private static final Map<String, Integer> PLANS = Map.of(
            "premium_monthly", 19900, // ₹199.00 in paise
            "premium_yearly", 199900  // ₹1999.00 in paise
    );

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Principal principal) {
        // ... (This method remains unchanged)
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Integer amount = PLANS.get(request.productId());
        if (amount == null) {
            return ResponseEntity.badRequest().body("Invalid plan ID.");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_order_" + student.getId());

            JSONObject notes = new JSONObject();
            notes.put("studentEmail", student.getEmail());
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);

            CreateOrderResponse response = new CreateOrderResponse(
                    order.get("id"),
                    razorpayKeyId,
                    request.productId(),
                    amount.toString(),
                    "INR",
                    student.getFirstName(),
                    student.getEmail()
            );

            return ResponseEntity.ok(response);

        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request, Principal principal) { // 👈 --- Return type changed to ResponseEntity<?>
        Student student = studentRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.razorpay_order_id());
            options.put("razorpay_payment_id", request.razorpay_payment_id());
            options.put("razorpay_signature", request.razorpay_signature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                // --- Payment is Verified ---
                // 1. Update student's subscription status in your database
                student.setSubscriptionStatus("PREMIUM");
                student.setSubscriptionEndsAt(LocalDate.now().plusMonths(1));
                student.setFreeActionsUsed(0); // Reset free counter
                Student savedStudent = studentRepository.save(student);

                // 2. Return the UPDATED StudentDto (with a fresh token)
                String token = jwtUtil.generateToken(savedStudent);
                StudentDto updatedDto = new StudentDto(
                        savedStudent.getId(),
                        savedStudent.getEmail(),
                        savedStudent.getFirstName(),
                        savedStudent.getLastName(),
                        savedStudent.getGender(),
                        token,
                        savedStudent.getSubscriptionStatus(),
                        savedStudent.getFreeActionsUsed()
                );

                return ResponseEntity.ok(updatedDto); // 👈 --- RETURN THE NEW DTO
            } else {
                // --- Payment Verification Failed ---
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("status", "error", "message", "Invalid payment signature."));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", "Error verifying payment: " + e.getMessage()));
        }
    }
}