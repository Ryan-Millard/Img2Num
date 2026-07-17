# Security Policy

Thank you for helping keep Img2Num and its users secure. We take security issues seriously and appreciate responsible disclosure.

## Supported Versions

Security updates are provided for the latest **v0.2.x** release series of each component. The `main` branch is actively maintained for development, but it is not a supported release channel.

| Component                           | Supported Versions |     Supported      |
| ----------------------------------- | ------------------ | :----------------: |
| C++ Library                         | `v0.2.x`           | :white_check_mark: |
| C Bindings                          | `v0.2.x`           | :white_check_mark: |
| JavaScript Package                  | `v0.2.x`           | :white_check_mark: |
| Python Package                      | `v0.2.x`           | :white_check_mark: |
| Development (`main`)                | `Latest`           |  Development Only  |
| Older releases (v0.1.x and earlier) | -                  |        :x:         |

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

- **GitHub Security Advisories** (preferred): Use the repository's **Report a vulnerability** feature under the **Security** tab.
- **Email:** [security@img2num.dev](mailto:security@img2num.dev)

Please include as much information as possible:

- A clear description of the vulnerability.
- The affected component and version(s).
- Steps to reproduce the issue.
- Proof-of-concept code or screenshots, if applicable.
- The potential impact.
- Any suggested mitigation or fix (optional).

## What You Can Expect

After receiving your report, we aim to:

- Acknowledge receipt within **3 business days**.
- Keep you informed of our progress throughout the investigation.
- Validate and reproduce the issue.
- Develop and test a fix if the report is confirmed.
- Coordinate a responsible disclosure timeline before any public announcement.

Response times may vary depending on the severity and complexity of the issue.

## Scope and Authorized Security Testing

This policy covers security research performed in good faith against Img2Num assets that are owned and operated by the project, including:

- The source code in this repository and official releases published by the project.
- Official Img2Num language bindings, packages, command-line tools, and example applications.
- Official build, packaging, and Docker image definitions.
- The official Img2Num website and services owned or operated by the project.

Security testing is authorized only when it is limited to these assets and is performed without harming users, systems, or data.

> [!CAUTION]
>
> ### Do not:
>
> - Disrupt, degrade, or deny service to Img2Num or third-party systems.
> - Access, modify, delete, or exfiltrate data that does not belong to you.
> - Test accounts, credentials, infrastructure, domains, APIs, or services not explicitly owned or operated by Img2Num.
> - Use social engineering, phishing, physical attacks, spam, or denial-of-service techniques.
> - Publicly disclose a vulnerability before coordinating with the project maintainers.

Third-party dependency vulnerabilities should be reported to the relevant maintainer unless the issue is caused by Img2Num's integration or configuration.

Subject to these conditions, the project will not pursue legal action against researchers acting in good faith under this policy. This statement does not authorize activity that violates applicable law or affects systems outside the authorized scope.

## Security Best Practices

If you use Img2Num in production, we recommend that you:

- Keep Img2Num updated to the latest supported release.
- Keep your compiler, runtime, and operating system up to date.
- Validate untrusted input before processing it.
- Run image processing workloads with appropriate resource limits where possible.
- Monitor dependency updates for known vulnerabilities.

## Hall of Thanks

With the reporter's permission, verified security researchers who responsibly disclose vulnerabilities may be acknowledged in the project's release notes or documentation.

## Legal Safe Harbor

We support responsible security research conducted in good faith. We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, or service disruption.
- Report vulnerabilities promptly and privately.
- Allow reasonable time for a fix before public disclosure.
- Do not exploit vulnerabilities beyond what is necessary to demonstrate their existence.

We ask researchers to respect user privacy and applicable laws throughout the testing process.
