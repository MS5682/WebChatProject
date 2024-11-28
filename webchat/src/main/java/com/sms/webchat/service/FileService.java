package com.sms.webchat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import com.sms.webchat.dto.response.FileResponseDto;

@Service
public class FileService {
    @Value("${file.upload.dir}")
    private String uploadDir;
    
    public FileResponseDto uploadFile(MultipartFile file, String roomId) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        File directory = new File(uploadDir + "/" + roomId);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        Path filePath = Paths.get(directory.getAbsolutePath(), fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        String fileUrl = "/files/" + roomId + "/" + fileName;
        
        return new FileResponseDto(
            file.getOriginalFilename(),
            fileUrl,
            file.getContentType()
        );
    }
}
