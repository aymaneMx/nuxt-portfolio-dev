<script setup>
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-shell-session'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-graphql'
import 'prismjs/components/prism-javascript'

const route = useRoute()
const config = useRuntimeConfig()
const { $prepareMeta } = useNuxtApp()

const pageLinkOptions = { component: 'NuxtLink', href: 'to' }

// Fetch post data
const { data: postData } = await useFetch(
  `/api/notion/post/${route.params.slug}`,
)

// Extract blockMap and page from the API response
const blockMap = computed(() => postData.value?.blockMap)
const page = computed(() => postData.value?.page)

// Handle 404 if no post found
if (!postData.value || postData.value.error) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
  })
}

// Set up head management
const post = computed(() => page.value)

watchEffect(() => {
  if (post.value) {
    const title = post.value?.title
    const description = post.value?.description || config.public.devDescription
    const image = post.value?.thumbnail?.[0]?.url || null
    const tags = post.value.tags || title
    const href = config.public.baseURL + `/posts/${post.value.slug}`

    const meta = $prepareMeta(
      { title, description, image, keywords: `${tags}`, url: href },
      [
        {
          name: 'article:published-time',
          content: post.value?.created_at || null,
        },
      ],
    )

    useHead({
      title,
      link: [{ rel: 'canonical', href }],
      meta,
    })
  }
})
</script>

<template>
  <NotionRenderer
    :blockMap="blockMap"
    :page-link-options="pageLinkOptions"
    fullPage
    prism
  />
</template>

<style>
@import 'vue3-notion/dist/style.css';

/* Dark mode styles for text elements */
.notion-title,
.notion-text,
.notion-list,
.notion-callout-text,
p,
h1,
h2,
h3,
h4,
span {
  @apply dark:text-white;
}

.notion-link {
  @apply dark:hover:bg-red-500;
}

/* Dark mode styles for code blocks */
.dark .notion-code,
.dark .notion-code pre,
.dark pre[class*='language-'],
.dark code[class*='language-'] {
  @apply bg-gray-800 text-gray-100;
}

.dark .notion-code {
  background-color: #2d2d2d !important;
}

.dark pre[class*='language-'] {
  background: #2d2d2d !important;
}

.dark code[class*='language-'] {
  background: none !important;
  color: #ccc !important;
}

/* Ensure inline code has dark styling too */
.dark .notion-inline-code,
.dark :not(pre) > code[class*='language-'] {
  @apply bg-gray-700 text-gray-200 px-1 py-0.5 rounded;
  background: #374151 !important;
  color: #e5e7eb !important;
}
</style>
