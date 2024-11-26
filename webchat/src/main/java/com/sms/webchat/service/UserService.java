package com.sms.webchat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sms.webchat.entity.User;
import com.sms.webchat.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    @Autowired
    private EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;

    public void signup(User user) {
        // 아이디 중복 체크
        if (userRepository.existsByUserId(user.getUserId())) {
            throw new RuntimeException("이미 사용중인 아이디입니다.");
        }
        
        // 이메일 중복 체크
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다.");
        }

        userRepository.save(user);
    }

    public boolean checkUserIdDuplicate(String userId) {
        return userRepository.existsByUserId(userId);
    }

    public void sendFindIdVerificationEmail(String email) {
        // 이메일 존재 여부 확인
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("등록되지 않은 이메일입니다.");
        }
        
        // 아이디 찾기용 인증 메일 발송
        emailVerificationService.sendFindIdVerificationEmail(email);
    }

    public String findUserIdByEmailVerification(String email, String code) {
        // 인증 코드 확인
        if (!emailVerificationService.verifyFindIdEmail(email, code)) {
            throw new RuntimeException("인증번호가 일치하지 않습니다.");
        }

        // 인증 성공 시 아이디 반환
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return user.getUserId();
    }

    public boolean validateUserEmailAndId(String email, String userId) {
        return userRepository.findByEmailAndUserId(email, userId).isPresent();
    }

    @Transactional
    public void updatePassword(String email, String encodedPassword) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        user.setPassword(encodedPassword);
        userRepository.save(user);
    }

    public User login(String userId, String password) {
        User user = userRepository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다."));
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        
        return user;
    }

    public User findByName(String name) {
        return userRepository.findByName(name)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
} 