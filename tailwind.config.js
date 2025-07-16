module.exports = {
  darkMode: 'class',
  future: {},
  purge: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4c1d95',
      },
    },
  },
  plugins: [],
}
