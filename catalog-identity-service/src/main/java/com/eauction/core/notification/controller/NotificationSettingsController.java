package com.eauction.core.notification.controller;

import com.eauction.core.notification.dto.NotificationSettingsDto;
import com.eauction.core.notification.service.NotificationSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationSettingsController {

    private final NotificationSettingsService settingsService;

    public NotificationSettingsController(NotificationSettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/settings")
    public ResponseEntity<NotificationSettingsDto> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PostMapping("/settings")
    public ResponseEntity<NotificationSettingsDto> updateSettings(@RequestBody NotificationSettingsDto request,
                                                                 @RequestParam(required = false) String updatedBy) {
        return ResponseEntity.ok(settingsService.updateSettings(request, updatedBy));
    }

    @PostMapping("/toggle-global")
    public ResponseEntity<NotificationSettingsDto> toggleGlobal(@RequestParam(required = false) String updatedBy) {
        return ResponseEntity.ok(settingsService.toggleGlobal(updatedBy));
    }

    @PostMapping("/stop-all")
    public ResponseEntity<NotificationSettingsDto> stopAll(@RequestParam(required = false) String updatedBy) {
        return ResponseEntity.ok(settingsService.stopAll(updatedBy));
    }
}
