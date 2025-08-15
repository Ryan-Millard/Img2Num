#include "fft_iterative.h"
#include <algorithm>
#include <cmath>

namespace fft {
	using std::size_t;

	// Check if an integer is a power of two.
	bool is_power_of_two(size_t n) {
		return n && ((n & (n - 1)) == 0);
	}

	// Return the next power of two >= n.
	size_t next_power_of_two(size_t n) {
		if (n == 0) return 1;
		--n;
		n |= n >> 1;
		n |= n >> 2;
		n |= n >> 4;
		n |= n >> 8;
		n |= n >> 16;
#if SIZE_MAX > UINT32_MAX
		n |= n >> 32;
#endif
		return ++n;
	}

	/*
	 * In-place bit-reversal permutation.
	 *
	 * The DFT/FFT naturally orders outputs indexed by bit-reversed indices
	 * during the divide-and-conquer recursion. For an iterative implementation,
	 * we first reorder the input array by bit-reversed indices so subsequent
	 * "butterfly" passes combine the correct elements.
	 *
	 * a: input vector of length N = 2^log_n
	 */
	void bit_reverse_permute(std::vector<cd> &a) {
		const size_t N = a.size();
		int log_n = 0; // Base 2
		while ((1u << log_n) < N) ++log_n; // Set log_n to the exponent of 2 such that N = 2^log_n

		// Reverse each element
		for (size_t i = 0; i < N; ++i) {
			// compute bit-reversed index of i with log_n bits
			size_t rev = 0;
			size_t x = i;
			// Reverse element i
			for (int b = 0; b < log_n; ++b) {
				rev = (rev << 1) | (x & 1);
				x >>= 1;
			}
			if (i < rev) std::swap(a[i], a[rev]); // Avoid swapping twice
		}
	}

	void pad_to_pow_two(std::vector<cd>& a, size_t& N) {
		if(is_power_of_two(N)) return;

		size_t N2 = next_power_of_two(N);
		a.resize(N2, cd{0.0, 0.0});
		N = N2;
	}

	/*
	 * Iterative in-place FFT.
	 *
	 * Engineering convention:
	 *  - forward transform (inverse = false): uses exponent -j*2*pi*k*n/N
	 *  - inverse transform (inverse = true): uses exponent +j*2*pi*k*n/N and
	 *	divides final results by N (normalization).
	 *
	 * a: input buffer (modified in-place). After call it contains the transform.
	 * inverse: false => forward FFT (negative exponent), true => inverse FFT.
	 *
	 * Complexity: O(N log N) arithmetic operations, N must be a power of two (or
	 * will be padded if pad_to_pow2 is true).
	 */
	void iterative_fft(std::vector<cd> &a, bool inverse) {
		size_t N{ a.size() };

		pad_to_pow_two(a, N);

		// 1) Bit-reversal permutation
		// 		Reorder a for step 2
		bit_reverse_permute(a);

		// 2) Iterative Danielson-Lanczos (butterfly) stages.
		const double PI = std::acos(-1.0);
		const double sign = inverse ? +1.0 : -1.0; // -1 for forward (engineering convention), +1 for inverse

		// len is the current transform length (2, 4, 8, ..., N)
		// For a given len, we combine two sub-DFTs of size len/2 into one of size len.
		for (size_t len = 2; len <= N; len <<= 1) {
			// primitive len-th root of unity for this stage:
			// w_len = exp(sign * j * 2*pi / len)
			const double angle = sign * 2.0 * PI / double(len);
			const cd wlen = std::polar(1.0, angle);

			// iterate over blocks of size len
			for (size_t i = 0; i < N; i += len) {
				cd w = cd{1.0, 0.0};		   // w = wlen^0 initially
				const size_t half = len >> 1;  // len/2 butterflies per block
				for (size_t j = 0; j < half; ++j) {
					// positions in array corresponding to the DFT indices:
					// u = X[i + j] (upper half), v = X[i + j + half] * w (lower half times twiddle)
					cd u = a[i + j];
					cd v = a[i + j + half] * w;
					a[i + j] = u + v;				 // combined even-frequency part
					a[i + j + half] = u - v;		  // combined odd-frequency part
					w *= wlen;						// advance twiddle: w = w * wlen
				}
			}
		}

		// 3) If inverse transform, normalize by 1/N to get the true inverse DFT.
		if (inverse) {
			for (size_t i = 0; i < N; ++i) a[i] /= static_cast<double>(N);
		}
	}

	/*
	 * Convenience wrapper: take a const input vector and return the FFT result
	 * as a new vector. This will optionally pad to power-of-two if requested.
	 */
	std::vector<cd> fft_copy(const std::vector<cd> &input, bool inverse) {
		std::vector<cd> a = input;
		iterative_fft(a, inverse);
		return a;
	}

	// Perform 2D FFT using your iterative FFT on rows and columns
	void iterative_fft_2d(std::vector<cd>& data, size_t width, size_t height, bool inverse) {
		// Determine next power-of-two dimensions
		size_t W = fft::next_power_of_two(width);
		size_t H = fft::next_power_of_two(height);

		// Pad if necessary
		if (W != width || H != height) {
			std::vector<cd> padded(W * H, {0.0, 0.0});
			for (size_t y = 0; y < height; y++)
				for (size_t x = 0; x < width; x++)
					padded[y * W + x] = data[y * width + x];
			data = std::move(padded);
			width = W;
			height = H;
		}

		// Temporary buffers for row/column FFTs
		std::vector<cd> temp_row(width);
		std::vector<cd> temp_col(height);

		// FFT rows
		for (size_t y = 0; y < height; y++) {
			std::copy(data.begin() + y * width, data.begin() + (y + 1) * width, temp_row.begin());
			fft::iterative_fft(temp_row, inverse);
			std::copy(temp_row.begin(), temp_row.end(), data.begin() + y * width);
		}

		// FFT columns
		for (size_t x = 0; x < width; x++) {
			for (size_t y = 0; y < height; y++)
				temp_col[y] = data[y * width + x];
			fft::iterative_fft(temp_col, inverse);
			for (size_t y = 0; y < height; y++)
				data[y * width + x] = temp_col[y];
		}
	}

	/*
	 * Convenience wrapper: take a const input vector and return the 2D FFT result
	 * as a new vector. This will optionally pad to power-of-two if requested.
	 */
	std::vector<cd> iterative_fft_2d_copy(const std::vector<cd> &input, size_t width, size_t height, bool inverse) {
		std::vector<cd> a = input;
		iterative_fft_2d(a, width, height, inverse);
		return a;
	}
}
