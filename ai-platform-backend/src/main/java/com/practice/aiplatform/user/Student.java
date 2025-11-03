package com.practice.aiplatform.user;

import com.practice.aiplatform.practice.Question;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor // Creates a default no-argument constructor
@Entity // Tells Spring this class is a database entity
@Table(name = "students") // Maps this class to the "students" table
public class Student {

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments the ID
    private Long id;

    @Column(nullable = false, unique = true) // Ensures email is not null and is unique
    private String email;

    @Column(nullable = false)
    private String password; // This will be the hashed password

    @Column(nullable = false)
    private String firstName;

    private String lastName;

    // --- Relationships ---

    /**
     * This sets up the "one-to-many" side of the relationship.
     * One student can have many questions.
     * 'mappedBy = "student"' tells JPA this is the inverse side of the
     * relationship defined in the Question class's 'student' field.
     * 'cascade = CascadeType.ALL' means if a student is deleted,
     * all their questions are also deleted.
     */
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Question> questions;


    // We'll add a constructor for easy object creation,
    // skipping the 'id' since it's auto-generated.
    public Student(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}

