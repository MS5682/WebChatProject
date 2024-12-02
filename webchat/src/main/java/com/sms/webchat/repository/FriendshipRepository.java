package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.Friendship;
import com.sms.webchat.entity.User;

public interface FriendshipRepository extends JpaRepository<Friendship, Long>, FriendshipRepositoryCustom {
    boolean existsByFromUserAndToUser(User fromUser, User toUser);
}
