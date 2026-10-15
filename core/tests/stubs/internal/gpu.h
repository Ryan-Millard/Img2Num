#ifndef IMG2NUM_TEST_GPU_H
#define IMG2NUM_TEST_GPU_H

// Replaces core/include/internal/gpu.h so compiling CPU sources does not need
// WebGPU or Dawn. core/tests/stubs is listed before core/include on the test
// target, so this header wins for the same internal/gpu.h include.
class GPU {
  private:
    GPU() = default;

  public:
    static GPU& getClassInstance() {
        static GPU instance;
        return instance;
    }

    void init_gpu() {
    }
    bool is_initialized() {
        return false;
    }

    GPU(const GPU&) = delete;
    GPU& operator=(const GPU&) = delete;
    GPU(GPU&&) = delete;
    GPU& operator=(GPU&&) = delete;
};

#endif // IMG2NUM_TEST_GPU_H
