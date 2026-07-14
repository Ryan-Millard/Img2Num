# Submitting Pull Requests

URL: https://img2num.dev/docs/contributing/pull-requests

Thank you for contributing to Img2Num!

This page explains the workflow for contributing changes to the project.

## 1. Fork the repository

### Create your own fork

Before making any changes, create your own fork of the Img2Num repository on GitHub.

You should clone **your fork** , not the main repository.

Not sure how to fork?
If you're not sure how to create a fork, see [GitHub's guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo) .

### Clone your fork

After creating the fork, clone it:

```bash
git clone https://github.com/<your-username>/Img2Num.git
```

If you have not already set up your development environment, see theProject Setup guide.

## 2. Create a branch

Create a new branch from the latest `dev` branch.

Choose a descriptive branch name, for example:

```text
fix/image-loading
```

or

```text
feature/python-bindings
```

## 3. Develop your changes

Before opening a pull request, make sure you have:

- claimed the issue (if applicable; seeClaiming Issues ),
- built the project successfully,
- tested your changes locally,
- updated any relevant documentation,
- ensured your changes are ready for review.

## 4. Push your branch

Commit your changes and push them to your fork.

```bash
git push origin <your-branch>
```

## 5. Open a pull request

Open a pull request from your fork's branch **into the `dev` branch** of the main Img2Num repository.

Target the `dev` branch
Do **not** open pull requests against `main` . All contributions are merged into `dev` first so they can be tested before being included in a future release.

When creating your pull request:

- use a clear, descriptive title,
- explain what your changes do,
- reference the issue it resolves (if applicable; see [GitHub's keyword docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/using-keywords-in-issues-and-pull-requests) ).

## 6. Automated checks

After your pull request is opened, GitHub automatically runs the project's workflows.

These workflows verify that the project still builds and that the contribution meets the project's quality requirements.

tip
Please wait for all workflow checks to complete before requesting a review.

If any workflow fails, inspect the logs, make the necessary fixes, and push another commit. The pull request will update automatically and the workflows will run again.

## 7. Code review

A project maintainer will review your pull request.

You may be asked to:

- improve the implementation,
- fix bugs or edge cases,
- update documentation,
- or make other changes before the pull request can be merged.
This is a normal part of the review process.

Simply push additional commits to the same branch - the pull request will update automatically.

## 8. Merge and testing

Once approved, your pull request will be merged into the `dev` branch.

The `dev` branch serves as Img2Num's integration branch, allowing changes from multiple contributors to be tested together before they become part of an official release.

After sufficient testing, changes are merged from `dev` into `main` .

## 9. After your pull request is merged

After your pull request has been merged:

- the associated issue may be closed,
- your contribution becomes part of the development branch,
- you can safely delete your feature branch from your fork if you no longer need it.
Thank you for helping improve Img2Num!🦔🦔🦔🦔🦔🦔🦔🦔
