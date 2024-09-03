# Style Guide

This document outlines the coding standards and guidelines for the CiteEase project. We use ESLint and Prettier to maintain consistent code style and quality.

## Coding Standards

### General Guidelines

-   Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.
-   Write clear, readable, and maintainable code.
-   Use descriptive variable and function names.

### File Naming

-   Use **camelCase** for file names and variables.
-   Use **PascalCase** for React component file names.

### Indentation

-   Use 4 spaces for indentation.

### Quotes

-   Use double quotes (`"`) for strings, except when using template literals.

### Semicolons

-   Always use semicolons at the end of statements.

### Line Length

-   Limit lines to 120 characters.

## ESLint Configuration

We use ESLint to enforce code quality and consistency. The configuration includes:

```json
{
    "plugins": ["react", "import", "jsx-a11y", "prettier", "@typescript-eslint"],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "airbnb",
        "plugin:import/errors",
        "plugin:jsx-a11y/recommended",
        "plugin:prettier/recommended"
    ]
}
```

## Scripts

Use the following npm scripts to manage code quality and formatting:

-   **Lint Code:**

    ```bash
    npm run lint
    ```

    This command runs ESLint on your codebase to identify and report issues.

-   **Fix Linting Issues:**

    ```bash
    npm run lint:fix
    ```

    This command automatically fixes fixable ESLint issues in your codebase.

-   **Format Code:**

    ```bash
    npm run format
    ```

    This command formats your code using Prettier according to the specified configuration.

## Additional Resources

-   [ESLint Documentation](https://eslint.org/docs/user-guide/getting-started)
-   [Prettier Documentation](https://prettier.io/docs/en/index.html)
