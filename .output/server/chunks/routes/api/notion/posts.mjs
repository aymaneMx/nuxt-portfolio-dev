import { d as defineEventHandler, u as useRuntimeConfig, c as createError } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'node:url';
import 'consola';

const posts = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    const { getPageTable } = await import('../../../_/vue3-notion.mjs');
    const pageTable = await getPageTable(config.public.notionTableId);
    return pageTable;
  } catch (error) {
    console.error("Error fetching Notion posts:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch Notion posts"
    });
  }
});

export { posts as default };
//# sourceMappingURL=posts.mjs.map
