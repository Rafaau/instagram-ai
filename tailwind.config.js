/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'border-gradient': 'linear-gradient(to right, rgb(236, 72, 153), rgb(239, 68, 68), rgb(234, 179, 8))'
      },
      animation: {
        'ping-once': 'ping 0.3s cubic-bezier(0, 0.2, 0.6, 1) 1',
      },
      keyframes: {
        ping: {
          '50%': {
            transform: 'scale(1.3)',
            opacity: '1',
          },
          '75%': {
            transform: 'scale(0.9)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          }
        },
      },
    },
  },
  plugins: [],
}
