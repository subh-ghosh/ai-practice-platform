package com.practice.aiplatform.practice;

// --- ADD THESE IMPORTS ---
import com.practice.aiplatform.user.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
// -------------------------

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findAllByStudentOrderBySubmittedAtDesc(Student student);

    /**
     * Finds all "gradable" answers for a student, ordered by submission time
     * ascending.
     * We get them in ASC order to build the timeline from start to finish.
     */
    List<Answer> findAllByStudentAndEvaluationStatusInOrderBySubmittedAtAsc(Student student, List<String> statuses);

    List<Answer> findTop20ByStudentOrderBySubmittedAtDesc(Student student);

    @Query("select a from Answer a join fetch a.question q where a.student.id = :studentId order by a.submittedAt desc")
    List<Answer> findAllWithQuestionByStudentIdOrderBySubmittedAtDesc(@Param("studentId") Long studentId);

    @Query("""
            select a from Answer a
            join fetch a.question q
            where a.student.id = :studentId and a.evaluationStatus in :statuses
            order by a.submittedAt asc
            """)
    List<Answer> findAllWithQuestionByStudentIdAndEvaluationStatusInOrderBySubmittedAtAsc(
            @Param("studentId") Long studentId,
            @Param("statuses") List<String> statuses
    );

    long deleteByStudentId(Long studentId);

}
