package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.Friendship;
import com.sms.webchat.entity.User;
import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    List<Friendship> findByFromUser(User fromUser);
    List<Friendship> findByToUser(User toUser);
    
    boolean existsByFromUserAndToUser(User fromUser, User toUser);
} 