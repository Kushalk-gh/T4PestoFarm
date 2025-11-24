package com.pesticides.request;

import com.pesticides.modal.Address;
import lombok.Data;

@Data
public class ScientistRequest {
    
    private String scientistName;
    private String email;
    private String mobile;
    private String specialization; 
    private String institution; 
    private Address officeAddress; 
    
   
}