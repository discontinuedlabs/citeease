/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Poppins",
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
                system: ["Times New Roman"],
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
                neutral: {
                    black: "#000813",
                    yellow: "#ffd60a",
                    lightGray: "#cce6ff",
                    white: "#f6f8f9",
                    transparentBlack: "hsla(215, 100%, 4%, 0.5)",
                    transparentBlue: "hsla(211, 100%, 12%, 0.5)",
                },
            },
            boxShadow: {
                hardTransparent: "0 0.2rem 0 hsla(215, 100%, 4%, 0.1)",
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
};
