package com.housing.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableCaching
public class AnalyticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsApplication.class, args);
    }

    /**
     * HTTP Client Bean utilized for synchronous service mesh communication 
     * between this gateway instance and the Python FastAPI model engine container.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Local In-Memory Cache Manager Bean.
     * Satisfies Task 2, App 2 Optimization Constraints by preventing repetitive 
     * heavy calculations or I/O lookups for dataset segments once structured.
     */
    @Bean
    public CacheManager cacheManager() {
        // Registers the 'marketStats' cache store used by AnalyticsController
        return new ConcurrentMapCacheManager("marketStats");
    }
}