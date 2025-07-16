import { withAsyncContext, resolveComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { u as useFetch } from './fetch-hIA07zIO.mjs';
import { u as useHead } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = {
  __name: "about",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: blockMap } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/notion/about", "$3WA8Sv7HJY")), __temp = await __temp, __restore(), __temp);
    useHead({
      title: "About"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NotionRenderer = resolveComponent("NotionRenderer");
      _push(ssrRenderComponent(_component_NotionRenderer, mergeProps({
        blockMap: unref(blockMap),
        fullPage: "",
        prism: ""
      }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=about-DTSnmJsu.mjs.map
