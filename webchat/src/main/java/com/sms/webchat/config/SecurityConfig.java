package com.sms.webchat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .disable()
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/ws/**").permitAll()     // WebSocket 연결 허용
                .requestMatchers("/email/**").permitAll()  // 이메일 관련 엔드포인트 허용
                .requestMatchers("/user/**").permitAll()   // 유저 관련 엔드포인트 허용
                .requestMatchers("/topic/**").permitAll()  // WebSocket 구독 엔드포인트 허용
                .requestMatchers("/app/**").permitAll()    // WebSocket 메시지 엔드포인트 허용
                .anyRequest().authenticated()
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())  // WebSocket을 위한 프레임 옵션 설정
            );
        
        return http.build();
    }
}