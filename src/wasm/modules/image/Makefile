# Directories
INCLUDE_DIR  := include
BUILD_DIR    := build

# Detect module name
MODULE_NAME     := $(notdir $(CURDIR))
CAP_MODULE_NAME := $(shell echo $(MODULE_NAME) | sed 's/^./\U&/')

# Sources & output
SRC_FILES  := $(shell find . -type f -name '*.cpp' ! -path './$(BUILD_DIR)/*')
OUT_JS     := $(BUILD_DIR)/index.js

# Shared Emscripten options
COMMON_FLAGS  := \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s EXIT_RUNTIME=1 \
  -s ENVIRONMENT=web \
  -I$(INCLUDE_DIR) \
  -s EXPORTED_FUNCTIONS="['_malloc','_free']" \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","getValue","setValue","HEAPU8"]'

# Release vs Debug flags
RELEASE_FLAGS := -O3 -s SINGLE_FILE=0
DEBUG_FLAGS   := -O0 -g4 -s ASSERTIONS=2

# By default, FLAGS = RELEASE_FLAGS
FLAGS := $(RELEASE_FLAGS)

.PHONY: all debug clean

all: $(OUT_JS)

debug: FLAGS := $(DEBUG_FLAGS)
debug: all

$(OUT_JS): $(SRC_FILES)
	@mkdir -p $(BUILD_DIR)
	@echo "→ Building $(MODULE_NAME) [flags: $(FLAGS)]"
	emcc $^ $(COMMON_FLAGS) $(FLAGS) \
	  -s EXPORT_NAME="create$(CAP_MODULE_NAME)Module" \
	  -o $@

clean:
	rm -rf $(BUILD_DIR)
