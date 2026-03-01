import CodeBlock from '@theme/CodeBlock';

export default function C_Cpp_Page({ libType = "C++"}) {
  const libName = libType === "C++" ? "Img2Num" : "CImg2Num";
  const headerName = libType === "C++" ? "img2num.h" : "cimg2num.h";

  return (
    <>
      <h2>Using a Git Submodule</h2>

      <h3>Add the Submodule</h3>
      <CodeBlock language="bash" title="Add Img2Num as a submodule in the folder `Img2Num`">
{`git submodule add https://github.com/Ryan-Millard/Img2Num.git Img2Num
git submodule update --init --recursive`}
      </CodeBlock>

      <h3>Update your CMakeLists.txt</h3>
      <CodeBlock language="cmake" title="Add Img2Num as a subdirectory and link the library">
{`add_subdirectory(Img2Num)
target_link_libraries(<your-project-name> PRIVATE ${libName})`}
      </CodeBlock>

      <h3>Include an Img2num Header</h3>
      <CodeBlock language="cpp" title="Include any public header">
{`#include "${headerName}"`}
      </CodeBlock>

      <h3>Build your project</h3>
      <CodeBlock language="build" title="Initialise CMake and build the project">
{`cmake -B build .
cmake --build build`}
      </CodeBlock>
    </>
  );
}
