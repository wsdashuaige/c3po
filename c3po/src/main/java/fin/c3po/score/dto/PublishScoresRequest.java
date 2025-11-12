package fin.c3po.score.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class PublishScoresRequest {

    private Instant publishAt;

    @NotEmpty
    @Valid
    private List<Entry> scores = new ArrayList<>();

    @Getter
    @Setter
    public static class Entry {
        @NotNull
        private UUID studentId;
        @NotNull
        private String component;
        @NotNull
        private Integer value;
    }
}


