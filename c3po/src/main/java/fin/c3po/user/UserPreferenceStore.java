package fin.c3po.user;

import fin.c3po.user.dto.UserPreferencesResponse;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserPreferenceStore {

    private final Map<UUID, Preferences> store = new ConcurrentHashMap<>();

    public UserPreferencesResponse getOrDefault(UUID userId) {
        Preferences prefs = store.computeIfAbsent(userId, id -> Preferences.defaultPreferences());
        return prefs.toResponse();
    }

    public UserPreferencesResponse update(UUID userId, java.util.function.Consumer<Preferences> updater) {
        Preferences prefs = store.computeIfAbsent(userId, id -> Preferences.defaultPreferences());
        updater.accept(prefs);
        return prefs.toResponse();
    }

    public static class Preferences {
        private String language;
        private boolean emailNotifications;
        private boolean smsNotifications;
        private boolean aiAssistantEnabled;

        public void setLanguage(String language) {
            this.language = language;
        }

        public void setEmailNotifications(boolean emailNotifications) {
            this.emailNotifications = emailNotifications;
        }

        public void setSmsNotifications(boolean smsNotifications) {
            this.smsNotifications = smsNotifications;
        }

        public void setAiAssistantEnabled(boolean aiAssistantEnabled) {
            this.aiAssistantEnabled = aiAssistantEnabled;
        }

        private static Preferences defaultPreferences() {
            Preferences prefs = new Preferences();
            prefs.language = "zh-CN";
            prefs.emailNotifications = true;
            prefs.smsNotifications = false;
            prefs.aiAssistantEnabled = true;
            return prefs;
        }

        private UserPreferencesResponse toResponse() {
            return UserPreferencesResponse.builder()
                    .language(language)
                    .emailNotifications(emailNotifications)
                    .smsNotifications(smsNotifications)
                    .aiAssistantEnabled(aiAssistantEnabled)
                    .build();
        }
    }
}


