# ================================================================================================
# WebAssembly Build System - Automatic C++ to WASM compilation
# ================================================================================================

# Project directories
WASM_ROOT   := src/wasm
SRC_DIR     := $(WASM_ROOT)/src
INCLUDE_DIR := $(WASM_ROOT)/include
BUILD_DIR   := $(WASM_ROOT)/build

# Build configuration
EMCC_FLAGS := -O3 -s MODULARIZE=1 -s EXPORT_ES6=1 -sEXIT_RUNTIME=1 -s ENVIRONMENT=web -s SINGLE_FILE=0 -I$(INCLUDE_DIR) -s EXPORTED_FUNCTIONS="['_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","HEAPU8"]'

# Colors for output
COLOR_GREEN  := \033[32m
COLOR_BLUE   := \033[34m
COLOR_YELLOW := \033[33m
COLOR_RED    := \033[31m
COLOR_RESET  := \033[0m

.PHONY: all build-wasm clean help

all: build-wasm

# Main build target that discovers and compiles all C++ files
build-wasm:
	@printf "$(COLOR_BLUE)Building WebAssembly modules...$(COLOR_RESET)\n"
	@mkdir -p $(BUILD_DIR)
	@if [ ! -d "$(SRC_DIR)" ]; then \
		printf "$(COLOR_RED)Error: Source directory $(SRC_DIR) does not exist$(COLOR_RESET)\n"; \
		exit 1; \
	fi
	@cpp_files=$$(find $(SRC_DIR) -name "*.cpp" 2>/dev/null); \
	if [ -z "$$cpp_files" ]; then \
		printf "$(COLOR_YELLOW)No C++ files found in $(SRC_DIR)$(COLOR_RESET)\n"; \
		exit 0; \
	fi; \
	file_count=$$(echo "$$cpp_files" | wc -l); \
	current=0; \
	echo "$$cpp_files" | while read -r src_file; do \
		if [ -z "$$src_file" ]; then continue; fi; \
		current=$$((current + 1)); \
		rel_path="$${src_file#$(SRC_DIR)/}"; \
		output_file="$(BUILD_DIR)/$${rel_path%.cpp}.js"; \
		output_dir="$$(dirname "$$output_file")"; \
		mkdir -p "$$output_dir"; \
		base_name="$${rel_path%.cpp}"; \
		module_name="$$(echo "$$base_name" | sed 's/^./\U&/')"; \
		printf "$(COLOR_YELLOW)[$$current/$$file_count] Compiling $$rel_path...$(COLOR_RESET)\n"; \
		if emcc "$$src_file" $(EMCC_FLAGS) -s EXPORT_NAME="create$${module_name}Module" -o "$$output_file"; then \
			printf "$(COLOR_GREEN)✓ Successfully compiled $$rel_path$(COLOR_RESET)\n"; \
		else \
			printf "$(COLOR_RED)✗ Failed to compile $$rel_path$(COLOR_RESET)\n"; \
			exit 1; \
		fi; \
	done && printf "$(COLOR_GREEN)All modules compiled successfully!$(COLOR_RESET)\n"

# Clean build artifacts
clean:
	@printf "$(COLOR_BLUE)Cleaning build directory...$(COLOR_RESET)\n"
	@if [ -d "$(BUILD_DIR)" ]; then \
		rm -rf $(BUILD_DIR); \
		printf "$(COLOR_GREEN)✓ Build directory cleaned$(COLOR_RESET)\n"; \
	else \
		printf "$(COLOR_YELLOW)Build directory already clean$(COLOR_RESET)\n"; \
	fi

# Debug build with verbose output
debug-build:
	@printf "$(COLOR_BLUE)Debug build with verbose output...$(COLOR_RESET)\n"
	@mkdir -p $(BUILD_DIR)
	@cpp_files=$$(find $(SRC_DIR) -name "*.cpp" 2>/dev/null); \
	if [ -z "$$cpp_files" ]; then \
		printf "$(COLOR_YELLOW)No C++ files found$(COLOR_RESET)\n"; \
		exit 0; \
	fi; \
	echo "$$cpp_files" | while read -r src_file; do \
		if [ -z "$$src_file" ]; then continue; fi; \
		rel_path="$${src_file#$(SRC_DIR)/}"; \
		output_file="$(BUILD_DIR)/$${rel_path%.cpp}.js"; \
		output_dir="$$(dirname "$$output_file")"; \
		mkdir -p "$$output_dir"; \
		base_name="$${rel_path%.cpp}"; \
		module_name="$$(echo "$$base_name" | sed 's/^./\U&/')"; \
		printf "$(COLOR_BLUE)Compiling: $$src_file$(COLOR_RESET)\n"; \
		printf "$(COLOR_BLUE)Output: $$output_file$(COLOR_RESET)\n"; \
		printf "$(COLOR_BLUE)Module: create$${module_name}Module$(COLOR_RESET)\n"; \
		printf "$(COLOR_BLUE)Command: emcc \"$$src_file\" $(EMCC_FLAGS) -s EXPORT_NAME=\"create$${module_name}Module\" -o \"$$output_file\"$(COLOR_RESET)\n"; \
		emcc "$$src_file" $(EMCC_FLAGS) -s EXPORT_NAME="create$${module_name}Module" -o "$$output_file" -v; \
	done

# Show help
help:
	@printf "$(COLOR_BLUE)Available targets:$(COLOR_RESET)\n"
	@printf "  $(COLOR_GREEN)build-wasm$(COLOR_RESET)   - Automatically find and compile all C++ files to WebAssembly\n"
	@printf "  $(COLOR_GREEN)debug-build$(COLOR_RESET)  - Build with verbose output for debugging\n"
	@printf "  $(COLOR_GREEN)clean$(COLOR_RESET)        - Remove all build artifacts\n"
	@printf "  $(COLOR_GREEN)help$(COLOR_RESET)         - Show this help message\n"
