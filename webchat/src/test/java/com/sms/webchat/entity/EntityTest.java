package com.sms.webchat.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import com.sms.webchat.enums.RoomType;

@DataJpaTest
@EnableJpaAuditing
public class EntityTest {

    @Autowired
    private TestEntityManager entityManager;

    
} 