cmake_minimum_required(VERSION 3.16)
project(PythonBindings LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB_RECURSE BINDING_SRC CONFIGURE_DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/src/*.cpp")

find_package(Python3 COMPONENTS Interpreter Development REQUIRED)

find_package(PythonLibs REQUIRED)
set(PYTHON_MODULE_EXTENSION ".so" CACHE INTERNAL "Cross python lib extension")

find_package(pybind11 REQUIRED)
pybind11_add_module(img2num ${BINDING_SRC})

target_link_libraries(img2num PRIVATE CImg2Num)

target_include_directories(img2num PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/include"
)

include(GNUInstallDirs)

install(TARGETS img2num
    COMPONENT python
    LIBRARY DESTINATION "${Python3_SITEARCH}"
    RUNTIME DESTINATION "${Python3_SITEARCH}"
)
