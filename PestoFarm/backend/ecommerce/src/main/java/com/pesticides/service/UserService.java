package com.pesticides.service;

import com.pesticides.modal.User;

public interface UserService {

 User findUserByJwtToken(String jwt);
 User findUserByEmail(String email) throws Exception;
 User verifyEmail(String email, String otp) throws Exception;
 User updateUserProfile(String jwt, User updatedUser) throws Exception;
 boolean checkPassword(User user, String password);
 User changePassword(String jwt, String currentPassword, String newPassword, String otp) throws Exception;
}
