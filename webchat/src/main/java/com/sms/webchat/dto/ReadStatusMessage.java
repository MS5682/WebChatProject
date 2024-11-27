package com.sms.webchat.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ReadStatusMessage {
    private Long userIdx;
    private String lastReadTime;
} 