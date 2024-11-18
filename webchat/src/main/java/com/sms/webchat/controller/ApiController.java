package com.sms.webchat.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController {
    
    private final Logger logger = LoggerFactory.getLogger(ApiController.class);
    
    @GetMapping("/hello")
    public String hello() {
        logger.info("react 서버 연결 성공");
        return "Hello from Spring Boot!";
    }
} 