/* Tests that img2num_image_to_svg() reports bad input through the C error API:
 * it must return NULL, and img2num_get_last_error() must be
 * IMG2NUM_ERROR_INVALID_ARGUMENT with a helpful message.
 * Bad input is rejected before any processing, so no GPU is needed. */

#include <cimg2num.h>
#include <cimg2num/img2num_error_t.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int failures = 0;

#define CHECK(cond)                                                                                \
    do {                                                                                           \
        if (!(cond)) {                                                                             \
            fprintf(stderr, "%s:%d: CHECK failed: %s\n", __FILE__, __LINE__, #cond);               \
            ++failures;                                                                            \
        }                                                                                          \
    } while (0)

/* Call image_to_svg and assert it failed with INVALID_ARGUMENT and a message
 * containing `needle`. */
static void expect_invalid(
    const char* label, const uint8_t* data, int w, int h, const img2num_ImageToSvgConfig* cfg,
    const char* needle
) {
    img2num_clear_last_error();
    char* svg = img2num_image_to_svg(data, w, h, cfg);

    if (svg != NULL) {
        fprintf(stderr, "[%s] expected NULL result\n", label);
        free(svg);
        ++failures;
        return;
    }
    if (img2num_get_last_error() != IMG2NUM_ERROR_INVALID_ARGUMENT) {
        fprintf(
            stderr, "[%s] expected INVALID_ARGUMENT, got error code %d\n", label,
            (int)img2num_get_last_error()
        );
        ++failures;
        return;
    }
    const char* msg = img2num_get_last_error_message();
    if (msg == NULL || strstr(msg, needle) == NULL) {
        fprintf(stderr, "[%s] message \"%s\" lacks \"%s\"\n", label, msg ? msg : "(null)", needle);
        ++failures;
    }
}

int main(void) {
    static uint8_t pixels[64 * 64 * 4];
    memset(pixels, 128, sizeof pixels);

    img2num_ImageToSvgConfig ok = img2num_ImageToSvgConfig_default();

    expect_invalid("null data", NULL, 64, 64, &ok, "null");
    expect_invalid("zero width", pixels, 0, 64, &ok, "positive");
    expect_invalid("negative height", pixels, 64, -1, &ok, "positive");
    expect_invalid("too small", pixels, 8, 8, &ok, "too small");
    expect_invalid("thin image", pixels, 64, 15, &ok, "too small");

    img2num_ImageToSvgConfig cfg = ok;
    cfg.kmeans.k = 0;
    expect_invalid("k = 0", pixels, 64, 64, &cfg, "kmeans.k");

    cfg = ok;
    cfg.kmeans.k = 64 * 64 + 1;
    expect_invalid("k > pixel count", pixels, 64, 64, &cfg, "pixels");

    cfg = ok;
    cfg.bilateral_filter.sigma_spatial = 0.0;
    expect_invalid("sigma_spatial = 0", pixels, 64, 64, &cfg, "sigma_spatial");

    cfg = ok;
    cfg.bilateral_filter.sigma_range = -1.0;
    expect_invalid("sigma_range < 0", pixels, 64, 64, &cfg, "sigma_range");

    cfg = ok;
    cfg.kmeans.max_iter = 0;
    expect_invalid("max_iter = 0", pixels, 64, 64, &cfg, "max_iter");

    cfg = ok;
    cfg.color_space = 7;
    expect_invalid("bad color_space", pixels, 64, 64, &cfg, "color_space");

    /* The error state can be cleared. */
    img2num_clear_last_error();
    CHECK(img2num_get_last_error() == IMG2NUM_OK);

    if (failures) {
        fprintf(stderr, "%d check(s) failed\n", failures);
        return EXIT_FAILURE;
    }
    printf("all C error-handling tests passed\n");
    return EXIT_SUCCESS;
}
