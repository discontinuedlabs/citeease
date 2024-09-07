# CiteEase: Open-Source Citation Management App

[![Build](https://github.com/discontinuedlabs/citeease/actions/workflows/build.yml/badge.svg)](https://github.com/discontinuedlabs/citeease/actions/workflows/build.yml)
[![Test](https://github.com/discontinuedlabs/citeease/actions/workflows/test.yml/badge.svg)](https://github.com/discontinuedlabs/citeease/actions/workflows/test.yml)
[![Lint](https://github.com/discontinuedlabs/citeease/actions/workflows/lint.yml/badge.svg)](https://github.com/discontinuedlabs/citeease/actions/workflows/lint.yml)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)
![License](https://img.shields.io/github/license/discontinuedlabs/citeease)

**Welcome to CiteEase, an open-source Progressive Web App (PWA) for managing citations and collaborating on bibliographies.**

## Table of Contents

-   [What is CiteEase?](#what-is-citeease)
-   [Key Features](#key-features)
-   [Upcoming Features (to-do)](#upcoming-features-to-do)
-   [Getting Started](#getting-started)
-   [Contributing](#contributing)
-   [Reporting Issues](#reporting-issues)
-   [Testing](#testing)
-   [License](#license)
-   [Contact](#contact)
-   [Acknowledgments](#acknowledgments)

## What is CiteEase?

CiteEase is a powerful and user-friendly open-source citation management app designed for students, researchers, and anyone who values efficiency and organization.

## Key Features

-   **Unlimited Usage:** No sign-in required for most functionalities, unless you want to sync data across devices, restore passwords, and collaborate.
-   **Offline Functionality:** Work on your bibliographies seamlessly, even without an internet connection.
-   **Drag-and-Drop Everywhere**: Effortlessly interact with your citations using intuitive drag-and-drop actions. Add references to your Word doc, delete unwanted entries, import citations or bibliographies, and export your data with a simple drag-and-drop.
-   **Open-Source Availability:** CiteEase is open-source, with code freely available for anyone to view, modify, and share. This allows for transparency and customization to your needs.
-   **Advanced Citation Generation:**
    -   Choose the reference type (book, article, webpage, etc.) from a dedicated menu for easier citation creation.
    -   Import citations from various file formats (JSON, LaTeX) to seamlessly integrate existing bibliographies.
    -   Enter multiple unique identifiers (URLs, DOIs, ISBNs, PMIDs, PMCIDs) at once. CiteEase will intelligently retrieve data and generate citations for each, minimizing manual entry.
-   **Advanced Citation Management:**
    -   Over 10,000 citation styles supported, with the ability to add custom CSL files for even more flexibility.
    -   Manage citations with ease: add, edit, move, copy, delete, and export them in various formats (CSL, BibTeX, BibLaTeX, BibTXT, JSON, Word, PDF).
    -   Search, filter, group by, and sort your citations for effortless organization.
-   **Collaboration Features:**
    -   Open collaboration on bibliographies using a unique identifier and password.
    -   Collaborate with others in real-time, allowing everyone to add, modify, or delete citations within a shared bibliography.

## Upcoming Features (to-do)

-   [ ] Integration with popular reference managers (Zotero, Mendeley, EndNote).
-   [ ] Version control to track changes and revert to previous versions (local for privacy).
-   [ ] Advanced search with filters and Boolean operators for specific fields.
-   [ ] CSL file manager to create, customize, and manage citation styles (including update checks and adding new ones).
-   [ ] Raw JSON Entry mode for advanced users to input citation data directly into predefined JSON structures (e.g., CSL-JSON, BibJSON).
-   [ ] Custom Source Templates feature allowing users to create, export, and import personalized citation templates beyond the standard options (book, webpage, journal article, etc.).

## Getting Started

To get up and running with CiteEase, follow the instructions in our [GETTING_STARTED.md](GETTING_STARTED.md) file.

## Contributing

We actively welcome contributions from the community! To get started, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file and use the provided [Pull Request Template](PULL_REQUEST_TEMPLATE.md) when submitting changes.

## Reporting Issues

If you encounter any issues or have suggestions for new features, you can use the following templates:

- For **bug reports**, please [open a bug issue](https://github.com/discontinuedlabs/citeease/issues/new?template=bug.yml) and provide as much detail as possible.
- For **feature requests**, please [open a feature request](https://github.com/discontinuedlabs/citeease/issues/new?template=feature.yml) and describe your idea and its use case.

Alternatively, you can visit our [Discussions page](https://github.com/discontinuedlabs/citeease/discussions) for questions, ideas, or general support.

## Testing

Rigorous testing is essential for ensuring the quality and stability of any application. We acknowledge its importance and plan to incorporate a comprehensive testing suite in the future. Currently, however, automated testing is not actively implemented in this project.

## License

CiteEase is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For inquiries or more information, you can reach out to us at [discontinuedlabs@gmail.com](mailto:discontinuedlabs@gmail.com).

## Acknowledgments

CiteEase utilizes CSL style files from [Citation Style Language Styles](https://github.com/citation-style-language/styles) and XML locales files from [Citation Style Language Locales](https://github.com/citation-style-language/locales), both of which are licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](https://creativecommons.org/licenses/by-sa/3.0/). We extend our gratitude to these projects for providing essential resources that enhance the functionality and versatility of CiteEase.

**We hope you find CiteEase to be a valuable tool for your research endeavors!**
