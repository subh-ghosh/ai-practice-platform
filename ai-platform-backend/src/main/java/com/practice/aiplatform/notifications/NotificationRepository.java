package com.practice.aiplatform.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    @Query("select n from Notification n where n.studentId = ?1 and n.readFlag = false order by n.createdAt desc")
    List<Notification> findUnread(Long studentId);

    // --- 👇 NEW BULK UPDATE METHOD ---
    @Modifying
    @Query("UPDATE Notification n SET n.readFlag = true WHERE n.studentId = :studentId")
    void markAllAsRead(Long studentId);
}