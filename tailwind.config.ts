/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // <--- Adicione ou verifique esta linha!
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}