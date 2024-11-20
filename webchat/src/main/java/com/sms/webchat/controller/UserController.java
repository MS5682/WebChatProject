package com.sms.webchat.controller;

import com.sms.webchat.dto.request.SignupRequestDto;
import com.sms.webchat.dto.response.ApiResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sms.webchat.entity.User;
import com.sms.webchat.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequestDto request) {
        try {
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            User user = request.toEntity(encodedPassword);
            userService.signup(user);
            
            return ResponseEntity.ok().body(new ApiResponseDto(true, "회원가입이 완료되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<?> checkUserIdDuplicate(@PathVariable String userId) {
        try {
            boolean isDuplicate = userService.checkUserIdDuplicate(userId);
            
            return ResponseEntity.ok().body(new ApiResponseDto(!isDuplicate, 
                isDuplicate ? "이미 사용중인 아이디입니다." : "사용 가능한 아이디입니다."));
        } catch (Exception e) {
            System.out.println("에러 발생: " + e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }
} 