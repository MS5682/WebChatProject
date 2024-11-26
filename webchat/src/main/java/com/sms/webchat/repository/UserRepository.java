package com.sms.webchat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.sms.webchat.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUserId(String userId);
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndUserId(String email, String userId);
    Optional<User> findByUserId(String userId);
    Optional<User> findByName(String name);
} 