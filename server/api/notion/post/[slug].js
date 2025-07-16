export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug = getRouterParam(event, 'slug')

  try {
    // Import vue3-notion dynamically
    const { getPageTable, getPageBlocks } = await import('vue3-notion')

    // Get the page table to find the post by slug
    const pageTable = await getPageTable(config.public.notionTableId)
    const page = pageTable.find((item) => item.public && item.slug === slug)

    if (!page) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found',
      })
    }

    // Get the block map for the post
    const blockMap = await getPageBlocks(page.id)

    if (!blockMap || blockMap.error) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post content not found',
      })
    }

    return { blockMap, page }
  } catch (error) {
    console.error('Error fetching Notion post:', error)

    if (error.statusCode) {
      throw error // Re-throw if it's already a proper HTTP error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch Notion post',
    })
  }
})
