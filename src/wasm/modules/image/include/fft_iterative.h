#ifndef ITERATIVE_FFT_H
#define ITERATIVE_FFT_H

#include <vector>
#include <complex>
#include <cstddef>  // for size_t

namespace fft {
	using cd = std::complex<double>;

	// Check if an integer is a power of two.
	bool is_power_of_two(size_t n);

	// Return the next power of two >= n.
	size_t next_power_of_two(size_t n);

	// In-place bit-reversal permutation of vector a (length must be power of two).
	void bit_reverse_permute(std::vector<cd> &a);

	void pad_to_pow_two(std::vector<cd>& a, size_t& N);

	// Iterative in-place FFT.
	// Parameters:
	//  - a: input/output buffer (modified in-place).
	//  - inverse: false for forward FFT, true for inverse FFT.
	void iterative_fft(std::vector<cd> &a, bool inverse = false);

	// Convenience wrapper: return FFT result as a new vector.
	// Parameters:
	//  - input: const input vector.
	//  - inverse: false for forward FFT, true for inverse FFT.
	//  - pad_to_pow2: if true, pad input vector to next power of two.
	std::vector<cd> fft_copy(const std::vector<cd> &input, bool inverse = false);
}

#endif // ITERATIVE_FFT_H
