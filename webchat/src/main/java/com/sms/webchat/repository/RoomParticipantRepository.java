package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.RoomParticipant;
import com.sms.webchat.entity.User;
import com.sms.webchat.entity.ChatRoom;
import java.util.List;
import java.util.Optional;

public interface RoomParticipantRepository extends JpaRepository<RoomParticipant, Long> {
    List<RoomParticipant> findByUser(User user);
    List<RoomParticipant> findByRoom(ChatRoom room);
    Optional<RoomParticipant> findByRoomIdAndUserIdx(Long roomId, Long userIdx);
    List<RoomParticipant> findAllByRoomId(Long roomId);
    int countByRoomId(Long roomId);
} 