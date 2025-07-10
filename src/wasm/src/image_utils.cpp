#include <emscripten/emscripten.h>
#include <stdint.h>
#include <algorithm>

inline float clamp(float value, float min, float max) {
	return std::max(min, std::min(value, max));
}

extern "C" {
	// Inverts the colors in an RGBA image buffer.
	// Each pixel is 4 bytes: [Red, Green, Blue, Alpha]
	// `ptr` points to the image data, `length` is the total number of bytes.
	// Set `invertAlpha` to true to also invert the alpha channel.
	EMSCRIPTEN_KEEPALIVE
	void invert_image(uint8_t* ptr, int length, bool invertAlpha = false) {
		constexpr int PIXEL_SIZE = 4; // Represent 4 elements of buffer (1 pixel)

		for (int i = 0; i < length; i += PIXEL_SIZE) {
			uint8_t& red   = ptr[i + 0];
			uint8_t& green = ptr[i + 1];
			uint8_t& blue  = ptr[i + 2];
			uint8_t& alpha = ptr[i + 3];

			red = 255 - red;
			green = 255 - green;
			blue = 255 - blue;
			alpha = invertAlpha ? 255 - alpha : alpha;
		}
	}

	// Adjusts the saturation of an RGBA image.
	// `factor > 1.0` increases saturation, `factor < 1.0` desaturates.
	EMSCRIPTEN_KEEPALIVE
		void adjust_saturation(uint8_t* ptr, int length, float factor) {
			constexpr int PIXEL_SIZE = 4;

			for (int i = 0; i < length; i += PIXEL_SIZE) {
				uint8_t& r{ptr[i + 0]};
				uint8_t& g{ptr[i + 1]};
				uint8_t& b{ptr[i + 2]};

				// Convert to float in [0,1]
				float rf{r / 255.0f};
				float gf{g / 255.0f};
				float bf{b / 255.0f};

				// Calculate luminance (perceived brightness)
				float gray{0.299f * rf + 0.587f * gf + 0.114f * bf};

				// Interpolate between the gray and original color
				rf = clamp(gray + (rf - gray) * factor, 0.0f, 1.0f);
				gf = clamp(gray + (gf - gray) * factor, 0.0f, 1.0f);
				bf = clamp(gray + (bf - gray) * factor, 0.0f, 1.0f);

				// Convert back to uint8_t
				r = static_cast<uint8_t>(rf * 255.0f);
				g = static_cast<uint8_t>(gf * 255.0f);
				b = static_cast<uint8_t>(bf * 255.0f);
			}
		}
}
