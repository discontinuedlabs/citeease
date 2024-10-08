/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    mode: "jit",
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Oxygen",
                    "Ubuntu",
                    "Cantarell",
                    "Open Sans",
                    "Helvetica Neue",
                    "sans-serif",
                ],
                cambo: [
                    "Cambo",
                    "Amiri",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "Oxygen",
                    "Ubuntu",
                    "Cantarell",
                    "Open Sans",
                    "Helvetica Neue",
                    "sans-serif",
                ],
            },
            colors: {
                primary: {
                    100: "hsl(50, 100%, 92%)",
                    200: "hsl(50, 100%, 82%)",
                    300: "hsl(50, 100%, 72%)",
                    400: "hsl(50, 100%, 62%)",
                    500: "hsl(50, 100%, 52%)",
                    600: "hsl(50, 100%, 42%)",
                    700: "hsl(50, 100%, 32%)",
                    800: "hsl(50, 100%, 22%)",
                    900: "hsl(50, 100%, 12%)",
                },
                secondary: {
                    100: "hsl(209, 98%, 90%)",
                    200: "hsl(209, 98%, 80%)",
                    300: "hsl(209, 98%, 70%)",
                    400: "hsl(209, 98%, 60%)",
                    500: "hsl(209, 98%, 50%)",
                    600: "hsl(209, 98%, 40%)",
                    700: "hsl(209, 98%, 30%)",
                    800: "hsl(209, 98%, 20%)",
                    900: "hsl(209, 98%, 10%)",
                },
                overlay: {
                    100: "hsla(221, 39%, 11%, 0.1)",
                    200: "hsla(221, 39%, 11%, 0.2)",
                    300: "hsla(221, 39%, 11%, 0.3)",
                    400: "hsla(221, 39%, 11%, 0.4)",
                    500: "hsla(221, 39%, 11%, 0.5)",
                    600: "hsla(221, 39%, 11%, 0.6)",
                    700: "hsla(221, 39%, 11%, 0.7)",
                    800: "hsla(221, 39%, 11%, 0.8)",
                    900: "hsla(221, 39%, 11%, 0.9)",
                },
                neutral: {
                    black: "#000813",
                    yellow: "#ffd60a",
                    red: "rgb(223,49,48)",
                    gray: "hsla(211, 22%, 45%)",
                    white: "#f6f8f9",
                    transparentBlue: "#cce6ff",
                    transparentGray: "hsla(211, 100%, 12%, 0.1)",
                },
            },
            boxShadow: {
                hardTransparent: "0 0.2rem 0 hsla(215, 100%, 4%, 0.1)",
                hard: "0 0.25rem 0 #000813",
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
};
