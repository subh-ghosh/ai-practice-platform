package com.practice.aiplatform.practice;

// --- ADD THESE IMPORTS ---
import com.practice.aiplatform.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
// -------------------------

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findAllByStudentOrderBySubmittedAtDesc(Student student);

    /**
     * Finds all "gradable" answers for a student, ordered by submission time ascending.
     * We get them in ASC order to build the timeline from start to finish.
     */
    List<Answer> findAllByStudentAndEvaluationStatusInOrderBySubmittedAtAsc(Student student, List<String> statuses);

}