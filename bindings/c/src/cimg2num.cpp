#include "cimg2num.h"
#include "img2num.h" // original C++ header

extern "C" {

void gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma) {
    img2num::gaussian_blur_fft(image, width, height, sigma);
}

void invert_image(uint8_t* image, int width, int height) {
    img2num::invert_image(image, width, height);
}

}
