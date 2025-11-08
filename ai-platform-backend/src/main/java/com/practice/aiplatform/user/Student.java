package com.practice.aiplatform.user;

import com.practice.aiplatform.practice.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate; // 👈 --- ADD THIS IMPORT
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // hashed

    @Column(nullable = false)
    private String firstName;
    private String lastName;

    @Column
    private String gender;

    // --- 👇 NEW FIELDS FOR PAYMENT & USAGE ---

    @Column(nullable = false)
    private int freeActionsUsed = 0; // Default to 0 for new users

    @Column(nullable = false)
    private String subscriptionStatus = "FREE"; // Default to "FREE"

    @Column
    private String paymentCustomerId; // For Stripe/Razorpay customer ID

    @Column
    private LocalDate subscriptionEndsAt; // To know when a subscription expires

    // --- 👆 END OF NEW FIELDS ---

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Question> questions;

    public Student(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        String subscriptionStatus;
        int freeActionsUsed;
    }
}