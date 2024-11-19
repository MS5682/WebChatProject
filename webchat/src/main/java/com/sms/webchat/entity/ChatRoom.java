package com.sms.webchat.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.sms.webchat.enums.RoomType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_rooms")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;
    
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;  // PRIVATE_CHAT, PUBLIC_GROUP, PROTECTED_GROUP
    
    private String password;  // PROTECTED_GROUP인 경우에만 사용
    
    @Column(nullable = false)
    private int maxParticipants;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;  // 채팅방 활성화 상태
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    @Builder.Default
    private List<RoomParticipant> participants = new ArrayList<>();
    
    // 현재 참여자 수 조회
    public int getCurrentParticipants() {
        return participants.size();
    }
    
    // 참가 가능 여부 확인
    public boolean canJoin() {
        return isActive && getCurrentParticipants() < maxParticipants;
    }
    
    // 채팅방 비활성화
    public void deactivate() {
        this.isActive = false;
    }
    
    // 채팅방 활성화
    public void activate() {
        this.isActive = true;
    }
} 