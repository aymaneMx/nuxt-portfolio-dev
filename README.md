# nuxt-portfolio-dev
a portfolio for developers w/ a blog powered by [Notion](https://www.notion.so/) 

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aymaneMx/nuxt-portfolio-dev)

Demo: https://aymaneMx.com


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
5. get your Google analytics id (optional)
6. now you can click to the deploy button and fill the netlify form

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

### Credits 

- :moon: The dark mode : [eggsy](https://github.com/eggsy/website)
- :art: the minimal design : [Monotone](https://github.com/dev-ggaurav/Monotone)
- :star: The open source section : [mouadziani](https://github.com/MouadZIANI/mouadziani.com) and [smakosh](https://github.com/smakosh/smakosh.com)

