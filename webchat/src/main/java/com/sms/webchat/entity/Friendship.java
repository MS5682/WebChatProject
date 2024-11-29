package com.sms.webchat.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.sms.webchat.enums.FriendshipStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "friendships")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "friendship_id")
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_user_idx")
    private User fromUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_user_idx")
    private User toUser;
    
    @Enumerated(EnumType.STRING)
    private FriendshipStatus status;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
} 