<template>
  <Blogs :posts="posts" title="Blogs" />
</template>

<script setup>
const config = useRuntimeConfig()

// Fetch Notion posts
const { data: pageTable } = await useFetch('/api/notion/posts')

// Process the data
const posts = computed(() => {
  if (!pageTable.value) return []
  return pageTable.value
    .filter((page) => page.public)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// Set page head
useHead({
  title: config.public.githubUsername + "'s Blog",
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: config.public.devDescription,
    },
  ],
})
</script>
