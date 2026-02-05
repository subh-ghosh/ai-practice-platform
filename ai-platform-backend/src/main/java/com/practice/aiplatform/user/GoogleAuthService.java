package com.practice.aiplatform.user;

import com.google.api.client.googleapis.auth.oauth2.*;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String clientId;

    public GoogleIdToken.Payload verifyToken(String idTokenString) throws Exception {

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance()
        )
        .setAudience(Collections.singletonList(clientId))
        .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);

        if (idToken != null) {
            return idToken.getPayload();
        }

        return null;
    }
}
