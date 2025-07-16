import { _ as __nuxt_component_0$1 } from './nuxt-link-DVtFuCKd.mjs';
import { mergeProps, withCtx, unref, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc, l as __nuxt_component_1$2, a as useRuntimeConfig, k as useState } from './server.mjs';
import { _ as __nuxt_component_0$2 } from './Github-CMkrpDMR.mjs';
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

const _sfc_main$8 = {};
function _sfc_ssrRender$4(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`);
}
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Icon/Sun.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["ssrRender", _sfc_ssrRender$4]]);
const _sfc_main$7 = {};
function _sfc_ssrRender$3(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`);
}
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Icon/Moon.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["ssrRender", _sfc_ssrRender$3]]);
const useColorMode = () => {
  return useState("color-mode").value;
};
const _sfc_main$6 = {
  __name: "ColorSwitcher",
  __ssrInlineRender: true,
  setup(__props) {
    const colorMode = useColorMode();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IconSun = __nuxt_component_0;
      const _component_IconMoon = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-full cursor-pointer ml-5 bg-gray-100 p-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100 focus:outline-none" }, _attrs))}>`);
      if (unref(colorMode).value === "light") {
        _push(ssrRenderComponent(_component_IconSun, { class: "h-5 w-5" }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_IconMoon, { class: "h-5 w-5" }, null, _parent));
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ColorSwitcher.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = {
  __name: "Header",
  __ssrInlineRender: true,
  setup(__props) {
    const { public: config } = useRuntimeConfig();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_nuxt_link = __nuxt_component_0$1;
      const _component_ColorSwitcher = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(_attrs)}><nav class="wrapper py-6 dark:bg-gray-900"><div class="px-10 flex justify-between items-center"><div class="logo">`);
      _push(ssrRenderComponent(_component_nuxt_link, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200"${_scopeId}>${ssrInterpolate(unref(config).devLogo)}</h1>`);
          } else {
            return [
              createVNode("h1", { class: "text-2xl font-semibold text-gray-700 dark:text-gray-200" }, toDisplayString(unref(config).devLogo), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex flex-row">`);
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "nav-link",
        to: "/posts"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Blog`);
          } else {
            return [
              createTextVNode("Blog")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "nav-link",
        to: "/about"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`About`);
          } else {
            return [
              createTextVNode("About")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_ColorSwitcher, null, null, _parent));
      _push(`</div></div></nav></div>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Header.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "aria-hidden": "true",
    role: "img",
    class: "iconify iconify--mdi",
    width: "32",
    height: "32",
    preserveAspectRatio: "xMidYMid meet",
    viewBox: "0 0 24 24"
  }, _attrs))}><path d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23z" fill="currentColor"></path></svg>`);
}
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Icon/Twitter.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["ssrRender", _sfc_ssrRender$2]]);
const _sfc_main$3 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "aria-hidden": "true",
    role: "img",
    class: "iconify iconify--mdi",
    width: "32",
    height: "32",
    preserveAspectRatio: "xMidYMid meet",
    viewBox: "0 0 24 24"
  }, _attrs))}><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" fill="currentColor"></path></svg>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Icon/Linkedin.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$1]]);
const _sfc_main$2 = {
  __name: "Social",
  __ssrInlineRender: true,
  setup(__props) {
    const { public: config } = useRuntimeConfig();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_IconGithub = __nuxt_component_0$2;
      const _component_IconTwitter = __nuxt_component_1;
      const _component_IconLinkedin = __nuxt_component_2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wrapper flex flex-wrap text-base text-center m-3 dark:bg-gray-900 text-gray-800 dark:text-gray-200" }, _attrs))}><a aria-label="Github" class="social-link hover:text-primary mx-3"${ssrRenderAttr("href", unref(config).devGithubLink)}>`);
      _push(ssrRenderComponent(_component_IconGithub, { class: "h-6 w-6" }, null, _parent));
      _push(`</a><a aria-label="Twitter" class="social-link hover:text-primary mx-3"${ssrRenderAttr("href", unref(config).devTwitterLink)}>`);
      _push(ssrRenderComponent(_component_IconTwitter, { class: "h-6 w-6" }, null, _parent));
      _push(`</a><a aria-label="LinkedIn" class="social-link hover:text-primary mx-3"${ssrRenderAttr("href", unref(config).devLinkedinLink)}>`);
      _push(ssrRenderComponent(_component_IconLinkedin, { class: "h-6 w-6" }, null, _parent));
      _push(`</a></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Social.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "Footer",
  __ssrInlineRender: true,
  setup(__props) {
    const { public: config } = useRuntimeConfig();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Social = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wrapper mx-auto px-5 dark:bg-gray-900" }, _attrs))}><hr class="h-px mt-6 border-gray-300 max-w-screen-xl mx-auto"><div class="md:py-5"><div class="flex flex-col items-center justify-between mt-6 md:mt-0 md:flex-row"><div class="logo flex items-center"><p class="text-sm text-gray-700 dark:text-gray-200 mx-1"> \xA9 2022 ${ssrInterpolate(unref(config).githubUsername)} Built with \u2661 </p><a aria-label="AymaneMx.com" class="text-sm underline text-gray-700 dark:text-gray-200" href="https://github.com/aymaneMx/nuxt-portfolio-dev">Open sourced on Github</a></div><div>`);
      _push(ssrRenderComponent(_component_Social, null, null, _parent));
      _push(`</div></div></div></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Footer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_Header = _sfc_main$5;
  const _component_NuxtPage = __nuxt_component_1$2;
  const _component_Footer = _sfc_main$1;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-screen justify-between dark:bg-gray-900" }, _attrs))}><div class="dark:bg-gray-900">`);
  _push(ssrRenderComponent(_component_Header, null, null, _parent));
  _push(`</div><div class="mb-auto dark:bg-gray-900">`);
  _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
  _push(`</div><div class="dark:bg-gray-900">`);
  _push(ssrRenderComponent(_component_Footer, null, null, _parent));
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { _default as default };
//# sourceMappingURL=default-BI-8Todd.mjs.map
