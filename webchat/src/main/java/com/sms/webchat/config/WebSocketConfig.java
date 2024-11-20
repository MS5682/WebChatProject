package com.sms.webchat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.lang.NonNull;

// WebSocket 설정을 위한 Configuration 클래스
@Configuration
// WebSocket 메시지 브로커 기능을 활성화
@EnableWebSocketMessageBroker  
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // WebSocket 연결을 위한 엔드포인트를 등록하는 메소드
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")  // WebSocket 엔드포인트 경로를 /ws로 설정
                .setAllowedOrigins("http://localhost:3000"); // CORS 설정: React 클라이언트의 접근을 허용
    }

    // 메시지 브로커의 라우팅 설정을 하는 메소드 
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // 클라이언트에서 보낸 메시지를 받을 prefix 설정
        registry.setApplicationDestinationPrefixes("/app");
        // 구독자들에게 메시지를 전달할 prefix 설정
        registry.enableSimpleBroker("/topic");
    }
}