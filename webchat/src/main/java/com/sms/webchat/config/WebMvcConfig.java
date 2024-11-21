package com.sms.webchat.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.sms.webchat.interceptor.LoginCheckInterceptor;
import org.springframework.lang.NonNull;

// Spring MVC 설정을 위한 Configuration 클래스
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    // 로그인 체크 인터셉터 주입
    @Autowired
    private LoginCheckInterceptor loginCheckInterceptor;
    
    // 인터셉터를 등록하는 메소드
    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(loginCheckInterceptor)
                .addPathPatterns("/**")    // 모든 경로에 인터셉터 적용
                .excludePathPatterns(       // 인터셉터 적용을 제외할 경로 설정
                    "/user/login",          // 로그인 페이지
                    "/user/logout",         // 로그아웃 경로 추가
                    "/user/signup",         // 회원가입 페이지 
                    "/user/find-id",        // 아이디 찾기 페이지
                    "/user/changePassword", // 비밀번호 변경 페이지
                    "/user/check-session",  // 세션 체크 경로 추가
                    "/email/**",            // 이메일 관련 경로
                    "/ws/**"                // WebSocket 관련 경로
                );
    }
} 