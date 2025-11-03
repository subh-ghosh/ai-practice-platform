package com.practice.aiplatform.security;

import com.practice.aiplatform.user.Student;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtUtil {

    // A strong, secret key. In a real app, this should be in application.properties!
    // This key is 256 bits, which is required for HS256
    private final Key secretKey = Keys.hmacShaKeyFor(
            "MySuperSecretKeyForThisJavaProject1234567890".getBytes()
    );

    // 1. Generates a new token for a student
    public String generateToken(Student student) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(student.getEmail()) // Use email as the "username"
                .claim("userId", student.getId()) // Add student ID as a custom claim
                .claim("firstName", student.getFirstName()) // Add first name
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 1000 * 60 * 60 * 24)) // 24-hour expiration
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Extracts all information (claims) from a token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 3. A generic helper to get a specific claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 4. Extracts the username (email) from the token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 5. Extracts the expiration date from the token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // 6. Checks if the token is expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 7. Validates the token (checks if it's expired and if the username matches)
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}