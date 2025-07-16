import { _ as __nuxt_component_0 } from './Blogs-Cya3E5IJ.mjs';
import { withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { u as useHead, a as useRuntimeConfig } from './server.mjs';
import { u as useFetch } from './fetch-hIA07zIO.mjs';
import './nuxt-link-DVtFuCKd.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'consola';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const config = useRuntimeConfig();
    const { data: pageTable } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/notion/posts", "$VC5KIj9Wy4")), __temp = await __temp, __restore(), __temp);
    const posts = computed(() => {
      if (!pageTable.value) return [];
      return pageTable.value.filter((page) => page.public).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    useHead({
      title: config.public.githubUsername + "'s Blog",
      meta: [
        {
          hid: "description",
          name: "description",
          content: config.public.devDescription
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Blogs = __nuxt_component_0;
      _push(ssrRenderComponent(_component_Blogs, mergeProps({
        posts: unref(posts),
        title: "Blogs"
      }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/posts/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dn_KQC35.mjs.map
