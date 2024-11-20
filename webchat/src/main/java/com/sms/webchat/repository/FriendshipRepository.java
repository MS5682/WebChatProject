package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.Friendship;
import com.sms.webchat.entity.User;
import com.sms.webchat.enums.FriendshipStatus;
import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByFromUser(User fromUser);
    List<Friendship> findByToUser(User toUser);
    
    List<Friendship> findByFromUserAndStatus(User fromUser, FriendshipStatus status);
    List<Friendship> findByToUserAndStatus(User toUser, FriendshipStatus status);
    
    boolean existsByFromUserAndToUser(User fromUser, User toUser);
} 