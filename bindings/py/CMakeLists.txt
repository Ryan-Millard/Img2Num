# =================================================================
# Python bindings via pybind11
# =================================================================
find_package(Python COMPONENTS Interpreter Development REQUIRED)
find_package(pybind11 REQUIRED)

pybind11_add_module(img2num_python
    src/python_wrapper.cpp
)

# Link Python module to shared core library
target_link_libraries(img2num_python PRIVATE img2num_core)
target_include_directories(img2num_python PRIVATE ${CMAKE_SOURCE_DIR}/core/include)
