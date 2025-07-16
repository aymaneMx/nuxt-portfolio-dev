<script setup>
const config = useRuntimeConfig()

// Fetch Notion about page blocks
const { data: blockMap } = await useFetch('/api/notion/about')

// Set page head
useHead({
  title: 'About',
})
</script>

<template>
  <NotionRenderer :blockMap="blockMap" fullPage prism />
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
