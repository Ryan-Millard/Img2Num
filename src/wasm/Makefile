# =============================================
# WASM Root Orchestrator Makefile
# =============================================

# ANSI color codes
# TODO: Remove below colors after #93 is merged on 22 Dec 2025
					# see https://github.com/Ryan-Millard/Img2Num/pull/93
RED    := \033[1;31m
RESET  := \033[0m

MODULES_DIR := modules
MODULE_PATHS := $(wildcard $(MODULES_DIR)/*)

# TODO: Remove prewarn after #93 is merged on 22 Dec 2025
.PHONY: build debug clean help prewarn

# This target prints the warning
# TODO: Remove prewarn after #93 is merged on 22 Dec 2025
prewarn:
	@echo "\t${RED}"
	@echo "\t======================================================"
	@echo "\t|  ⚠️   WARNING: MAKEFILE BEHAVIOR IS CHANGING!  ⚠️  |"
	@echo "\t|                                                    |"
	@echo "\t|  Read PR #107 before running:                      |"
	@echo "\t|  https://github.com/Ryan-Millard/Img2Num/pull/107  |"
	@echo "\t|                                                    |"
	@echo "\t|  Make will be replaced with CMake on 22 Dec 2025.  |"
	@echo "\t======================================================"
	@echo "\t${RESET}"

# Build all modules
# TODO: Remove prewarn after #93 is merged on 22 Dec 2025
build: prewarn
	@for module in $(MODULE_PATHS); do \
		if [ -f $$module/Makefile ]; then \
			echo "Building module: $$module"; \
			$(MAKE) -C $$module; \
		fi; \
	done

# Build all modules in debug mode
# TODO: Remove prewarn after #93 is merged on 22 Dec 2025
debug: prewarn
	@for module in modules/*; do \
	  if [ -f $$module/Makefile ]; then \
	    echo "Debug‐building $$module"; \
	    $(MAKE) -C $$module debug; \
	  fi; \
	done

# Clean all build dirs
# TODO: Remove prewarn after #93 is merged on 22 Dec 2025
clean: prewarn
	@for module in $(MODULE_PATHS); do \
		if [ -f $$module/Makefile ]; then \
			echo "Cleaning module: $$module"; \
			$(MAKE) -C $$module clean; \
		fi; \
	done

# TODO: Remove prewarn after #93 is merged on 22 Dec 2025
help: prewarn
	@echo "Available targets:"
	@echo "  make build    - Build all modules"
	@echo "  make debug  - Clean all modules"
	@echo "  make clean  - Clean all modules"
