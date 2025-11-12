package fin.c3po.common.web;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PageMeta {
    int page;
    int pageSize;
    long total;
    String sort;
}


