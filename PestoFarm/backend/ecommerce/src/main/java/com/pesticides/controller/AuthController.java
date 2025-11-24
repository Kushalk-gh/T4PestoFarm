package com.pesticides.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.domain.USER_ROLE;
import com.pesticides.request.LoginOtpRequest;
import com.pesticides.request.LoginRequest;
import com.pesticides.response.Apiresponse;
import com.pesticides.response.AuthResponse;
import com.pesticides.response.SignupRequest;
import com.pesticides.service.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@RequestBody SignupRequest req) throws Exception{

        String jwt = authService.createUser(req);

        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setMessage("register success");
        res.setRole(USER_ROLE.ROLE_USER);
       

        return ResponseEntity.ok(res);
    }
    
      @PostMapping("/sent/login-signup-otp")
    public ResponseEntity<Apiresponse> sentOtpHandler(@RequestBody LoginOtpRequest req) throws Exception{

        authService.sentLoginOtp(req.getEmail(),req.getRole());

        Apiresponse res = new Apiresponse();
        
        res.setMessage("otp sent successfully");
       

        return ResponseEntity.ok(res);
    }


     @PostMapping("/signing")
        public ResponseEntity<AuthResponse> loginHandler(@RequestBody LoginRequest req) throws Exception{

       AuthResponse authResponse = authService.signing(req);

        return ResponseEntity.ok(authResponse);
    }


}
