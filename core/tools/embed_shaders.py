import sys, pathlib

shader_dir = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])

files = list(shader_dir.glob("*.wgsl"))

with open(out, "w") as f:
    f.write("#include <unordered_map>\n")
    f.write("#include <string_view>\n")
    f.write("#include <string>\n\n")

    f.write("namespace embedded_shaders {\n")

    for file in files:
        name = file.stem
        text = file.read_text()

        # escape for C++ raw string
        f.write(f'static const char {name}[] = R"WGSL(\n{text}\n)WGSL";\n')

    f.write("\ninline std::unordered_map<std::string,std::string_view> shaders = {\n")

    for file in files:
        name = file.stem
        f.write(f'    {{"{name}", {name}}},\n')

    f.write("};\n")
    f.write("}\n")