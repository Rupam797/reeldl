package com.reeldl.config;

import org.springframework.context.annotation.Configuration;

/**
 * Redis configuration.
 * <p>
 * Spring Boot auto-configures {@link org.springframework.data.redis.core.StringRedisTemplate}
 * using the {@code spring.data.redis.*} properties. No additional customization is needed
 * for this application — this class exists as a placeholder for future Redis-specific beans
 * (e.g., custom serializers or RedisMessageListenerContainer).
 */
@Configuration
public class RedisConfig {
    // Auto-configuration handles StringRedisTemplate and RedisConnectionFactory.
}

