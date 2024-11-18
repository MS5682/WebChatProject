package com.sms.webchat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;

import java.time.LocalDateTime;
import java.util.List;
import com.sms.webchat.enums.RoomType;

@Entity
@Table(name = "chat_rooms")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roomId;
    
    @Column(nullable = false)
    private String roomName;
    
    @Enumerated(EnumType.STRING)
    private RoomType roomType; // INDIVIDUAL, GROUP
    
    private boolean isPublic;
    
    private String password;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    private boolean isActive;
    
    @OneToMany(mappedBy = "chatRoom")
    private List<RoomParticipant> participants;
    
    @Column(nullable = false)
    private Integer maxParticipants;
    
    @Formula("(SELECT COUNT(*) FROM room_participants rp WHERE rp.room_id = room_id AND rp.is_active = true)")
    private Integer currentParticipants;
    
    public boolean canJoin() {
        return currentParticipants < maxParticipants;
    }
} 