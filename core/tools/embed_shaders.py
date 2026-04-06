import sys, pathlib

shader_dir = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])

files = list(shader_dir.glob("*.wgsl"))

with open(out, "w") as f:
    f.write("#include <array>\n")
    f.write("#include <string_view>\n")
    f.write("#include <string>\n\n")


    f.write("namespace embedded_shaders {\n")
    f.write("struct ShaderEntry {\n")
    f.write("    std::string_view id;\n")
    f.write("    std::string_view source;\n")
    f.write("};\n")

    for file in files:
        name = file.stem
        text = file.read_text()

        # escape for C++ raw string
        f.write(f'constexpr char {name}[] = R"WGSL(\n{text}\n)WGSL";\n')
    
    f.write("constexpr std::array<ShaderEntry, 9> shaders = {{\n")
    for file in files:
        name = file.stem
        f.write(f'    {{"{name}", {name}}},\n')
    f.write("}};\n")

    f.write("}\n")