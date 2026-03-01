<!--DO NOT CHANGE THE PAGE TITLE CHECK WITHOUT VERIFYING THAT THE PAGES THAT DEPEND ON THIS AREN'T BROKEN-->
import CodeBlock from '@theme/CodeBlock';
import { useDoc } from '@docusaurus/plugin-content-docs/client';

## Using a Git Submodule

### Add the Submodule

```bash title="Add Img2Num as a submodule in the folder Img2Num"
git submodule add https://github.com/Ryan-Millard/Img2Num.git Img2Num
git submodule update --init --recursive
```

### Update your CMakeLists.txt

<CodeBlock language="cmake" title="Add Img2Num as a subdirectory and link the library">
{`add_subdirectory(Img2Num)
target_link_libraries(<your-project-name> PRIVATE ${useDoc().metadata.title.includes("C++") ? "Img2Num" : "CImg2Num"})`}
</CodeBlock>

### Include an Img2Num Header

<CodeBlock language="cpp" title="Include any public header">
{`#include "${useDoc().metadata.title.includes("C++") ? "img2num" : "cimg2num"}"`}
</CodeBlock>

### Build your project

```cmake title="Initialise CMake and build the project"
cmake -B build .
cmake --build build
```
