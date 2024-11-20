package com.sms.webchat.service;

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
} 