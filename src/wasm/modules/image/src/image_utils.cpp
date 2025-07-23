#include "image_utils.h"

uint8_t quantize(uint8_t value, uint8_t region_size) {
	uint8_t bucket = value / region_size; // Narrowing to colour boundary with Range [0 : num_thresholds - 1].

	uint8_t bucket_boundary = (bucket * region_size);
	uint8_t bucket_midpoint = bucket_boundary + (region_size / 2); // Map to threshold region's midpoint.
	
	// In case of bucket_midpoint overflow: revert to a smaller bucket than the largest possible value.
	bool overflow = bucket_midpoint < bucket_boundary;
	if (overflow)
	{
		bucket_midpoint = ((bucket - 1) * region_size) + (region_size / 2); // Correction by reducing the bucket value belongs to.
	}

	return bucket_midpoint;
}

extern "C" {
	// Called from JS. `ptr` points to RGBA bytes.
	EMSCRIPTEN_KEEPALIVE
		void invert_image(uint8_t* ptr, int width, int height) {
			ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
			img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

			for(ImageLib::RGBAPixel<uint8_t>& p : img) {
				p.red = 255 - p.red;
				p.blue = 255 - p.blue;
				p.green = 255 - p.green;
			}

			const auto& modified = img.getData();
			std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
		}

		void threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds) {
			const uint8_t REGION_SIZE(255 / num_thresholds); // Size of buckets per colour

			ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
			img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

			const auto imgWidth{img.getWidth()}, imgHeight{img.getHeight()};
			for(ImageLib::RGBAPixel<uint8_t>& p : img) {
				p.red = quantize(p.red, REGION_SIZE);
				p.green = quantize(p.green, REGION_SIZE);
				p.blue = quantize(p.blue, REGION_SIZE);
			}

			const auto& modified = img.getData();
			std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
		}

		void black_threshold_image(uint8_t* ptr, const int width, const int height, const int num_thresholds) {
			ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
			img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

			const auto imgWidth{img.getWidth()}, imgHeight{img.getHeight()};
			for(ImageLib::RGBAPixel<uint8_t>& p : img) {
				const bool R{p.red < threshold};
				const bool G{p.green < threshold};
				const bool B{p.blue < threshold};
				if (R && B && G) {
					p.setGray(0);
				}
			}

			const auto& modified = img.getData();
			std::memcpy(ptr, modified.data(), modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
		}
}
