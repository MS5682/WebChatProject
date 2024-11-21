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
import java.util.Map;
import org.springframework.http.HttpStatus;
import com.sms.webchat.security.JwtTokenProvider;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

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
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        try {
            // 로그인 처리
            User user = userService.login(request.getUserId(), request.getPassword());
            
            // JWT 토큰 생성
            String token = jwtTokenProvider.createToken(
                user.getUserId(),
                Map.of(
                    "userIdx", user.getIdx(),
                    "userId", user.getUserId(),
                    "name", user.getName(),
                    "email", user.getEmail()
                )
            );
            
            return ResponseEntity.ok()
                .header("Authorization", token)
                .body(new ApiResponseDto(true, "로그인 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponseDto(false, e.getMessage()));
        }
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(@RequestHeader("Authorization") String token) {
        try {
            // 토큰 유효성 검증 및 데이터 추출
            if (jwtTokenProvider.validateToken(token)) {
                Map<String, Object> claims = jwtTokenProvider.getClaims(token);
                return ResponseEntity.ok().body(claims);
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponseDto(false, "유효하지 않은 토큰입니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponseDto(false, e.getMessage()));
        }
    }
} 