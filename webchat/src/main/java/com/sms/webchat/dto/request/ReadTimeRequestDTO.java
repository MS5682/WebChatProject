package com.sms.webchat.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReadTimeRequestDTO {
    private Long roomId;
    private Long userIdx;
    private String lastReadTime;
} 