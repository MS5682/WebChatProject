package com.sms.webchat.entity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.sms.webchat.repository.*;
import com.sms.webchat.enums.*;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

@SpringBootTest
public class EntityTest {

    @Autowired private UserRepository userRepository;
    @Autowired private ChatRoomRepository chatRoomRepository;
    @Autowired private RoomParticipantRepository roomParticipantRepository;
    @Autowired private MessageRepository messageRepository;
    @Autowired private MessageAttachmentRepository messageAttachmentRepository;
    @Autowired private FriendshipRepository friendshipRepository;

    @Test
    void userTest() {
        User user = User.builder()
                .userId("testUser")
                .name("테스트유저")
                .email("test@test.com")
                .password("password123")
                .build();

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getUserId()).isEqualTo("testUser");
        assertThat(savedUser.getName()).isEqualTo("테스트유저");
        assertThat(savedUser.getEmail()).isEqualTo("test@test.com");
    }

    @Test
    void chatRoomTest() {
        ChatRoom room = ChatRoom.builder()
                .name("테스트방")
                .roomType(RoomType.PUBLIC_GROUP)
                .maxParticipants(10)
                .isActive(true)
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(room);

        assertThat(savedRoom.getName()).isEqualTo("테스트방");
        assertThat(savedRoom.getRoomType()).isEqualTo(RoomType.PUBLIC_GROUP);
        assertThat(savedRoom.getMaxParticipants()).isEqualTo(10);
        assertThat(savedRoom.isActive()).isTrue();
    }

    @Test
    void roomParticipantTest() {
        User user = userRepository.save(User.builder()
                .userId("testUser")
                .name("테스트유저")
                .email("test@test.com")
                .password("password123")
                .build());

        ChatRoom room = chatRoomRepository.save(ChatRoom.builder()
                .name("테스트방")
                .roomType(RoomType.PUBLIC_GROUP)
                .maxParticipants(10)
                .isActive(true)
                .build());

        RoomParticipant participant = RoomParticipant.builder()
                .user(user)
                .room(room)
                .build();

        RoomParticipant savedParticipant = roomParticipantRepository.save(participant);

        assertThat(savedParticipant.getUser().getUserId()).isEqualTo("testUser");
        assertThat(savedParticipant.getRoom().getName()).isEqualTo("테스트방");
    }

    @Test
    void messageAndAttachmentTest() {
        User user = userRepository.save(User.builder()
                .userId("testUser")
                .name("테스트유저")
                .email("test@test.com")
                .password("password123")
                .build());

        ChatRoom room = chatRoomRepository.save(ChatRoom.builder()
                .name("테스트방")
                .roomType(RoomType.PUBLIC_GROUP)
                .maxParticipants(10)
                .isActive(true)
                .build());

        Message message = Message.builder()
                .content("테스트 메시지")
                .sender(user)
                .room(room)
                .build();

        Message savedMessage = messageRepository.save(message);

        MessageAttachment attachment = MessageAttachment.builder()
                .message(savedMessage)
                .url("http://test.com/file.jpg")
                .originalName("file.jpg")
                .size(1024L)
                .type("image/jpeg")
                .build();

        MessageAttachment savedAttachment = messageAttachmentRepository.save(attachment);

        assertThat(savedMessage.getContent()).isEqualTo("테스트 메시지");
        assertThat(savedMessage.getSender().getUserId()).isEqualTo("testUser");
        assertThat(savedMessage.getRoom().getName()).isEqualTo("테스트방");
        assertThat(savedAttachment.getUrl()).isEqualTo("http://test.com/file.jpg");
    }

    @Test
    void friendshipTest() {
        User user1 = userRepository.save(User.builder()
                .userId("user1")
                .name("유저1")
                .email("user1@test.com")
                .password("password123")
                .build());

        User user2 = userRepository.save(User.builder()
                .userId("user2")
                .name("유저2")
                .email("user2@test.com")
                .password("password123")
                .build());

        Friendship friendship = Friendship.builder()
                .fromUser(user1)
                .toUser(user2)
                .status(FriendshipStatus.PENDING)
                .build();

        Friendship savedFriendship = friendshipRepository.save(friendship);

        assertThat(savedFriendship.getFromUser().getUserId()).isEqualTo("user1");
        assertThat(savedFriendship.getToUser().getUserId()).isEqualTo("user2");
        assertThat(savedFriendship.getStatus()).isEqualTo(FriendshipStatus.PENDING);
    }

    @Test
    void createMultipleUsersTest() {
        List<User> savedUsers = new ArrayList<>();
        
        for (int i = 1; i <= 50; i++) {
            User user = User.builder()
                    .userId("user" + i)
                    .name("유저" + i)
                    .email("user" + i + "@test.com")
                    .password("password" + i)
                    .build();
            
            savedUsers.add(userRepository.save(user));
        }

        // 저장된 유저 수 확인
        assertThat(savedUsers).hasSize(50);
        
        // 몇 개의 유저 데이터 확인
        assertThat(savedUsers.get(0).getUserId()).isEqualTo("user1");
        assertThat(savedUsers.get(0).getName()).isEqualTo("유저1");
        assertThat(savedUsers.get(0).getEmail()).isEqualTo("user1@test.com");
        
        assertThat(savedUsers.get(49).getUserId()).isEqualTo("user50");
        assertThat(savedUsers.get(49).getName()).isEqualTo("유저50");
        assertThat(savedUsers.get(49).getEmail()).isEqualTo("user50@test.com");
    }
}
