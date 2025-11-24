package com.pesticides.exception;

// Change "extends Exceptions" to "extends Exception"
public class UserException extends Exception { 
    
    public UserException(String message) {
        super(message);
    }
}