package com.practice.aiplatform.security;

import com.practice.aiplatform.user.StudentLookupService;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class CurrentUserResolver {

    private final StudentLookupService studentLookupService;

    public CurrentUserResolver(StudentLookupService studentLookupService) {
        this.studentLookupService = studentLookupService;
    }

    public Long getRequiredUserId(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        if (principal instanceof AuthenticatedUserPrincipal authenticatedUserPrincipal
                && authenticatedUserPrincipal.getUserId() != null) {
            return authenticatedUserPrincipal.getUserId();
        }

        return studentLookupService.getRequiredStudentId(principal.getName());
    }
}
