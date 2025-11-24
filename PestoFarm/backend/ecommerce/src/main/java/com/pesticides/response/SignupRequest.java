package com.pesticides.response;

import lombok.Data;


@Data
public class SignupRequest {

    private String email;
    private String fullName;
    private String password;
    private String otp;
    private String mobile;
    private String address;

}
