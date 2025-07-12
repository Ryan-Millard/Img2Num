# =============================================
# WASM Root Orchestrator Makefile
# =============================================

MODULES_DIR := modules
MODULE_PATHS := $(wildcard $(MODULES_DIR)/*)

.PHONY: build debug clean help

# Build all modules
build:
	@for module in $(MODULE_PATHS); do \
		if [ -f $$module/Makefile ]; then \
			echo "Building module: $$module"; \
			$(MAKE) -C $$module; \
		fi; \
	done

# Build all modules in debug mode
debug:
	@for module in modules/*; do \
	  if [ -f $$module/Makefile ]; then \
	    echo "Debug‐building $$module"; \
	    $(MAKE) -C $$module debug; \
	  fi; \
	done

# Clean all build dirs
clean:
	@for module in $(MODULE_PATHS); do \
		if [ -f $$module/Makefile ]; then \
			echo "Cleaning module: $$module"; \
			$(MAKE) -C $$module clean; \
		fi; \
	done

help:
	@echo "Available targets:"
	@echo "  make build    - Build all modules"
	@echo "  make debug  - Clean all modules"
	@echo "  make clean  - Clean all modules"
