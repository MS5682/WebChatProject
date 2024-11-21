package com.sms.webchat.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import com.sms.webchat.service.EmailVerificationService;
import com.sms.webchat.service.UserService;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {
    private final EmailVerificationService emailVerificationService;
    private final UserService userService;
    private final Logger logger = LoggerFactory.getLogger(EmailController.class);


    @PostMapping("/send-verification")
    public ResponseEntity<String> sendVerificationEmail(@RequestParam String email) {
        try {
            emailVerificationService.sendVerificationEmail(email);
            return ResponseEntity.ok("인증 코드가 전송되었습니다.");
        } catch (Exception e) {
            logger.error("이메일 전송 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyEmail(
            @RequestParam String email,
            @RequestParam String code) {
        if (emailVerificationService.verifyEmail(email, code)) {
            return ResponseEntity.ok("이메일이 인증되었습니다.");
        }
        return ResponseEntity.badRequest().body("잘못된 인증 코드이거나 만료되었습니다.");
    }

    @PostMapping("/find-id/send-email")
    public ResponseEntity<?> sendFindIdEmail(@RequestParam String email) {
        try {
            userService.sendFindIdVerificationEmail(email);
            return ResponseEntity.ok("인증 메일이 발송되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/find-id/verify")
    public ResponseEntity<?> findUserId(@RequestParam String email, @RequestParam String code) {
        try {
            String userId = userService.findUserIdByEmailVerification(email, code);
            return ResponseEntity.ok(userId);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/change-password/send-email")
    public ResponseEntity<?> sendChangePasswordEmail(
            @RequestParam String email,
            @RequestParam String userId) {
        try {
            // 이메일과 아이디가 일치하는 사용자 확인
            if (!userService.validateUserEmailAndId(email, userId)) {
                return ResponseEntity.badRequest().body("일치하는 사용자 정보가 없습니다.");
            }
            
            emailVerificationService.sendChangePasswordVerificationEmail(email);
            return ResponseEntity.ok("인증 메일이 발송되었습니다.");
        } catch (RuntimeException e) {
            logger.error("이메일 전송 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/change-password/verify")
    public ResponseEntity<?> verifyChangePasswordEmail(
            @RequestParam String email,
            @RequestParam String code) {
        if (emailVerificationService.verifyChangePasswordEmail(email, code)) {
            return ResponseEntity.ok("이메일이 인증되었습니다.");
        }
        return ResponseEntity.badRequest().body("잘못된 인증 코드이거나 만료되었습니다.");
    }

} 