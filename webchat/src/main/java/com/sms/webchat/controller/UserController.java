package com.sms.webchat.controller;

import com.sms.webchat.dto.request.ChangePasswordRequest;
import com.sms.webchat.dto.request.SignupRequestDto;
import com.sms.webchat.dto.request.LoginRequestDto;
import com.sms.webchat.dto.response.ApiResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.sms.webchat.entity.User;
import com.sms.webchat.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpSession;
import java.util.Map;

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

    @PostMapping("/changePassword")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            String encodedPassword = passwordEncoder.encode(request.getPassword());
            userService.updatePassword(request.getEmail(), encodedPassword);
            return ResponseEntity.ok().body(new ApiResponseDto(true, "비밀번호가 성공적으로 변경되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequestDto request,
            HttpSession session) {
        try {
            // 로그인 처리
            User user = userService.login(request.getUserId(), request.getPassword());
            
            // 세션에 사용자 정보 저장
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("userIdx", user.getIdx());
            
            return ResponseEntity.ok().body(new ApiResponseDto(true, "로그인 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        try {
            // 세션 무효화
            session.invalidate();
            return ResponseEntity.ok().body(new ApiResponseDto(true, "로그아웃 되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession(HttpSession session) {
        try {
            // 세션에서 userId 확인
            String userId = (String) session.getAttribute("userId");
            boolean isLoggedIn = userId != null;
            
            return ResponseEntity.ok()
                .body(Map.of("isLoggedIn", isLoggedIn));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponseDto(false, e.getMessage()));
        }
    }
} 