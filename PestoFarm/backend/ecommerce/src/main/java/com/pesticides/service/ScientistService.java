package com.pesticides.service;

import com.pesticides.modal.Scientist;
import com.pesticides.request.ScientistRequest; 
import java.util.List;

public interface ScientistService {
    

    Scientist findScientistByJwtToken(String jwt) throws Exception;

    Scientist findScientistByEmail(String email) throws Exception;

    Scientist findScientistById(Long id) throws Exception;
    
    
    Scientist createScientist(Scientist scientist); 
    
   
    Scientist updateScientist(Long scientistId, ScientistRequest req) throws Exception;
    
    Scientist verifyEmail(String email, String otp) throws Exception;

    List<Scientist> findAllScientists();
    
    
    void deleteScientist(Long scientistId) throws Exception;

    boolean checkPassword(Scientist scientist, String rawPassword);
    Scientist changePassword(String jwt, String currentPassword, String newPassword, String otp) throws Exception;
}