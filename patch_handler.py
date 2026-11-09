path = '/home/nodejs/eauction-workspace/catalog-identity-service/src/main/java/com/eauction/core/shared/GlobalExceptionHandler.java'
with open(path, 'r') as f:
    c = f.read()

target = '    @ExceptionHandler(Exception.class)'
replacement = '''    @ExceptionHandler(org.springframework.web.bind.MissingRequestHeaderException.class)
    public ResponseEntity<Map<String, Object>> handleMissingHeader(org.springframework.web.bind.MissingRequestHeaderException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", "Unauthorized");
        body.put("message", "Authentication credentials missing or header omitted");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(Exception.class)'''

if target in c and 'MissingRequestHeaderException' not in c:
    c = c.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(c)
    print('GlobalExceptionHandler successfully patched')
else:
    print('Already present or target not found')
