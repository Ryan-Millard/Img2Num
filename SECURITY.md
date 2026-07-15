# Security Policy

Thank you for helping keep Img2Num and its users secure. We take security issues seriously and appreciate responsible disclosure.

## Supported Versions

Security updates are currently provided only for the latest **v0.2.x** release series of each component.

| Component                           | Supported Versions |      Supported     |
| ----------------------------------- | ------------------ | :----------------: |
| C++ Library                         | v0.2.x             | :white_check_mark: |
| C Bindings                          | v0.2.x             | :white_check_mark: |
| JavaScript Package                  | v0.2.x             | :white_check_mark: |
| Python Package                      | v0.2.x             | :white_check_mark: |
| Development (`main`)                | Latest             | :white_check_mark: |
| Older releases (v0.1.x and earlier) | -                  |         :x:        |

## Release History

| Component          | Releases               |
| ------------------ | ---------------------- |
| C++ Library        | v0.2.0, v0.1.0         |
| C Bindings         | v0.2.0, v0.1.0         |
| JavaScript Package | v0.2.1, v0.2.0, v0.1.0 |
| Python Package     | v0.2.1, v0.2.0, v0.1.0 |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues or discussions.**

Instead, report vulnerabilities privately using one of the following methods:

* **GitHub Security Advisories** (preferred): Use the repository's **Report a vulnerability** feature under the **Security** tab.
* **Email:** [security@img2num.dev](mailto:security@img2num.dev)

Please include as much information as possible:

* A clear description of the vulnerability.
* The affected component and version(s).
* Steps to reproduce the issue.
* Proof-of-concept code or screenshots, if applicable.
* The potential impact.
* Any suggested mitigation or fix (optional).

## What You Can Expect

After receiving your report, we aim to:

* Acknowledge receipt within **3 business days**.
* Keep you informed of our progress throughout the investigation.
* Validate and reproduce the issue.
* Develop and test a fix if the report is confirmed.
* Coordinate a responsible disclosure timeline before any public announcement.

Response times may vary depending on the severity and complexity of the issue.

## Scope

This policy applies to:

* The core C++ library.
* All official language bindings and packages.
* Command-line tools.
* Official example applications.
* Build and packaging scripts.
* Official Docker images.
* The Img2Num website.

Third-party dependencies should generally be reported to their respective maintainers unless the vulnerability arises from Img2Num's integration with them.

## Security Best Practices

If you use Img2Num in production, we recommend that you:

* Keep Img2Num updated to the latest supported release.
* Keep your compiler, runtime, and operating system up to date.
* Validate untrusted input before processing it.
* Run image processing workloads with appropriate resource limits where possible.
* Monitor dependency updates for known vulnerabilities.

## Hall of Thanks

With the reporter's permission, verified security researchers who responsibly disclose vulnerabilities may be acknowledged in the project's release notes or documentation.

## Legal Safe Harbor

We support responsible security research conducted in good faith. We will not pursue legal action against researchers who:

* Make a good-faith effort to avoid privacy violations, data destruction, or service disruption.
* Report vulnerabilities promptly and privately.
* Allow reasonable time for a fix before public disclosure.
* Do not exploit vulnerabilities beyond what is necessary to demonstrate their existence.

We ask researchers to respect user privacy and applicable laws throughout the testing process.
