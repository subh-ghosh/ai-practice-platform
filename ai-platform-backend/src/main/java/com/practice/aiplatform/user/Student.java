package com.practice.aiplatform.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.practice.aiplatform.practice.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
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

    // --- Payment & Usage ---

    @Column(nullable = false)
    private int freeActionsUsed = 0;

    @Column(nullable = false)
    private String subscriptionStatus = "FREE";

    @Column
    private String paymentCustomerId;

    @Column
    private LocalDate subscriptionEndsAt;

    // --- Gamification ---
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int totalXp = 0;

    @Column(nullable = false, columnDefinition = "integer default 1")
    private int streakDays = 1;

    @Column
    private LocalDate lastLoginDate;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Question> questions;

    public Student(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.subscriptionStatus = "FREE";
        this.freeActionsUsed = 0;
    }
}