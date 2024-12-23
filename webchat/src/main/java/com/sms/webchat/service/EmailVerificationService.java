package com.sms.webchat.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;

import com.sms.webchat.repository.UserRepository;

import java.util.Random;
import java.util.concurrent.TimeUnit;

import lombok.RequiredArgsConstructor;

import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.MessagingException;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    
    public void sendVerificationEmail(String email) {
        // 이메일 중복 체크
        if (isEmailExists(email)) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }
        
        String code = generateVerificationCode();
        String key = "EmailVerification:" + email;
        
        // Redis에 저장 (5분 후 자동 삭제)
        redisTemplate.opsForValue().set(key, code);
        redisTemplate.expire(key, 5, TimeUnit.MINUTES);
        
        // 이메일 발송
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("이메일 인증 코드");
            helper.setText("인증 코드: " + code);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 실패", e);
        }
    }
    
    public boolean verifyEmail(String email, String code) {
        String key = "EmailVerification:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        
        if (savedCode != null && savedCode.equals(code)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }
    
    private String generateVerificationCode() {
        return String.format("%06d", new Random().nextInt(1000000));
    }
    
    private boolean isEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    // 아이디 찾기용 이메일 발송
    public void sendFindIdVerificationEmail(String email) {
        String code = generateVerificationCode();
        String key = "FindIdVerification:" + email;  // 회원가입과 구분하기 위한 다른 키 사용
        
        // Redis에 저장 (5분 후 자동 삭제)
        redisTemplate.opsForValue().set(key, code);
        redisTemplate.expire(key, 5, TimeUnit.MINUTES);
        
        // 이메일 발송
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("[아이디 찾기] 이메일 인증");
            helper.setText("아이디 찾기 인증 코드: " + code);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 실패", e);
        }
    }
    
    public boolean verifyFindIdEmail(String email, String code) {
        String key = "FindIdVerification:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        
        if (savedCode != null && savedCode.equals(code)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }
    
    public void sendChangePasswordVerificationEmail(String email) {
        String code = generateVerificationCode();
        String key = "ChangePasswordVerification:" + email;
        
        // Redis에 저장 (5분 후 자동 삭제)
        redisTemplate.opsForValue().set(key, code);
        redisTemplate.expire(key, 5, TimeUnit.MINUTES);
        
        // 이메일 발송
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("[비밀번호 변경] 이메일 인증");
            helper.setText("비밀번호 변경 인증 코드: " + code);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송 실패", e);
        }
    }
    
    public boolean verifyChangePasswordEmail(String email, String code) {
        String key = "ChangePasswordVerification:" + email;
        String savedCode = redisTemplate.opsForValue().get(key);
        
        if (savedCode != null && savedCode.equals(code)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }
} 