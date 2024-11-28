package com.sms.webchat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FileResponseDto {
    private String fileName;
    private String fileUrl;
    private String fileType;
} 
