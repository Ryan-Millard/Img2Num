#!/bin/bash
set -e

# Backup package.json
cp package.json package.json.backup

# Create temp file for scriptsInfo section update
# After line 102 (closing brace of test:coverage), add new entries
sed -i '102 a\      },\n      "test:scripts": {\n        "desc": "Run script utility tests"\n      },\n      "test:scripts:watch": {\n        "desc": "Run script tests in watch mode"\n      },\n      "test:scripts:coverage": {\n        "desc": "Run script tests with coverage report"' package.json

# Now fix the scripts section
# After line 148 (test:coverage line, but line numbers have shifted by 8 lines from above insert)
# New line number is 148 + 8 = 156
sed -i '156 a\    "test:scripts": "vitest run --config scripts/vitest.config.js",\n    "test:scripts:watch": "vitest --config scripts/vitest.config.js",\n    "test:scripts:coverage": "vitest run --coverage --config scripts/vitest.config.js",' package.json

echo "✅ Updated package.json successfully"