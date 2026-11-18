package com.eauction.core.identity.config;

import com.eauction.core.identity.model.User;
import com.eauction.core.identity.repository.UserRepository;
import com.eauction.core.identity.service.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            @org.springframework.context.annotation.Lazy AuthService authService,
            UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        if (path == null) return false;
        return path.equals("/error")
                || path.equals("/api/v1/auth/login")
                || path.equals("/api/v1/auth/register")
                || path.equals("/api/v1/auth/keycloak")
                || path.equals("/api/v1/auth/azure-b2c")
                || path.startsWith("/api/v1/auth/otp/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7).trim();
        try {
            Claims claims = authService.parseAndValidateToken(jwt);
            String email = claims.getSubject();
            String userIdStr = claims.get("userId", String.class);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<User> dbUserOpt = userIdStr != null
                        ? userRepository.findById(UUID.fromString(userIdStr))
                        : userRepository.findByEmail(email.trim().toLowerCase());

                if (dbUserOpt.isEmpty() || !Boolean.TRUE.equals(dbUserOpt.get().getIsActive())) {
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                User dbUser = dbUserOpt.get();
                Set<SimpleGrantedAuthority> authorities = new LinkedHashSet<>();
                String primaryRole = dbUser.getRole() != null ? dbUser.getRole().trim().toUpperCase() : "BUYER";
                authorities.add(new SimpleGrantedAuthority("ROLE_" + primaryRole));

                for (String r : authService.getUserRoles(dbUser.getId())) {
                    if (r != null && !r.isBlank()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + r.trim().toUpperCase()));
                    }
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        dbUser.getEmail(),
                        null,
                        authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception ex) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
