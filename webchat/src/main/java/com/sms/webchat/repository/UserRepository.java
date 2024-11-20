package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUserId(String userId);
    boolean existsByEmail(String email);
} 