from .api import *
from .api import gaussian_blur_fft as _gaussian_blur_fft


def gaussian_blur_fft(*args, **kwargs):
    print("Running gaussian blur")
    return _gaussian_blur_fft(*args, **kwargs)
