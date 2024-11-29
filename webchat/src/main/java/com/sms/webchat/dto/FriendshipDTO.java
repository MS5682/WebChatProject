package com.sms.webchat.dto;

import java.time.LocalDateTime;
import com.sms.webchat.enums.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipDTO {
    private Long id;
    private Long fromUserIdx;
    private String fromUserId;
    private String fromUserName;
    private Long toUserIdx;
    private String toUserId;
    private String toUserName;
    private FriendshipStatus status;
    private LocalDateTime createdAt;
} 