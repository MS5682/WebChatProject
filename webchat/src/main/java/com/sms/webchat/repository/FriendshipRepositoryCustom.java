package com.sms.webchat.repository;

import com.sms.webchat.entity.Friendship;
import java.util.List;
import com.sms.webchat.enums.FriendshipStatus;

public interface FriendshipRepositoryCustom {
    List<Friendship> findFriendships(Long userIdx, FriendshipStatus status);
} 