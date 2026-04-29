{/* DO NOT CHANGE THE PAGE TITLE CHECK WITHOUT VERIFYING THAT THE PAGES THAT DEPEND ON THIS AREN'T BROKEN */}
{/* This partial is only compatible with a few pages. It is not recommended that you use it */}

import CodeBlock from "@theme/CodeBlock";
import { useDoc } from "@docusaurus/plugin-content-docs/client";

## Installing from Source Code

### Using a Git Submodule (recommended for most projects)

#### Add Img2Num as a submodule

```bash title="Add the submodule in a folder named Img2Num"
git submodule add https://github.com/Ryan-Millard/Img2Num.git Img2Num
git submodule update --init --recursive
```

#### Update your CMakeLists.txt

<CodeBlock language="cmake" title="Add Img2Num as a subdirectory and link the library">
  {`add_subdirectory(Img2Num)
target_link_libraries(<your-project-name> PRIVATE ${useDoc().metadata.title.includes("C++") ? "Img2Num" : "CImg2Num"})`}
</CodeBlock>

#### Include an Img2Num Header

<CodeBlock language="cpp" title="Include any public header">
  {`#include "${useDoc().metadata.title.includes("C++") ? "img2num" : "cimg2num"}"`}
</CodeBlock>

#### Build your project

```cmake title="Initialise CMake and build the project"
cmake -B build .
cmake -S . --build build
```

You should be good to go now!

### Using `find_package`

#### Clone Img2Num

```bash
git clone --recursive https://github.com/Ryan-Millard/Img2Num.git
cd Img2Num
```

#### Build Img2Num

```bash
cmake -S . -B build
cmake --build build
```

:::tip Failed to build?

```bash title="Try running this to refresh the submodules"
git submodule update --init --recursive
```

If that doesn't work, please open an issue or a discussion on our [GitHub repository](https://github.com/Ryan-Millard/Img2Num).
:::

#### Install the library

```bash
cmake --install build
```

```bash title="Optional: Go back to original directory"
cd ..
```

#### Update your CMakeLists.txt

<CodeBlock language="cmake" title="Add Img2Num as a subdirectory and link the library">
  {`find_package(Img2Num REQUIRED)
target_link_libraries(my_app PRIVATE Img2Num::Img2Num)`}
</CodeBlock>

#### Include an Img2Num Header

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

<Tabs
  defaultValue="namespaced-include"
  values={[
    { label: "Namespaced", value: "namespaced-include" },
    { label: "Normal", value: "normal-include" },
  ]}
>
  <TabItem value="namespaced-include">
    <CodeBlock language="cpp" title="Include any public header">
      {`#include <${useDoc().metadata.title.includes("C++") ? "img2num/img2num" : "cimg2num/cimg2num"}.h>`}
    </CodeBlock>
  </TabItem>
  <TabItem value="normal-include">
    <CodeBlock language="cpp" title="Include any public header">
      {`#include <${useDoc().metadata.title.includes("C++") ? "img2num" : "cimg2num"}.h>`}
    </CodeBlock>
  </TabItem>
</Tabs>

You should be good to go now!
