// src/main/java/com/pesticides/config/WebMvcConfig.java
package com.pesticides.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:63327") // Allow requests from React frontend on both ports and production serve port
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // serves images under /images/scientist/** from folder uploads/scientist/
        registry.addResourceHandler("/images/scientist/**")
                .addResourceLocations("file:uploads/scientist/");

        // serves chat message images under /images/chat/** from folder uploads/chat/
        registry.addResourceHandler("/images/chat/**")
                .addResourceLocations("file:uploads/chat/");
    }
}
