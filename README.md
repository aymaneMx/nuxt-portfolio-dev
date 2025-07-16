# nuxt-portfolio-dev

a portfolio for developers w/ a blog powered by [Notion](https://www.notion.so/)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aymaneMx/nuxt-portfolio-dev)

Demo: https://aymane.me

**Features**

- :smiling_face_with_three_hearts: minimal and clean portfolio
- :last_quarter_moon: the dark/light mode (Auto detect the system color-mode)
- :iphone: responsive (tablet & mobile friendly)
- :gear: render articles from [Notion](https://www.notion.so/) :rocket:
- :star: fetches your Github pinned projects with most stars
- :dizzy: Eslint & Prettier configured
- :chart_with_upwards_trend: google analytics integration
- :zap: generate sitemap (visit /sitemap.xml)
- :rocket: one click deployment to netlify

## 🚀 Migration to Nuxt 3 & Latest Dependencies

This project has been successfully migrated from **Nuxt 2** to **Nuxt 3** with Vue 3 and the latest maintained libraries!

### ✨ What's New

#### 🔧 **Core Technology Stack**

- **Nuxt 3.17.3** (upgraded from Nuxt 2.15.7)
- **Vue 3.5.13** with Composition API
- **Latest dependencies** - all packages updated to their most recent stable versions
- **Modern build system** with Vite and optimized bundling

#### 📦 **Updated Dependencies**

- `@nuxtjs/tailwindcss@6.12.2` - Latest Tailwind CSS integration
- `@nuxtjs/color-mode@3.5.1` - Enhanced dark/light mode support
- `@nuxtjs/google-fonts@3.2.0` - Optimized font loading
- `@nuxt/eslint@0.7.5` - Modern ESLint integration
- `vue3-notion@0.1.46` - Vue 3 compatible Notion renderer (replaced vue-notion)
- `katex@0.16.22` - Latest mathematical notation rendering

#### 🎨 **Enhanced Features**

- **Modern Composition API** - All components migrated from Options API
- **Better TypeScript Support** - Improved type safety and development experience
- **Optimized Performance** - Faster builds and runtime performance
- **Enhanced Dark Mode** - Improved dark mode styling including code blocks
- **Server API Routes** - New Nuxt 3 server API endpoints for Notion integration

### 🔄 **Migration Highlights**

#### **Configuration Updates**

- Converted `nuxt.config.js` to modern `defineNuxtConfig()` syntax
- Updated Tailwind config from `purge` to `content` property
- Migrated runtime configuration from `publicRuntimeConfig` to `runtimeConfig.public`

#### **Code Modernization**

- **Pages**: Migrated from `asyncData` to `useFetch` composable
- **Components**: Full migration to `<script setup>` and Composition API
- **Plugins**: Updated to Nuxt 3 plugin system with `provide/inject` pattern
- **Layouts**: Updated to use `<NuxtPage>` instead of `<Nuxt>`
- **Dynamic Routes**: Converted from `_slug.vue` to `[slug].vue` naming convention

#### **API Integration**

- Created new server API routes for Notion integration:
  - `/api/notion/posts` - Fetch all blog posts
  - `/api/notion/about` - Fetch about page content
  - `/api/notion/post/[slug]` - Fetch individual blog post
- Replaced vue-notion with vue3-notion for Vue 3 compatibility
- Enhanced error handling and loading states

#### **Styling & UI Improvements**

- Enhanced dark mode support with proper code block styling
- Improved responsive design
- Better accessibility features
- Optimized CSS loading and performance

### 🎯 **Breaking Changes Resolved**

1. **Vue-Notion Compatibility**: Resolved Vue 3 incompatibility by migrating to vue3-notion
2. **Dynamic Routes**: Fixed 404 errors by updating file naming convention
3. **API Integration**: Rebuilt API integration for Notion data fetching
4. **Dark Mode**: Enhanced dark mode styling for better consistency
5. **Build System**: Resolved all build errors and warnings

### 📈 **Performance Improvements**

- **Faster Development**: Hot module replacement (HMR) improvements
- **Optimized Builds**: Reduced bundle sizes with modern build tools
- **Better Caching**: Improved static generation and caching strategies
- **Enhanced Loading**: Optimized font loading and resource prioritization

### Prerequisites

1. create [Notion](https://www.notion.so/) account
2. duplicate [this template](https://aymanemx.notion.site/aymanemx/ceef6f1a895a46b2a0e4a87b41405547?v=8427738adccd4b2a8c28156be3757156) by clicking on "duplicate" button located at the top of the page.
3. make your notion table public (by clicking on "share" button located at the top of the page)
4. grab the table id from the table link:
   eg:

```
link: https://aymanemx.notion.site/aymanemx/ceef6f1a895a46b2a0e4a87b41405547?v=8427738adccd4b2a8c28156be3757156
id: ceef6f1a895a46b2a0e4a87b41405547
```

5. do the same thing for about page id (we gonna use it as an env variable NOTION_ABOUT_PAGE_ID)
6. get your Google analytics id (optional)
7. now you can click to the deploy button and fill the netlify form

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aymaneMx/nuxt-portfolio-dev)

### Build Setup

create a `.env` file with the following variables

```
BASE_URL=https://aymanemx.com
GOOGLE_ANALYTICS_ID=
NOTION_TABLE_ID="ceef6f1a895a46b2a0e4a87b41405547"
NOTION_ABOUT_PAGE_ID="ad2346af0894443d8906cf78de4f310f"
GITHUB_USERNAME=aymaneMx
DEV_LOGO="AymaneMx"
DEV_NAME="Aymane max"
DEV_DESCRIPTION="a passionate Python developer from Morocco who loves to build and deliver quality products."
DEV_ROLE="Software Engineer"
DEV_GITHUB_LINK="https://github.com/aymaneMx"
DEV_TWITTER_LINK="https://twitter.com/aymane_max"
DEV_LINKEDIN_LINK="https://www.linkedin.com/in/aymane-mimouni/"
```

then:

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev
```

### Sites using this template 🌎

List of portfolios that are using this template.

- [AymaneMx's Blog](https://aymane.me)

if you're using it too, we'd be happy to [feature](https://github.com/aymaneMx/nuxt-portfolio-dev/issues/26) you here

### Credits

- :moon: The dark mode : [eggsy](https://github.com/eggsy/website)
- :art: the minimal design : [Monotone](https://github.com/dev-ggaurav/Monotone)
- :star: The open source section : [mouadziani](https://github.com/MouadZIANI/mouadziani.com) and [smakosh](https://github.com/smakosh/smakosh.com)
