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

const about = defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  try {
    const { getPageBlocks } = await import('../../../_/vue3-notion.mjs');
    const blockMap = await getPageBlocks(config.public.notionAboutPageId);
    return blockMap;
  } catch (error) {
    console.error("Error fetching Notion about page:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch Notion about page"
    });
  }
});

export { about as default };
//# sourceMappingURL=about.mjs.map
