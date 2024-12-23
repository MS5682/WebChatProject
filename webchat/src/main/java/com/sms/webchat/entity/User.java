package com.sms.webchat.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_idx")
    private Long idx;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String password;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private List<RoomParticipant> participatingRooms = new ArrayList<>();
    
    @OneToMany(mappedBy = "fromUser", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Friendship> sentFriendRequests = new ArrayList<>();
    
    @OneToMany(mappedBy = "toUser", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Friendship> receivedFriendRequests = new ArrayList<>();
} 