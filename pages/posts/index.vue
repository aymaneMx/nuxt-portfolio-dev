<template>
  <Blogs :posts="posts" title="Blogs"/>
</template>


<script>
export default {
  async asyncData({$notion, params, error, $config: { notionTableId }}) {
    const pageTable = await $notion.getPageTable(notionTableId)
    const posts = pageTable.filter((page) => page.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return {posts}
  },
  head: {
    title: process.env.GITHUB_USERNAME + "'s Blog",
    meta: [
      {
        hid: 'description',
        name: 'description',
        content: process.env.DEV_DESCRIPTION
      }
    ]
  }
}
</script>
