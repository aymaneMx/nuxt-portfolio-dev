export default defineNuxtConfig({
  // Target is no longer needed in Nuxt 3 (it's always 'static' for generate)
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  // App configuration (replaces head)
  app: {
    head: {
      title: process.env.GITHUB_USERNAME,
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: process.env.DEV_DESCRIPTION,
        },
        { name: 'format-detection', content: 'telephone=no' },
        /* Twitter */
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        {
          hid: 'twitter:site',
          name: 'twitter:site',
          content: process.env.DEV_NAME,
        },
        {
          hid: 'twitter:creator',
          name: 'twitter:creator',
          content: process.env.DEV_NAME,
        },
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: process.env.DEV_NAME,
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: process.env.DEV_DESCRIPTION,
        },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: '/favicon.ico',
        },
        /* Open-Graph */
        { hid: 'og:type', name: 'og:type', content: 'website' },
        {
          hid: 'og:site_name',
          name: 'og:site_name',
          content: process.env.DEV_NAME,
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: process.env.DEV_DESCRIPTION,
        },
        { hid: 'og:image', name: 'og:image', content: '/favicon.ico' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  css: ['~/assets/css/tailwind.css'],

  plugins: ['@/plugins/util'],

  components: true,

  // In Nuxt 3, buildModules are just modules
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
    '@nuxtjs/google-fonts',
    ['vue3-notion/nuxt', { css: true }],
  ],

  // Color mode configuration
  colorMode: {
    classSuffix: '',
  },

  // Google Fonts configuration
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700],
    },
  },

  // Sitemap Configuration: https://sitemap.nuxtjs.org/usage/sitemap-options#from-a-function-which-returns-a-promise
  // Note: Will be re-enabled after vue-notion compatibility is resolved
  // sitemap: {
  //   hostname: process.env.BASE_URL,
  //   routes: async () => {
  //     const notion = require('vue-notion')
  //     const pageTable = await notion.getPageTable(process.env.NOTION_TABLE_ID)
  //     return pageTable.filter((item) => !!item.public).map((item) => `/posts/${item.slug}`)
  //   }
  // },

  // Runtime configuration (replaces publicRuntimeConfig)
  runtimeConfig: {
    // Private keys (only available on server-side)

    // Public keys (exposed to client-side)
    public: {
      baseURL: process.env.BASE_URL,
      githubUsername: process.env.GITHUB_USERNAME,
      notionTableId: process.env.NOTION_TABLE_ID,
      notionAboutPageId: process.env.NOTION_ABOUT_PAGE_ID,
      devName: process.env.DEV_NAME,
      devDescription: process.env.DEV_DESCRIPTION,
      devRole: process.env.DEV_ROLE,
      devGithubLink: process.env.DEV_GITHUB_LINK,
      devTwitterLink: process.env.DEV_TWITTER_LINK,
      devLinkedinLink: process.env.DEV_LINKEDIN_LINK,
      devLogo: process.env.DEV_LOGO,
    },
  },
})
