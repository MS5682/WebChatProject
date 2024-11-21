package com.sms.webchat.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    // JWT 토큰의 비밀키를 application.properties에서 주입받음
    @Value("${jwt.secret}")
    private String secretKey;
    
    // 토큰 유효시간 설정 (1시간)
    private final long tokenValidityInMilliseconds = 1000L * 60 * 60; // 1시간

    // 객체 초기화 시 비밀키를 Base64로 인코딩
    @PostConstruct
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
    }

    // JWT 토큰 생성 메서드
    public String createToken(String userId, Map<String, Object> claims) {
        // JWT Claims 설정 (사용자 ID를 주체로 설정)
        Claims jwtClaims = Jwts.claims().setSubject(userId);
        jwtClaims.putAll(claims);
        
        // 토큰 만료시간 설정
        Date now = new Date();
        Date validity = new Date(now.getTime() + tokenValidityInMilliseconds);

        // JWT 토큰 생성 및 반환
        return Jwts.builder()
            .setClaims(jwtClaims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS256, secretKey)
            .compact();
    }

    // 토큰 유효성 검증 메서드
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // 토큰에서 Claims(데이터) 추출 메서드
    public Map<String, Object> getClaims(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(secretKey)
            .parseClaimsJws(token)
            .getBody();
        return new HashMap<>(claims);
    }
} 