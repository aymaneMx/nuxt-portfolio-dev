export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // Import vue3-notion dynamically
    const { getPageTable } = await import('vue3-notion')
    const pageTable = await getPageTable(config.public.notionTableId)

    return pageTable
  } catch (error) {
    console.error('Error fetching Notion posts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch Notion posts',
    })
  }
})
