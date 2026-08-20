version := "0.0.0"
current_date := `date +%Y-%m-%d`

help:
    @echo \
    "List of commands: \n \
    init: pull submodules \n \
    format: format all files \n \
    build <target>: \n \
    \t cpp: build c++ core and c bindings \n \
    \t js: build js/wasm bindings \n \
    \t py: build python bindings and python package \n \
    \t packages-js: build browser and node packages using js/wasm bindings \n \
    \t all: build all of above \n \
    clean <target>: \n \
    \t cpp: delete c++ and c build folder (build-c-cpp) \n \
    \t js: delete js build folder (build-wasm) \n \
    \t packages-js: delete packages/js/dist folder \n \
    \t packages-py: delete packages/py/build-py folder \n \
    docs <action>: \n \
    \t build: build docusaurus server \n \
    \t start: start docusaurus server on port 3000 \n \
    react-js <action>: \n \
    \t build: build example browser app \n \
    \t start: start example browser app on port 5173 \n \
    console-cpp <input_image>: run example C++ app on input image \n \
    console-c <input_image>: run example C app on input image \n \
    console-py <input_image>: run example python app on input image \n \
    console-js-cjs <input_image>: run example node app on input image \n \
    console-js-esm <input_image>: run example node app on input image \n \
    html-js <script>: target npm script in example-apps/html-js/package.json \
    "

init:
    @echo "Pulling submodules"
    git submodule update --init
    pnpm install
    just build all

format:
    @echo "Format all files"
    pnpm format

build-c-cpp build_type="Release" log_level="AUTO":
    @echo "Build C++ core and C bindings ({{ build_type }}, log={{ log_level }})"
    cmake -DCMAKE_BUILD_TYPE={{ build_type }} \
        -DIMG2NUM_LOG_LEVEL={{ log_level }} \
        -B build-c-cpp/ .
    cmake --build build-c-cpp/ --parallel

build-wasm build_type="Release" log_level="AUTO":
    @echo "Build JS bindings ({{ build_type }}, log={{ log_level }})"
    emcmake cmake -DCMAKE_BUILD_TYPE={{ build_type }} \
        -DIMG2NUM_LOG_LEVEL={{ log_level }} \
        -B build-wasm/ .
    cmake --build build-wasm/ --parallel

build-py build_type="Release" log_level="AUTO":
    @echo "Build python bindings and py package ({{ build_type }}, log={{ log_level }})"
    SKBUILD_CMAKE_BUILD_TYPE={{ build_type }} \
    SKBUILD_CMAKE_DEFINE="IMG2NUM_LOG_LEVEL={{ log_level }}" \
    uv sync --reinstall-package img2num
    SKBUILD_CMAKE_BUILD_TYPE={{ build_type }} \
    SKBUILD_CMAKE_DEFINE="IMG2NUM_LOG_LEVEL={{ log_level }}" \
    uv build --wheel

build-packages-js build_type="Release" log_level="AUTO":
    @echo "Build js packages"
    just build-wasm {{ build_type }} {{ log_level }}
    pnpm -F img2num build

build target build_type="Release" log_level="AUTO":
    case "{{ target }}" in \
        cpp) just build-c-cpp {{ build_type }} {{ log_level }} ;; \
        js) just build-wasm {{ build_type }} {{ log_level }} ;; \
        py) just build-py {{ build_type }} {{ log_level }} ;; \
        packages-js) just build-packages-js {{ build_type }} {{ log_level }} ;; \
        all) just build-c-cpp {{ build_type }} {{ log_level }} && \
             just build-wasm {{ build_type }} {{ log_level }} && \
             just build-py {{ build_type }} {{ log_level }} && \
             just build-packages-js {{ build_type }} {{ log_level }} && \
             just react-js build && \
             just docs build ;; \
    esac

clean target:
    @echo "Remove {{ target }} folders"
    case "{{ target }}" in \
        cpp) rm -rf build-c-cpp/ ;; \
        js) rm -rf build-wasm/ ;; \
        packages-js) rm -rf packages/js/dist/ ;; \
        packages-py) rm -rf packages/py/build-py/ ;; \
    esac

docs action:
    @echo "Docusaurus server"
    case "{{ action }}" in \
        build) pnpm -F docs run build ;; \
        start) cd docs/ && pnpm run serve ;; \
    esac

react-js action:
    @echo "Run react sample app"
    case "{{ action }}" in \
        build) pnpm -F react-example run build ;; \
        start) pnpm -F react-example run dev ;; \
    esac

console-py input:
    @echo "python example-apps/console-py/main.py {{ input }}"
    uv pip install opencv-python
    uv run python3 example-apps/console-py/main.py "{{ input }}"

console-cpp input:
    @echo "./build-c-cpp/example-apps/console-cpp/console_cpp_app {{ input }}"
    ./build-c-cpp/example-apps/console-cpp/Img2NumExample_console_cpp "{{ input }}"

console-c input:
    @echo "./build-c-cpp/example-apps/console-c/console_c_app {{ input }}"
    ./build-c-cpp/example-apps/console-c/CImg2NumExample_console_c "{{ input }}"

console-js-cjs input:
    @echo "node example-apps/console-js-cjs/index.cjs {{ input }}"
    node example-apps/console-js-cjs/index.cjs "{{ input }}"

console-js-esm input:
    @echo "node example-apps/console-js-esm/index.mjs {{ input }}"
    node example-apps/console-js-esm/index.mjs "{{ input }}"

html-js script:
    pnpm -F html-js "{{script}}"
