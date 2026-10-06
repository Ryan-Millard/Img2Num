# Run the Python example app on an image
console-py input:
    @echo "python example-apps/console-py/main.py {{ input }}"
    uv pip install opencv-python
    uv run python3 example-apps/console-py/main.py "{{ input }}"

# Run the C++ example app on an image
console-cpp input:
    @echo "./build-c-cpp/example-apps/console-cpp/console_cpp_app {{ input }}"
    ./build-c-cpp/example-apps/console-cpp/Img2NumExample_console_cpp "{{ input }}"

# Run the C example app on an image
console-c input:
    @echo "./build-c-cpp/example-apps/console-c/console_c_app {{ input }}"
    ./build-c-cpp/example-apps/console-c/CImg2NumExample_console_c "{{ input }}"

# Run the Node (CommonJS) example app on an image
console-js-cjs input:
    @echo "node example-apps/console-js-cjs/index.cjs {{ input }}"
    node example-apps/console-js-cjs/index.cjs "{{ input }}"

# Run the Node (ESM) example app on an image
console-js-esm input:
    @echo "node example-apps/console-js-esm/index.mjs {{ input }}"
    node example-apps/console-js-esm/index.mjs "{{ input }}"

# Run an npm script from example-apps/html-js/package.json
html-js script:
    pnpm -F html-js "{{ script }}"
