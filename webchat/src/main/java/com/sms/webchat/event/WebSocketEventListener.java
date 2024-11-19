package com.sms.webchat.event;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.security.Principal;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        if (user != null) {
            log.info("새로운 웹소켓 연결: {}", user.getName());
        } else {
            log.info("새로운 웹소켓 연결 (익명 사용자)");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        if (user != null) {
            log.info("웹소켓 연결 해제: {}, 세션ID: {}, 상태코드: {}", 
                user.getName(),
                headerAccessor.getSessionId(),
                event.getCloseStatus());
        } else {
            log.info("웹소켓 연결 해제 (익명 사용자), 세션ID: {}, 상태코드: {}", 
                headerAccessor.getSessionId(),
                event.getCloseStatus());
        }
    }
} 