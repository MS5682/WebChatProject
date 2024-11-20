package com.sms.webchat.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import com.sms.webchat.service.EmailVerificationService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {
    private final EmailVerificationService emailVerificationService;
    private final Logger logger = LoggerFactory.getLogger(ApiController.class);

    @GetMapping("/hello")
    public String hello() {
        logger.info("react 서버 연결 성공");
        return "Hello from Spring Boot!";
    }

    @PostMapping("/email/send-verification")
    public ResponseEntity<String> sendVerificationEmail(@RequestParam String email) {
        try {
            emailVerificationService.sendVerificationEmail(email);
            return ResponseEntity.ok("인증 코드가 전송되었습니다.");
        } catch (Exception e) {
            logger.error("이메일 전송 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/email/verify")
    public ResponseEntity<String> verifyEmail(
            @RequestParam String email,
            @RequestParam String code) {
        if (emailVerificationService.verifyEmail(email, code)) {
            return ResponseEntity.ok("이메일이 인증되었습니다.");
        }
        return ResponseEntity.badRequest().body("잘못된 인증 코드이거나 만료되었습니다.");
    }
} 