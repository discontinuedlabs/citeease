# Getting Started with CiteEase

Welcome to CiteEase! This guide will help you set up and run the application on your local machine.

## Prerequisites

Before you start, ensure you have the following installed:

- **Docker:** Download and install Docker from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

## Building and Running the Application

Follow these steps to get CiteEase up and running:

1. **Clone the Repository**

    ```bash
    git clone https://github.com/discontinuedlabs/citeease.git
    ```

2. **Navigate to the Project Directory**

    ```bash
    cd citeease
    ```

3. **Build the Docker Image**

    The Dockerfile in this repository uses `node:18-alpine` as the base image. To build the Docker image, use:

    ```bash
    docker build -t <image-name> .
    ```

    Replace `<image-name>` with your preferred name for the Docker image.

    Ensure Docker Desktop is running on your machine.

4. **Run the Docker Container**

    ```bash
    docker run -p 3000:3000 <image-name>
    ```

    You can now access the app at `http://localhost:3000`.

## Troubleshooting

If you encounter issues during setup, check the following:

- Ensure Docker is running properly on your system.
- Verify that you have correctly followed all the steps.

For further assistance, please [open an issue](https://github.com/discontinuedlabs/citeease/issues) and use the provided [Issue Template](ISSUE_TEMPLATE.md) or contact us at [discontinuedlabs@gmail.com](mailto:discontinuedlabs@gmail.com).