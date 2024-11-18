package com.sms.webchat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_attachments")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageAttachment {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;
    
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
} 