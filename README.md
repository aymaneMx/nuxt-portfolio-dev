# nuxt-portfolio-dev
a portfolio for developers w/ a blog powered by [Notion](https://www.notion.so/) 

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aymaneMx/nuxt-portfolio-dev)

**Features** 

- :smiling_face_with_three_hearts: minimal and clean portfolio 
- :last_quarter_moon: the dark/light mode (Auto detect the system color-mode)
- :iphone: responsive (tablet & mobile friendly)
- :gear: render articles from [Notion](https://www.notion.so/) :rocket:
- :star: fetches your Github pinned projects with most stars
- :dizzy: Eslint & Prettier configured
- :chart_with_upwards_trend: google analytics integration 
- :zap: generate sitemap (visit /sitemap.xml)
- :rocket: One click deployment to netlify 


### Build Setup

create a `.env.development` file with the following variables

```
BASE_URL=https://lmax.com
GOOGLE_ANALYTICS_ID=
NOTION_TABLE_ID="ceef6f1a895a46b2a0e4a87b41405547"
NOTION_ABOUT_PAGE_ID="ad2346af0894443d8906cf78de4f310f"
GITHUB_USERNAME=aymanemx
DEV_LOGO="MyPortfolio."
DEV_NAME="Aymane tsu"
DEV_DESCRIPTION="this is a cool dedscription"
DEV_ROLE="Software Engineer"
DEV_GITHUB_LINK=https://www.linkedin.com/in/aymane-mimouni/
DEV_TWITTER_LINK=https://www.linkedin.com/in/aymane-mimouni/
DEV_LINKEDIN_LINK=https://www.linkedin.com/in/aymane-mimouni/
```

then:

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev
```


### Prerequisites

1. create [Notion](https://www.notion.so/) account
2. duplicate [this template](https://aymanemx.notion.site/aymanemx/ceef6f1a895a46b2a0e4a87b41405547?v=8427738adccd4b2a8c28156be3757156) by clicking on duplicate button oon top of the page.
3. make your notion table public (by clicking to share button on top of the page)
4. Grab the table id from the table link:
eg: 
```
if the link is: https://aymanemx.notion.site/aymanemx/ceef6f1a895a46b2a0e4a87b41405547?v=8427738adccd4b2a8c28156be3757156
the id is: ceef6f1a895a46b2a0e4a87b41405547
```
5. get your Google analytics id (optional)
6. now you can click to the deploy button 
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/aymaneMx/nuxt-portfolio-dev)

