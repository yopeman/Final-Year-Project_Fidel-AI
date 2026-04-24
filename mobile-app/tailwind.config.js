/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5',
                    dark: '#4338CA',
                    light: '#818CF8',
                },
                secondary: {
                    DEFAULT: '#F59E0B',
                    dark: '#D97706',
                    light: '#FCD34D',
                },
                background: '#F9FAFB',
                surface: '#FFFFFF',
                text: {
                    DEFAULT: '#111827',
                    secondary: '#6B7280',
                },
                border: '#E5E7EB',
                success: '#10B981',
                error: '#EF4444',
                warning: '#F59E0B',
                info: '#3B82F6',
                locked: '#9CA3AF',
                unlocked: '#4F46E5',
                completed: '#10B981',
                inProgress: '#F59E0B',
            },
        },
    },
    plugins: [],
}
