# Part 1: WebGPU Fundamentals

URL: https://img2num.dev/docs/internal/core/internal-code/webgpu/fundamentals

WebGPU is an explicit graphics and compute API. Unlike older APIs (like OpenGL) that hid memory management and scheduling behind a "black box" driver, WebGPU forces the developer to declare exactly what data goes where and when.

important
For a compute-focused application, you only need to understand the **Compute Pipeline** .

## The Hardware Hierarchy

WebGPU maps your code to the physical GPU using a strict hierarchy of objects:

- **Instance:** The connection to the host OS and the WebGPU implementation (Google Dawn in this context).
- **Adapter:** A physical piece of hardware (e.g., "NVIDIA RTX 4090" or "Apple M2").
- **Device:** The logical connection to the Adapter. You use the Device to create buffers, textures, and shaders.
- **Queue:** The actual submission line. You record commands on the CPU and push them into the Queue for the GPU to execute asynchronously.

## The Execution Hierarchy (Workgroups)

When you dispatch a compute shader, the GPU does not run it on a single thread. It spawns thousands of threads in a structured grid.

- **Grid:** The total amount of work (e.g., calculating 1 pixel for a 1920x1080 image).
- **Workgroup:** A localized block of threads (e.g., 16x16 threads). Threads inside the same workgroup can share memory and synchronize using barriers.
- **Invocation (Thread):** A single execution of your `main()` function.
![workgroup](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgMzAwIj48ZGVmcz48bWFya2VyIGlkPSJhcnJvdyIgdmlld0JveD0iMCAwIDEwIDEwIiByZWZYPSI5IiByZWZZPSI1IiBtYXJrZXJXaWR0aD0iNiIgbWFya2VySGVpZ2h0PSI2IiBvcmllbnQ9ImF1dG8tc3RhcnQtcmV2ZXJzZSI+PHBhdGggZD0ibTAgMCAxMCA1LTEwIDV6IiBmaWxsPSIjZmZmIi8+PC9tYXJrZXI+PC9kZWZzPjxzdHlsZT4udGV4dHtmaWxsOiNmZmY7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZn0uYm94e2ZpbGw6IzJkMmQyZDtzdHJva2U6IzRjYWY1MDtzdHJva2Utd2lkdGg6Mn0udGhyZWFke2ZpbGw6IzRjYWY1MH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHN0eWxlPSJmaWxsOiMxZTFlMWUiLz48dGV4dCB4PSIyMCIgeT0iMzAiIGNsYXNzPSJ0ZXh0IiBmb250LXNpemU9IjIwIj5Db21wdXRlIEdyaWQgKEltYWdlKTwvdGV4dD48cGF0aCBjbGFzcz0iYm94IiBzdHJva2U9IiMyMTk2ZjMiIGQ9Ik0yMCA1MGgyMDB2MjAwSDIweiIvPjxwYXRoIGNsYXNzPSJib3giIGQ9Ik0yMCA1MGg2NnY2NkgyMHoiLz48dGV4dCB4PSIzMCIgeT0iODAiIGNsYXNzPSJ0ZXh0IiBmb250LXNpemU9IjEyIj5Xb3JrZ3JvdXA8L3RleHQ+PHRleHQgeD0iMzAiIHk9Ijk1IiBjbGFzcz0idGV4dCIgZm9udC1zaXplPSIxMiI+KDE2eDE2KTwvdGV4dD48cGF0aCBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgbWFya2VyLWVuZD0idXJsKCNhcnJvdykiIGQ9Im0xMDAgODAgMTgwIDcwIi8+PHBhdGggY2xhc3M9ImJveCIgZD0iTTMwMCA1MGgyMDB2MjAwSDMwMHoiLz48dGV4dCB4PSIzMTAiIHk9IjQwIiBjbGFzcz0idGV4dCIgZm9udC1zaXplPSIxNiI+MSBXb3JrZ3JvdXAgKDI1NiBUaHJlYWRzKTwvdGV4dD48Y2lyY2xlIGN4PSIzMzAiIGN5PSI4MCIgcj0iMTAiIGNsYXNzPSJ0aHJlYWQiLz48Y2lyY2xlIGN4PSIzNjAiIGN5PSI4MCIgcj0iMTAiIGNsYXNzPSJ0aHJlYWQiLz48Y2lyY2xlIGN4PSIzOTAiIGN5PSI4MCIgcj0iMTAiIGNsYXNzPSJ0aHJlYWQiLz48dGV4dCB4PSI0MjAiIHk9Ijg1IiBjbGFzcz0idGV4dCIgZm9udC1zaXplPSIxNCI+Li4uIEludm9jYXRpb25zPC90ZXh0Pjx0ZXh0IHg9IjMxMCIgeT0iMjcwIiBjbGFzcz0idGV4dCIgZm9udC1zaXplPSIxNCI+VGhyZWFkcyBzaGFyZSBsb2NhbCBtZW1vcnkgJmFtcDsgYmFycmllcnM8L3RleHQ+PC9zdmc+)

## Memory & Bind Groups

Shaders cannot magically access CPU variables. You must explicitly bind memory:

- **Buffers:** Raw arrays of bytes ( `wgpu::Buffer` ). Used for uniform variables (params) or large data arrays (storage).
- **Textures:** Optimized grids of pixels ( `wgpu::Texture` ).
- **Bind Groups:** A specific layout mapping your C++ buffers/textures to the `@binding(X)` slots in your WGSL code.
