cmake_minimum_required(VERSION 3.16)
project(PythonBindings LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE BINDING_SRC CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")

find_package(Python3 COMPONENTS Interpreter Development REQUIRED)

find_package(pybind11 REQUIRED)
pybind11_add_module(img2num ${BINDING_SRC})

target_link_libraries(img2num PRIVATE Img2Num)

target_include_directories(img2num PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/include"
)

message(STATUS "${Python3_SITEARCH}")
set_target_properties(img2num PROPERTIES
    LIBRARY_OUTPUT_DIRECTORY "${Python3_SITEARCH}"
)
