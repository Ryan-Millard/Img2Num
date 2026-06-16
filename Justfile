version := "0.0.0"
current_date := `date +%Y-%m-%d`

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
    uv pip install opencv-python

build-all: build-c-cpp build-wasm build-py

clean:
    @echo "Remove build folders"
    rm -rf build-wasm/
    rm -rf build-c-cpp/

docs:
    @echo "Generate docusaurus server"
    pnpm -F docs run build

react-app: build-wasm
    @echo "Run react sample app"
    cd example-apps/react-js && pnpm run dev
