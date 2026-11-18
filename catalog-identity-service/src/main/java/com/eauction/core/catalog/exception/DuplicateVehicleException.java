package com.eauction.core.catalog.exception;

import java.util.List;
import java.util.Map;

public class DuplicateVehicleException extends RuntimeException {

    private final List<Map<String, Object>> errors;

    public DuplicateVehicleException(String message, List<Map<String, Object>> errors) {
        super(message);
        this.errors = errors;
    }

    public List<Map<String, Object>> getErrors() {
        return errors;
    }
}
