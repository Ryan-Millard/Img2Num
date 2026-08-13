"""

    Python bindings for the img2num C++ library.

    This module provides access to Img2Num's image processing capabilities from Python.
    All image functions operate on ``numpy.ndarray`` buffers and return new image data,
    making them easy to integrate into Python-based image processing pipelines.

    
"""
from __future__ import annotations
import numpy
import numpy.typing
import typing
__all__: list[str] = ['ImageToSvgConfig', 'bilateral_filter', 'black_threshold_image', 'gaussian_blur_fft', 'image_to_svg', 'invert_image', 'kmeans', 'labels_to_svg', 'threshold_image']
class ImageToSvgConfig:
    """
    
        Configuration options for image_to_svg.
    
        This class holds parameters for bilateral filtering, K-means clustering,
        and SVG generation. All parameters have sensible defaults.
        
    """
    class BilateralFilterConfig:
        """
        
            Configuration for the bilateral filter used in image_to_svg.
            
        """
        def __init__(self) -> None:
            ...
        def __repr__(self) -> str:
            ...
        @property
        def sigma_range(self) -> float:
            """
                Standard deviation for range Gaussian (intensity similarity weight). Default: 50.0
            """
        @sigma_range.setter
        def sigma_range(self, arg0: typing.SupportsFloat | typing.SupportsIndex) -> None:
            ...
        @property
        def sigma_spatial(self) -> float:
            """
                Standard deviation for spatial Gaussian (proximity weight). Default: 3.0
            """
        @sigma_spatial.setter
        def sigma_spatial(self, arg0: typing.SupportsFloat | typing.SupportsIndex) -> None:
            ...
    class KMeansConfig:
        """
        
            Configuration for the K-means clustering used in image_to_svg.
            
        """
        def __init__(self) -> None:
            ...
        def __repr__(self) -> str:
            ...
        @property
        def k(self) -> int:
            """
                Number of clusters to compute. Roughly represents number of unique colors discovered. Default: 16
            """
        @k.setter
        def k(self, arg0: typing.SupportsInt | typing.SupportsIndex) -> None:
            ...
        @property
        def max_iter(self) -> int:
            """
                Maximum number of iterations for the K-means algorithm. Default: 100
            """
        @max_iter.setter
        def max_iter(self, arg0: typing.SupportsInt | typing.SupportsIndex) -> None:
            ...
    bilateral_filter: ImageToSvgConfig.BilateralFilterConfig
    kmeans: ImageToSvgConfig.KMeansConfig
    def __init__(self, bilateral_filter: dict = {}, kmeans: dict = {}, **kwargs) -> None:
        ...
    def __repr__(self) -> str:
        ...
    @property
    def color_space(self) -> int:
        ...
    @color_space.setter
    def color_space(self, arg0: typing.SupportsInt | typing.SupportsIndex) -> None:
        ...
    @property
    def min_cluster_area(self) -> int:
        ...
    @min_cluster_area.setter
    def min_cluster_area(self, arg0: typing.SupportsInt | typing.SupportsIndex) -> None:
        ...
    @property
    def min_thickness(self) -> int:
        ...
    @min_thickness.setter
    def min_thickness(self, arg0: typing.SupportsInt | typing.SupportsIndex) -> None:
        ...
def bilateral_filter(image: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, sigma_spatial: typing.SupportsFloat | typing.SupportsIndex, sigma_range: typing.SupportsFloat | typing.SupportsIndex, color_space: typing.SupportsInt | typing.SupportsIndex) -> numpy.typing.NDArray[numpy.uint8]:
    """
            Apply a bilateral filter to the image.
    
            Parameters
            ----------
            image : numpy.ndarray
                Input image as a uint8 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
            sigma_spatial : float
                Standard deviation for the spatial Gaussian (proximity weight).
            sigma_range : float
                Standard deviation for the range Gaussian (intensity similarity weight).
            color_space : int
                Color space identifier (e.g., 0 for LAB, 1 for sRGB).
    
            Returns
            -------
            numpy.ndarray
                Filtered image as a uint8 numpy array.
    """
def black_threshold_image(image: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, num_thresholds: typing.SupportsInt | typing.SupportsIndex) -> numpy.typing.NDArray[numpy.uint8]:
    """
            Apply thresholding with a bias in favor of black to the image.
    
            Parameters
            ----------
            image : numpy.ndarray
                Input image as a uint8 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
            num_thresholds : int
                Number of threshold levels to apply.
    
            Returns
            -------
            numpy.ndarray
                Thresholded image as a uint8 numpy array.
    """
def gaussian_blur_fft(image: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, sigma: typing.SupportsFloat | typing.SupportsIndex) -> numpy.typing.NDArray[numpy.uint8]:
    """
            Apply a Gaussian blur to the image using Fast Fourier Transform (FFT) for performance.
    
            Parameters
            ----------
            image : numpy.ndarray
                Input image as a uint8 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
            sigma : float
                Standard deviation for the Gaussian kernel.
    
            Returns
            -------
            numpy.ndarray
                Blurred image as a uint8 numpy array.
    """
def image_to_svg(data: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, cfg: ImageToSvgConfig) -> str:
    """
            Convert Image to SVG string.
    
            Parameters
            ----------
            data : numpy.ndarray
                Input image buffer.
            width : int
                Width of the image.
            height : int
                Height of the image.
            cfg : ImageToSvgConfig
                Configuration object containing filter and clustering parameters.
    
            Returns
            -------
            str
                SVG string representation of the image.
    """
def invert_image(image: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex) -> numpy.typing.NDArray[numpy.uint8]:
    """
            Invert the pixel values of an image.
    
            Parameters
            ----------
            image : numpy.ndarray
                Input image as a uint8 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
    
            Returns
            -------
            numpy.ndarray
                Inverted image as a uint8 numpy array.
    """
def kmeans(data: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, k: typing.SupportsInt | typing.SupportsIndex, max_iter: typing.SupportsInt | typing.SupportsIndex, color_space: typing.SupportsInt | typing.SupportsIndex) -> tuple[numpy.typing.NDArray[numpy.uint8], numpy.typing.NDArray[numpy.int32]]:
    """
            Perform K-means clustering on the image data.
    
            Parameters
            ----------
            data : numpy.ndarray
                Input image data as a uint8 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
            k : int
                Number of clusters to compute.
            max_iter : int
                Maximum number of iterations for the K-means algorithm.
            color_space : int
                Color space identifier (e.g., 0 for LAB, 1 for sRGB).
    
            Returns
            -------
            tuple
                A tuple containing two NumPy arrays: (clustered_data, labels).
    """
def labels_to_svg(data: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], labels: typing.Annotated[numpy.typing.ArrayLike, numpy.int32], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, min_area: typing.SupportsInt | typing.SupportsIndex, min_thickness: typing.SupportsInt | typing.SupportsIndex) -> str:
    """
            Convert labels to an SVG string.
    
            Parameters
            ----------
            data : numpy.ndarray
                Input image data as a uint8 numpy array.
            labels : numpy.ndarray
                Label map as an int32 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
            min_area : int
                Minimum cluster area to include in the SVG.
            min_thickness: int
                Minimum thickness a region must have to include in the SVG.
    
            Returns
            -------
            str
                An SVG string containing data roughly approximate to the input image.
    """
def threshold_image(image: typing.Annotated[numpy.typing.ArrayLike, numpy.uint8], width: typing.SupportsInt | typing.SupportsIndex, height: typing.SupportsInt | typing.SupportsIndex, num_thresholds: typing.SupportsInt | typing.SupportsIndex) -> numpy.typing.NDArray[numpy.uint8]:
    """
            Apply thresholding to the image.
    
            Parameters
            ----------
            image : numpy.ndarray
                Input image as a uint8 numpy array.
            width : int
                Width of the image.
            height : int
                Height of the image.
            num_thresholds : int
                Number of threshold levels to apply.
    
            Returns
            -------
            numpy.ndarray
                Thresholded image as a uint8 numpy array.
    """
