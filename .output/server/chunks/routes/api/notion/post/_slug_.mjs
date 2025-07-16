import { d as defineEventHandler, g as getRouterParam, u as useRuntimeConfig, c as createError } from '../../../../nitro/nitro.mjs';
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

const _slug_ = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const slug = getRouterParam(event, "slug");
  try {
    const { getPageTable, getPageBlocks } = await import('../../../../_/vue3-notion.mjs');
    const pageTable = await getPageTable(config.public.notionTableId);
    const page = pageTable.find((item) => item.public && item.slug === slug);
    if (!page) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post not found"
      });
    }
    const blockMap = await getPageBlocks(page.id);
    if (!blockMap || blockMap.error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Post content not found"
      });
    }
    return { blockMap, page };
  } catch (error) {
    console.error("Error fetching Notion post:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch Notion post"
    });
  }
});

export { _slug_ as default };
//# sourceMappingURL=_slug_.mjs.map
