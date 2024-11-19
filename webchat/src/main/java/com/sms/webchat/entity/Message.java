package com.sms.webchat.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "messages")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private ChatRoom room;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;
    
    @Column(nullable = false)
    private String content;
    
    @OneToOne(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private MessageAttachment attachment;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    // 메시지 만료 시간 (예: 30일 후 자동 삭제)
    private LocalDateTime expiresAt;
    
    @PrePersist
    public void setExpiresAt() {
        // 메시지 생성 시 30일 후로 만료 시간 설정
        this.expiresAt = LocalDateTime.now().plusDays(30);
    }
} 