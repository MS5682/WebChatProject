package com.sms.webchat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.socket.config.annotation.EnableWebSocket;

@SpringBootApplication
@EnableWebSocket
public class WebchatApplication {

    public static void main(String[] args) {
        SpringApplication.run(WebchatApplication.class, args);
    }

}
