package com.sms.webchat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_reads")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRead {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @CreationTimestamp
    private LocalDateTime readAt;
} 