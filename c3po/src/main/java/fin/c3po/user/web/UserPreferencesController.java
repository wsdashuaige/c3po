package fin.c3po.user.web;

import fin.c3po.common.web.ApiResponse;
import fin.c3po.user.UserPreferenceStore;
import fin.c3po.user.UserAccount;
import fin.c3po.user.dto.UpdateUserPreferencesRequest;
import fin.c3po.user.dto.UserPreferencesResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/users/me/preferences")
@Validated
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferenceStore preferenceStore;

    @GetMapping
    public ApiResponse<UserPreferencesResponse> getPreferences(
            @AuthenticationPrincipal UserAccount currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return ApiResponse.success(preferenceStore.getOrDefault(currentUser.getId()));
    }

    @PatchMapping
    public ApiResponse<UserPreferencesResponse> updatePreferences(
            @AuthenticationPrincipal UserAccount currentUser,
            @Valid @RequestBody UpdateUserPreferencesRequest request) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        UserPreferencesResponse response = preferenceStore.update(currentUser.getId(), prefs -> {
            if (request.getLanguage() != null) {
                prefs.setLanguage(request.getLanguage());
            }
            if (request.getEmailNotifications() != null) {
                prefs.setEmailNotifications(request.getEmailNotifications());
            }
            if (request.getSmsNotifications() != null) {
                prefs.setSmsNotifications(request.getSmsNotifications());
            }
            if (request.getAiAssistantEnabled() != null) {
                prefs.setAiAssistantEnabled(request.getAiAssistantEnabled());
            }
        });
        return ApiResponse.success(response);
    }
}


