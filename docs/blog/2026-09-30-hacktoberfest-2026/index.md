---
slug: hacktoberfest-2026
title: "Contribute to Img2Num this October 🦔"
authors: [prachi-gupta]
tags: [hacktoberfest, open-source, community, contributing]
description: "It's [Hacktoberfest](https://hacktoberfest.com/) season! Here's how to make your first (or next) open source contribution to Img2Num, and where to start."
image: ./img/social.png
---

![Hero](./img/social.png)

<p style={{ fontSize: "2em" }}>October is [Hacktoberfest](https://hacktoberfest.com/) season, and we'd love for this to be the month you contribute to **Img2Num**!</p>

> Whether you're a seasoned open source contributor or someone making their very first pull request, we'd love to have you
> join us.

{/* truncate */}

## What is [Hacktoberfest](https://hacktoberfest.com/)?

:::tip[Summary]

[Hacktoberfest](https://hacktoberfest.com/) is a month-long celebration of open source software that runs every October. It started in 2014 as a pull-request
challenge, and for over a decade it introduced thousands of developers to open source.

:::

**This year is a bit different.** [Hacktoberfest](https://hacktoberfest.com/) 2026, run by Major League Hacking (MLH) and DEV with DigitalOcean, has moved
away from counting pull requests and toward in-person and online events focused on building with open source AI. The
reason is one every maintainer will recognise:

> low-effort, AI-generated PRs were flooding projects with noise

So to be clear: **contributions to Img2Num won't count toward anything official this year.** No PR counter, no t-shirt.
But October is still a great month to start contributing to open source, and we're still here to help you do it.

We agree with the spirit of the change, too. One well-thought-out and meaningful contribution is worth far more than ten low-effort AI-generated ones.

## Where Img2Num fits in

This year's [Hacktoberfest](https://hacktoberfest.com/) theme is **AI belongs to everyone**. Img2Num isn't an LLM or agent project, but it lives in
the same world: it's built on classical computer vision and machine learning, including k-means clustering for colour
quantization, plus contour tracing and skeletonization.

If you're curious about how machines actually make sense of images, before any neural network gets involved, this is a
great place to learn.

## Why contribute to Img2Num?

Img2Num is a fast, accurate raster-to-SVG vectorization library built in C++ with library support for C++, C, Python, and JavaScript. It is
actively used, actively maintained, and actively growing - all thanks to our users and contributors.

Here's what makes contributing to Img2Num worthwhile for **you**:

:::note[Real experience]
You'll work with C and C++, JavaScript and WebAssembly, Python, React, and Docusaurus. These are technologies used in production systems.
:::

:::info[CV/resume material]
Open source contributions are one of the best ways to demonstrate your skills to future employers.
A merged PR in a real project is worth more than most personal projects.
:::

:::warning[Mentorship]
We actively mentor newcomers. You will not be left alone to figure things out. We review PRs carefully and explain our feedback.

If you get stuck along the way, give us a shout on [Discord](https://discord.gg/BHjxcCqAnU) - someone's usually around.
:::

:::danger[Long-term community]
October is just the start. Some of our maintainers started with a single small PR.
:::

And here's what your contributions give **us**:

- More work done. The project moves faster with more hands - there's always something that needs to be done.
- Fresh perspectives. Newcomers often spot things that long-time contributors overlook.
- Long-term contributors. Some of the best team members started as first-timers.

## New to open source? We've got you covered.

> First of all: **THANK YOU!**
>
> Even the smallest contributions can be enormously helpful and the fact that you're
> considering contributing to an open source project is amazing.

If this is your first time exploring open source, you might be wondering where to even begin.

We know exactly how difficult and confusing it can feel when you start contributing to open source. There are unfamiliar
repositories, contribution guidelines, issues, pull requests, branches, reviews, and a lot of new terminology to figure
out. Your first contribution can feel much more complicated than it actually is.

That's why we've created a bunch of
[**Good First Issues specifically for newcomers**](https://github.com/Ryan-Millard/Img2Num/issues/views/MDI0OlJlcG9zaXRvcnlTZWFyY2hTaG9ydGN1dDExNTU%3D).
You don't need to be an open source expert to get started,
and you don't need to know everything before making your first contribution.

:::note[Good First Issues]

Find small bugs, documentation updates, and isolated features curated for new contributors.

<a href="https://github.com/Ryan-Millard/Img2Num/issues/views/MDI0OlJlcG9zaXRvcnlTZWFyY2hTaG9ydGN1dDExNTU%3D" target="_blank" rel="noopener noreferrer" style={{ display: "flex", justifyContent: "center" }}>
  View Issues on GitHub →
</a>

:::

Start with an issue that interests you, read the contributing guide, and ask questions whenever you're stuck. We'll help
you understand the project and the contribution process along the way.

And don't worry if your first contribution is something small. Fixing documentation, improving an example, adding a
test, fixing a typo, or making a small improvement is still a real contribution that we need!

**If you're new to open source, we've got you covered. 🦔**

Check out our
[Good First Issues](https://github.com/Ryan-Millard/Img2Num/issues/views/MDI0OlJlcG9zaXRvcnlTZWFyY2hTaG9ydGN1dDExNTU%3D)
and find something that feels approachable.

## Beyond Img2Num

While you're in the open source spirit, we'd also encourage you to look beyond Img2Num.

Img2Num is built on top of and alongside several amazing open source projects. These projects provide important building
blocks and baseline functionality that help make Img2Num possible.

If you enjoy working on Img2Num, you might also find something interesting to contribute to in the projects we depend
on:

- [**Dawn**](https://dawn.googlesource.com/dawn). Google's WebGPU implementation, which powers our GPU acceleration.
- [**spdlog**](https://github.com/gabime/spdlog). The fast C++ logging library we use.
- [**STB**](https://github.com/nothings/stb). Single-file C libraries used in our example apps.
- [**Pybind11**](http://github.com/pybind/pybind11). The library that allows us to make our Python library possible.
- [**Emscripten**](https://emscripten.org/). The compiler toolchain that converts our C++ code into WebAssembly, which
  powers our JavaScript library.
- [**Docusaurus**](https://github.com/facebook/docusaurus). The framework that powers our documentation site.
- [**OpenCV**](https://github.com/opencv/opencv). Used in our Python example app.

These projects are a small part of the open source ecosystem that Img2Num is built with and around. They have their own issues,
documentation, tests, features, and communities that can benefit from new contributors too.

> There are many more open source projects that have made Img2Num possible. If you contribute towards improving one of
> them, you're basically improving Img2Num.

So if you find yourself thinking, "I want to contribute to open source, but maybe Img2Num isn't the right project for
me," that's completely fine.

Explore these projects, find something that interests you, and make your first contribution there.

Every contribution to any open source project makes the ecosystem better for everyone.

## See you in October 🦔

We're excited to meet you. Whether you fix a typo or implement a feature, your contribution matters.

Come say hello on [our Discord server](https://discord.gg/BHjxcCqAnU) for quick questions and chat, or open a thread in
[our Discussions](https://github.com/Ryan-Millard/Img2Num/discussions) for ideas, proposals, and anything worth keeping
searchable. Then pick up an issue, and let's build something great together.
