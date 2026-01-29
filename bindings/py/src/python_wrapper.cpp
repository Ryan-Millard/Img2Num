#include <pybind11/pybind11.h>
#include "img2num.h"

namespace py = pybind11;

PYBIND11_MODULE(img2num, m) {
    m.doc() = "Img2Num library";

    //m.def("some_function", &some_function, "A function from Img2Num");
}
