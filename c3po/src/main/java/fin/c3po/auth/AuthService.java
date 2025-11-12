package fin.c3po.auth;

import fin.c3po.auth.dto.AuthResponse;
import fin.c3po.auth.dto.LoginRequest;
import fin.c3po.auth.dto.ProfileResponse;
import fin.c3po.auth.dto.RegisterRequest;
import fin.c3po.security.jwt.JwtService;
import fin.c3po.user.UserAccount;
import fin.c3po.user.UserAccountRepository;
import fin.c3po.user.UserRole;
import fin.c3po.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userAccountRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userAccountRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        String normalizedUsername = request.getUsername().trim().toLowerCase();
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        UserAccount userAccount = new UserAccount(
                normalizedUsername,
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : UserRole.STUDENT
        );
        userAccountRepository.save(userAccount);
        return buildAuthResponse(userAccount);
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        UserAccount user = userAccountRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userAccountRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        UserAccount authenticatedUser = (UserAccount) authentication.getPrincipal();
        return buildAuthResponse(authenticatedUser);
    }

    public ProfileResponse toProfile(UserAccount userAccount) {
        return ProfileResponse.builder()
                .id(userAccount.getId())
                .username(userAccount.getUsername())
                .email(userAccount.getEmail())
                .role(userAccount.getRole())
                .status(userAccount.getStatus())
                .createdAt(userAccount.getCreatedAt())
                .updatedAt(userAccount.getUpdatedAt())
                .build();
    }

    private AuthResponse buildAuthResponse(UserAccount userAccount) {
        String token = jwtService.generateToken(userAccount);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .build();
    }
}


