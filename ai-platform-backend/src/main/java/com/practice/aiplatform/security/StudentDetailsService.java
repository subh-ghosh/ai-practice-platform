package com.practice.aiplatform.security;

import com.practice.aiplatform.user.Student;
import com.practice.aiplatform.user.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
// --- MAKE SURE YOU HAVE THESE IMPORTS ---
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
// ------------------------------------
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList; // This one is also needed

@Service
public class StudentDetailsService implements UserDetailsService {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // We use email as the username
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // --- THIS IS THE FIX ---
        // We must give the user at least one authority (role)
        var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));

        // We return a Spring Security "User" object with the new authority
        return new User(student.getEmail(), student.getPassword(), authorities);
    }
}