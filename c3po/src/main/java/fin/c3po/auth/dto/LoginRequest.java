package fin.c3po.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @NotBlank
    @Size(min = 3, max = 128)
    private String identifier;

    @NotBlank
    @Size(min = 8, max = 128)
    private String password;
}


