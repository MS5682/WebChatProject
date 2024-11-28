package com.sms.webchat.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDTO {
    private String userIdx;
    private String status; // "ONLINE" or "OFFLINE"
    private List<String> onlineUsers;
} 