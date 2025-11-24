package com.pesticides.service;

import com.pesticides.domain.USER_ROLE;
import com.pesticides.request.LoginRequest;
import com.pesticides.response.AuthResponse;
import com.pesticides.response.SignupRequest;

public interface AuthService {
    
    void sentLoginOtp(String email , USER_ROLE role) throws Exception;
    String createUser(SignupRequest req) throws Exception;
    String createSeller(SignupRequest req) throws Exception;
    String createScientist(SignupRequest req) throws Exception;
    AuthResponse signing(LoginRequest req);
    String generateToken(String email, USER_ROLE role);
}
