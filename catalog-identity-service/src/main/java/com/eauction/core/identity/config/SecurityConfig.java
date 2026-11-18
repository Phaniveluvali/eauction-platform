package com.eauction.core.identity.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(@org.springframework.context.annotation.Lazy JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authException) -> {
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.getWriter().write("{\"error\":\"UNAUTHORIZED\",\"message\":\"Valid authentication token is required.\"}");
                        })
                        .accessDeniedHandler((req, res, accessDeniedException) -> {
                            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            res.getWriter().write("{\"error\":\"FORBIDDEN\",\"message\":\"Insufficient privileges to access this resource.\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public authentication & health endpoints
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/register",
                                "/api/v1/auth/keycloak",
                                "/api/v1/auth/azure-b2c",
                                "/api/v1/auth/otp/**",
                                "/api/v1/sessions/**",
                                "/error",
                                "/actuator/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        // Authenticated profile endpoint
                        .requestMatchers("/api/v1/auth/me").authenticated()
                        // Strictly ADMIN-only endpoints
                        .requestMatchers("/api/v1/auth/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/catalog/vehicles/stats/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/catalog/vehicles/batch/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/catalog/vehicles/batch").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/catalog/vehicles/batch-approve").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/catalog/vehicles/batch-archive").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/catalog/vehicles/*/technical-report/upload").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/catalog/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/auctions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/auctions/**").hasRole("ADMIN")
                        // SELLER or ADMIN vehicle submission
                        .requestMatchers(HttpMethod.POST, "/api/v1/catalog/vehicles").hasAnyRole("SELLER", "ADMIN")
                        // BUYER-only bidding, favorites, purchases & payment history
                        .requestMatchers("/api/v1/buyer/**").hasRole("BUYER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/auctions/*/bids").hasRole("BUYER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/auctions/*/silent-bids").hasRole("BUYER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/*/silent-bids/my-bid").hasRole("BUYER")
                        // Public read-only catalog & auction browse
                        .requestMatchers(HttpMethod.GET, "/api/v1/catalog/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auctions/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "https://eauction.tecnics-internal.online",
                "https://tecnics-internal.online",
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
