# CiteEase: Open-Source Citation Management App

**Welcome to CiteEase, an open-source Progressive Web App (PWA) for managing citations and collaborating on bibliographies.**

## Table of Contents

-   [What is CiteEase?](#what-is-citeease)
-   [Key Features](#key-features)
-   [Upcoming Features (to-do)](#upcoming-features-to-do)
-   [Getting Started](#getting-started)
-   [Testing](#testing)
-   [Contributing](#contributing)
-   [License](#license)
-   [Contact](#contact)

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

- [ ] Integration with popular reference managers (Zotero, Mendeley, EndNote).
- [ ] Version control to track changes and revert to previous versions (local for privacy).
- [ ] Advanced search with filters and Boolean operators for specific fields.
- [ ] CSL file manager to create, customize, and manage citation styles (including update checks and adding new ones).
- [ ] Raw JSON Entry mode for advanced users to input citation data directly into predefined JSON structures (e.g., CSL-JSON, BibJSON).
- [ ] Custom Source Templates feature allowing users to create, export, and import personalized citation templates beyond the standard options (book, webpage, journal article, etc.).

## Getting Started

### Prerequisites

-   **Docker:** Ensure Docker is installed on your system. You can download it from the official website: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

### Building and Running the Application

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/discontinuedlabs/citeease.git
    ```

2. **Navigate to the Project Directory:**

    ```bash
    cd citeease
    ```

3. **Build the Docker Image:**

    The Dockerfile in this repository uses `node:18-alpine` as the base image. To build the Docker image, use the following command:

    ```bash
    docker build -t <image-name> .
    ```

    Replace `<image-name>` with a name that suits your preference for the Docker image.

    Note: Make sure that Docker Desktop is running on your machine. You can check this by looking at the system tray for the Docker icon.

4. **Run the Docker Container:**

    ```bash
    docker run -p 3000:3000 <image-name>
    ```

Now you can access the app at `http://localhost:3000`.

## Testing

Rigorous testing is essential for ensuring the quality and stability of any application. We acknowledge its importance and plan to incorporate a comprehensive testing suite in the future. Currently, however, automated testing is not actively implemented in this project.

## Contributing

While we don't actively seek contributions, we appreciate your interest. If you encounter issues or have suggestions, please feel free to open an issue.

## License

CiteEase is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For inquiries or more information, you can reach out to us at [discontinuedlabs@gmail.com](mailto:discontinuedlabs@gmail.com).

**We hope you find CiteEase to be a valuable tool for your research endeavors!**
