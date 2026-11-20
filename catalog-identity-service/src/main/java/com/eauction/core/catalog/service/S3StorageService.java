package com.eauction.core.catalog.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
public class S3StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    private final String accessKey;
    private final String secretKey;
    private final String region;
    private final String bucketName;
    private final String baseUrl;
    private final HttpClient httpClient;

    public S3StorageService(
            @Value("${aws.access.key.id:${AWS_ACCESS_KEY_ID:}}") String accessKey,
            @Value("${aws.secret.access.key:${AWS_SECRET_ACCESS_KEY:}}") String secretKey,
            @Value("${aws.region:${AWS_REGION:ap-south-2}}") String region,
            @Value("${aws.s3.bucket.name:${S3_BUCKET_NAME:aws-finelet-sa-demo}}") String bucketName,
            @Value("${aws.s3.base.url:${S3_BASE_URL:https://aws-finelet-sa-demo.s3.ap-south-2.amazonaws.com}}") String baseUrl) {
        this.accessKey = accessKey != null ? accessKey.trim() : "";
        this.secretKey = secretKey != null ? secretKey.trim() : "";
        this.region = region != null && !region.isBlank() ? region.trim() : "ap-south-2";
        this.bucketName = bucketName != null && !bucketName.isBlank() ? bucketName.trim() : "aws-finelet-sa-demo";
        this.baseUrl = baseUrl != null && !baseUrl.isBlank() ? baseUrl.trim().replaceAll("/+$", "") : ("https://" + this.bucketName + ".s3." + this.region + ".amazonaws.com");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Uploads vehicle photo to S3 under path: <Month-Year>/<LotNumber>/images/<filename>
     * Example: 11-2026/100001/images/front_view.jpg
     */
    public String uploadVehicleImage(int lotNo, String fileName, byte[] data, String contentType) {
        String monthYear = getMonthYearFolder();
        String sanitizedName = sanitizeFilename(fileName, "photo.jpg");
        String key = monthYear + "/" + lotNo + "/images/" + sanitizedName;
        return putObject(key, data, contentType != null ? contentType : "image/jpeg");
    }

    /**
     * Uploads inspection report to S3 under path: <Month-Year>/<LotNumber>/reports/<filename>
     * Example: 11-2026/100001/reports/inspection_report.pdf
     */
    public String uploadTechnicalReport(int lotNo, String fileName, byte[] data, String contentType) {
        String monthYear = getMonthYearFolder();
        String sanitizedName = sanitizeFilename(fileName, "technical_report.pdf");
        String key = monthYear + "/" + lotNo + "/reports/" + sanitizedName;
        return putObject(key, data, contentType != null ? contentType : "application/pdf");
    }

    /**
     * Returns the formatted public URL for an S3 key under the active hierarchy.
     */
    public String getPublicUrl(String key) {
        return baseUrl + "/" + key.replaceAll("^/+", "");
    }

    public String getMonthYearFolder() {
        return DateTimeFormatter.ofPattern("MM-yyyy").format(LocalDate.now(ZoneOffset.UTC));
    }

    private String sanitizeFilename(String original, String fallback) {
        if (original == null || original.isBlank()) return fallback;
        String name = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        return name.isBlank() ? fallback : name;
    }

    /**
     * Executes AWS S3 PutObject via AWS SigV4 signed HTTP PUT.
     */
    public String putObject(String key, byte[] payload, String contentType) {
        if (accessKey.isEmpty() || secretKey.isEmpty()) {
            log.warn("[S3StorageService] AWS credentials not configured. Returning default path for key: {}", key);
            return getPublicUrl(key);
        }

        try {
            String host = bucketName + ".s3." + region + ".amazonaws.com";
            String path = "/" + key.replaceAll("^/+", "");
            URI uri = URI.create("https://" + host + path);

            java.time.ZonedDateTime now = java.time.ZonedDateTime.now(ZoneOffset.UTC);
            String amzDate = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").format(now);
            String dateStamp = DateTimeFormatter.ofPattern("yyyyMMdd").format(now);

            byte[] contentHashBytes = MessageDigest.getInstance("SHA-256").digest(payload);
            String contentSha256 = bytesToHex(contentHashBytes);

            // Canonical Request
            String canonicalUri = path;
            String canonicalQuery = "";
            String canonicalHeaders = "host:" + host + "\n" +
                    "x-amz-content-sha256:" + contentSha256 + "\n" +
                    "x-amz-date:" + amzDate + "\n";
            String signedHeaders = "host;x-amz-content-sha256;x-amz-date";

            String canonicalRequest = "PUT\n" +
                    canonicalUri + "\n" +
                    canonicalQuery + "\n" +
                    canonicalHeaders + "\n" +
                    signedHeaders + "\n" +
                    contentSha256;

            String credentialScope = dateStamp + "/" + region + "/s3/aws4_request";
            String stringToSign = "AWS4-HMAC-SHA256\n" +
                    amzDate + "\n" +
                    credentialScope + "\n" +
                    bytesToHex(MessageDigest.getInstance("SHA-256").digest(canonicalRequest.getBytes(StandardCharsets.UTF_8)));

            byte[] signingKey = getSignatureKey(secretKey, dateStamp, region, "s3");
            String signature = bytesToHex(hmacSha256(signingKey, stringToSign));

            String authHeader = "AWS4-HMAC-SHA256 Credential=" + accessKey + "/" + credentialScope +
                    ", SignedHeaders=" + signedHeaders +
                    ", Signature=" + signature;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Host", host)
                    .header("Content-Type", contentType)
                    .header("x-amz-date", amzDate)
                    .header("x-amz-content-sha256", contentSha256)
                    .header("Authorization", authHeader)
                    .PUT(HttpRequest.BodyPublishers.ofByteArray(payload))
                    .timeout(Duration.ofSeconds(20))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String publicUrl = getPublicUrl(key);
                log.info("[S3StorageService] Successfully uploaded {} ({} bytes) to S3 -> {}", key, payload.length, publicUrl);
                return publicUrl;
            } else {
                log.error("[S3StorageService] S3 PutObject failed with HTTP {}: {}", response.statusCode(), response.body());
                return getPublicUrl(key);
            }
        } catch (Exception ex) {
            log.error("[S3StorageService] Exception uploading to S3 (key: {}): {}", key, ex.getMessage(), ex);
            return getPublicUrl(key);
        }
    }

    private static byte[] hmacSha256(byte[] key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

    private static byte[] getSignatureKey(String key, String dateStamp, String regionName, String serviceName) throws Exception {
        byte[] kSecret = ("AWS4" + key).getBytes(StandardCharsets.UTF_8);
        byte[] kDate = hmacSha256(kSecret, dateStamp);
        byte[] kRegion = hmacSha256(kDate, regionName);
        byte[] kService = hmacSha256(kRegion, serviceName);
        return hmacSha256(kService, "aws4_request");
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
