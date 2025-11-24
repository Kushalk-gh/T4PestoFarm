package com.pesticides.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * CustomException class to handle business logic errors, automatically returning HTTP 400.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST) 
public class CustomException extends RuntimeException {

    public CustomException(String message) {
        super(message);
    }
    
    public CustomException(String message, Throwable cause) {
        super(message, cause);
    }
}