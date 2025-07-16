<template>
  <div class="wrapper-small md:px-10">
    <div class="h-96 mt-5">
      <Hero />
    </div>

    <Blogs :posts="posts" title="Featured blogs" />
    <Projects :projects="projects" />
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

// Fetch GitHub projects
const { data: projectsData } = await useFetch(
  () =>
    `https://api.github.com/search/repositories?q=user:${config.public.githubUsername}&sort=stars&per_page=3`
)

// Fetch Notion posts
const { data: pageTable } = await useFetch('/api/notion/posts')

// Process the data
const projects = computed(() => projectsData.value?.items || [])
const posts = computed(() => {
  if (!pageTable.value) return []
  return pageTable.value
    .filter((page) => page.public)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})
</script>
