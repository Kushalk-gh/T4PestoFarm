package com.pesticides.utils;

import java.util.Random;

public class OtpUtil {

    public static String generateOtp(){

        // For testing purposes, return a fixed OTP
        // In production, uncomment the random generation below
        return "123456";

        /*
        int otpLength = 6;

        Random random = new Random();

        StringBuilder otp = new StringBuilder(otpLength);

        for(int i=0;i<otpLength;i++){
            otp.append(random.nextInt(10));
        }
        return otp.toString();
        */
    }
    
}
