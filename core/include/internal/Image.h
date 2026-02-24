#ifndef IMAGE_H
#define IMAGE_H

#include <algorithm>
#include <stdexcept>
#include <type_traits>
#include <vector>

#include "internal/Pixel.h"
#include "internal/PixelConverter.h"

namespace ImageLib {
template <typename PixelT>
class Image {
    static_assert(std::is_base_of_v<Pixel<typename PixelT::value_type /*NumberT*/>, PixelT>,
                  "Image<PixelT>: PixelT must derive from Pixel<NumberT>");

   public:
    Image() : width(0), height(0) {
    }
    Image(int width, int height, PixelT fill = PixelT())
        : width(width), height(height), data(width * height, fill) {
    }

    template <typename ConverterT>
    void loadFromBuffer(const uint8_t *buffer, int width, int height,
                        PixelConverter<ConverterT> converter) {
        // converter.convert must return exactly PixelT
        static_assert(std::is_same_v<decltype(converter.convert((const uint8_t *)nullptr)), PixelT>,
                      "Converter return type must match PixelT");

        this->width = width;
        this->height = height;
        const int pixelCount = getPixelCount();
        data.resize(pixelCount);
        for (int i = 0; i < pixelCount; ++i) {
            data[i] = converter.convert(&buffer[i * converter.bytesPerPixel]);
        }
    }

    void fill(const PixelT &color) {
        std::fill(data.begin(), data.end(), color);
    }

    using iter = typename std::vector<PixelT>::iterator;
    iter begin() {
        return data.begin();
    }
    iter end() {
        return data.end();
    }
    using const_iter = typename std::vector<PixelT>::const_iterator;
    const_iter begin() const {
        return data.begin();
    }
    const_iter end() const {
        return data.end();
    }

    int getWidth() const {
        return width;
    }
    int getHeight() const {
        return height;
    }
    int getPixelCount() const {
        return width * height;
    }
    int getSize() const {
        return getPixelCount();
    }

    const std::vector<PixelT> &getData() const {
        return data;
    }

    const PixelT &getPixel(int x, int y) const {
        return data[index(x, y)];
    }
    PixelT &getPixel(int x, int y) {
        return data[index(x, y)];
    }

    void setPixel(int x, int y, const PixelT &p) {
        data[index(x, y)] = p;
    }

    // Operator[] for flat indexing
    PixelT &operator[](int idx) {
        return data.at(idx);
    }  // set
    const PixelT &operator[](int idx) const {
        return data.at(idx);
    }  // get

    // Operator() for (x, y) access
    PixelT &operator()(int x, int y) {
        return data.at(index(x, y));
    }  // set
    const PixelT &operator()(int x, int y) const {
        return data.at(index(x, y));
    }  // get

    std::vector<PixelT>& getData() {
        return data;
    }

   private:
    std::vector<PixelT> data;
    int width, height;

    int index(int x, int y) const {
        if (x < 0 || y < 0 || x >= width || y >= height)
            throw std::out_of_range("Pixel coordinates out of bounds");
        return y * width + x;
    }
};
}  // namespace ImageLib

#endif
