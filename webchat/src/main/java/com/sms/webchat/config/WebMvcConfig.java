package com.sms.webchat.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
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
        .addPathPatterns("/**")   
        .excludePathPatterns(      
            "/user/**",          
            "/email/**",           
            "/ws/**",              
            "/chat-rooms/**"        
        );

    }

     
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
} 