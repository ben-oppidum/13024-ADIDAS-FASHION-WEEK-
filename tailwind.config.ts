/** @type {import('tailwindcss').Config} */

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                xs: '370px',
            },
            container: {
                center: true,
            },
            fontFamily: {
                sans: ['Inter', 'serif'],
            },
            colors: {
                'primary': '#0F172A',
                'secondary': '#4F46E5',
                'success': '#2AA970',
                'warning': '#fcc605',
                'danger': '#e00c0c',
                surface: {
                    0: '#ffffff',
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                    950: '#030712'
                },
            },
            gridTemplateColumns: {
                '14': 'repeat(14, minmax(0, 1fr))',
            }
        }
    },
    plugins: [],
}