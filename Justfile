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
    \t all: build all of above \n \
    clean <target>: \n \
    \t cpp: delete c++ and c build folder (build-c-cpp) \n \
    \t js: delete js build folder (build-wasm) \n \
    docs <action>: \n \
    \t build: build docusaurus server \n \
    \t start: start docusaurus server on port 3000 \n \
    react-js <action>: \n \
    \t build: build example browser app \n \
    \t start: start example browser app on port 5173 \n \
    console-cpp <input_image>: run example C++ app on input image \n \
    console-c <input_image>: run example C app on input image \n \
    console-py <input_image>: run example python app on input image \n \
    "

init:
    @echo "Pulling submodules"
    git submodule update --init

format:
    @echo "Format all files"
    pnpm format

build-c-cpp:
    @echo "Build C++ core and C bindings"
    cmake -B build-c-cpp/ .
    cmake --build build-c-cpp/

build-wasm:
    @echo "Build JS bindings"
    emcmake cmake -DCMAKE_BUILD_TYPE=Release -B build-wasm/ .
    cmake --build build-wasm/

build-py:
    @echo "Build python bindings and py package"
    uv sync --reinstall
    uv build --wheel

build target:
    case "{{ target }}" in \
        cpp) just build-c-cpp ;; \
        js) just build-wasm ;; \
        py) just build-py ;; \
        all) just build-c-cpp build-wasm build-py ;; \
    esac

clean target:
    @echo "Remove {{ target }} folders"
    case "{{ target }}" in \
        cpp) rm -rf build-c-cpp/ ;; \
        js) rm -rf build-wasm/ ;; \
    esac

docs action:
    @echo "Docusaurus server"
    case "{{ action }}" in \
        build) pnpm -F docs run build ;; \
        start) cd docs/ && pnpm run serve ;; \
    esac

react-js action: build-wasm
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
    ./build-c-cpp/example-apps/console-cpp/console_cpp_app "{{ input }}"

console-c input:
    @echo "./build-c-cpp/example-apps/console-c/console_c_app {{ input }}"
    ./build-c-cpp/example-apps/console-c/console_c_app "{{ input }}"
