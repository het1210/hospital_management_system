package com.hms.api_gateway.filter;

import com.hms.api_gateway.config.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component

public class JwtAuthenticationFilter
        extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Autowired
    private final JwtUtil jwtUtil;
    // Paths that bypass JWT check
    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/auth/login",
            "/auth/register",
            "/auth/refresh",
            "/auth/test"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }



    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            if (HttpMethod.OPTIONS.equals(request.getMethod())) {
                return chain.filter(exchange);  // NOT setComplete()
            }
            // ── 1. Skip auth for public endpoints ─────────────────────
            if (OPEN_ENDPOINTS.stream().anyMatch(path::startsWith)) {
                return chain.filter(exchange);
            }

            // ── 2. Extract Authorization header ───────────────────────
            String authHeader = request.getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Missing or invalid Authorization header",
                        HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // ── 3. Validate token ──────────────────────────────────────
            if (!jwtUtil.validateToken(token)) {
                return onError(exchange, "Invalid or expired JWT token",
                        HttpStatus.UNAUTHORIZED);
            }

            // ── 4. Extract claims ──────────────────────────────────────
            Claims claims = jwtUtil.extractAllClaims(token);

            String userId     = claims.get("userId", Integer.class).toString();
            String hospitalId = claims.get("hospitalId", Integer.class).toString();
            String username   = claims.getSubject();

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");
            String rolesHeader = String.join(",", roles);

            // ── 5. Forward user context as headers ────────────────────
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id",     userId)
                    .header("X-Hospital-Id", hospitalId)
                    .header("X-Username",    username)
                    .header("X-User-Roles",  rolesHeader)
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange,
                               String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"error\": \"" + message + "\"}";
        DataBuffer buffer = response.bufferFactory()
                .wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    // Required config class (can be empty if no YAML args needed)
    public static class Config {
        // add config fields here if needed later
    }
}