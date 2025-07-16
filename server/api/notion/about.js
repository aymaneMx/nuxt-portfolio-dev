export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Import vue3-notion dynamically
    const { getPageBlocks } = await import('vue3-notion')
    const blockMap = await getPageBlocks(config.public.notionAboutPageId)

    return blockMap
  } catch (error) {
    console.error('Error fetching Notion about page:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch Notion about page',
    })
  }
})
