package com.practice.aiplatform.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // 👈 Import this
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Query("select n from Notification n where n.studentId = :studentId and n.readFlag = false order by n.createdAt desc")
    List<Notification> findUnread(@Param("studentId") Long studentId);

    // Bulk update for "Mark All as Read"
    @Modifying
    @Query("UPDATE Notification n SET n.readFlag = true WHERE n.studentId = :studentId")
    void markAllAsRead(@Param("studentId") Long studentId);
}