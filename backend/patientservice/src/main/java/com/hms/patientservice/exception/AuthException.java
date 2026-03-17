package com.hms.patientservice.exception;

public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
