package fin.c3po.common.web;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class ApiResponse<T> {
    String traceId;
    boolean success;
    T data;
    PageMeta meta;
    Object error;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .traceId(UUID.randomUUID().toString())
                .success(true)
                .data(data)
                .meta(null)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, PageMeta meta) {
        return ApiResponse.<T>builder()
                .traceId(UUID.randomUUID().toString())
                .success(true)
                .data(data)
                .meta(meta)
                .error(null)
                .build();
    }

    public static <T> ApiResponse<T> failure(Object error) {
        return ApiResponse.<T>builder()
                .traceId(UUID.randomUUID().toString())
                .success(false)
                .data(null)
                .meta(null)
                .error(error)
                .build();
    }
}


