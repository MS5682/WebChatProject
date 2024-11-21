package com.sms.webchat.interceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.sms.webchat.security.JwtTokenProvider;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;

@Component
public class LoginCheckInterceptor implements HandlerInterceptor {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, 
                           @NonNull HttpServletResponse response, 
                           @NonNull Object handler) {
        String token = request.getHeader("Authorization");
        
        if (token != null) {
            if (jwtTokenProvider.validateToken(token)) {
                return true;
            }
        }
        
        throw new RuntimeException("로그인이 필요합니다.");
    }
} 