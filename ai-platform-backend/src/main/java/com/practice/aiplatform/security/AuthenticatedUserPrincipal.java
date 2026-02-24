package com.practice.aiplatform.security;

import java.io.Serializable;
import java.security.Principal;

public class AuthenticatedUserPrincipal implements Principal, Serializable {

    private final Long userId;
    private final String email;

    public AuthenticatedUserPrincipal(Long userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public String getName() {
        return email;
    }
}
