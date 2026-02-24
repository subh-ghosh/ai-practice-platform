package com.practice.aiplatform.security;

import com.practice.aiplatform.user.Student;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtUtil {

    // 1. Inject the secret from Render/Application Properties
    @Value("${jwt.secret}")
    private String secret;

    // 2. Helper method to convert the string key into a Crypto Key object
    private Key getSignInKey() {
        // We use Base64 decoding to ensure the key handles special characters correctly
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Student student) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(student.getEmail())
                .claim("userId", student.getId())
                .claim("firstName", student.getFirstName())
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 1000 * 60 * 60 * 24)) // 24 hours
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Use helper method
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Use helper method
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> {
            Object raw = claims.get("userId");
            if (raw instanceof Number number) {
                return number.longValue();
            }
            if (raw instanceof String str) {
                return Long.parseLong(str);
            }
            throw new IllegalArgumentException("userId claim missing or invalid");
        });
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
