import { mergeProps, withCtx, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import { _ as __nuxt_component_0$2 } from './nuxt-link-DVtFuCKd.mjs';

const _sfc_main$1 = {};
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
  }, _attrs))}><path d="M16.59 5.59L18 7l-6 6l-6-6l1.41-1.41L12 10.17l4.59-4.58m0 6L18 13l-6 6l-6-6l1.41-1.41L12 16.17l4.59-4.58z" fill="currentColor"></path></svg>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Icon/DoubleDown.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1]]);
const _sfc_main = {
  props: {
    title: {
      type: String,
      default: "Blogs"
    },
    posts: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  methods: {
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("en", options);
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_IconDoubleDown = __nuxt_component_0$1;
  const _component_nuxt_link = __nuxt_component_0$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "mt-16" }, _attrs))}><div class="flex justify-center items-center text-base font-semibold text-gray-600 dark:text-gray-300"><h2 class="text-center">${ssrInterpolate($props.title)}</h2>`);
  _push(ssrRenderComponent(_component_IconDoubleDown, { class: "h-4 w-4" }, null, _parent));
  _push(`</div><div class="wrapper-small my-5"><!--[-->`);
  ssrRenderList($props.posts, (post) => {
    _push(`<div class="project-card md:flex mt-10"><div class="img max-w-lg md:max-w-sm mx-auto m-2">`);
    _push(ssrRenderComponent(_component_nuxt_link, {
      to: `/posts/${post.slug}`
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<img${ssrRenderAttr("alt", post.title)}${ssrRenderAttr("src", `${post.thumbnail[0].url}`)} class="rounded-xl h-44 w-96 object-cover object-center"${_scopeId}>`);
        } else {
          return [
            createVNode("img", {
              alt: post.title,
              src: `${post.thumbnail[0].url}`,
              class: "rounded-xl h-44 w-96 object-cover object-center"
            }, null, 8, ["alt", "src"])
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</div><div class="flex flex-col justify-between max-w-lg mx-auto"><div class="txt md:px-5 lg:px-0">`);
    _push(ssrRenderComponent(_component_nuxt_link, {
      to: `/posts/${post.slug}`
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100"${_scopeId}>${ssrInterpolate(post.title)}</h2>`);
        } else {
          return [
            createVNode("h2", { class: "text-xl font-semibold text-gray-800 dark:text-gray-100" }, toDisplayString(post.title), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`<p class="font-semibold text-gray-600 dark:text-gray-300 text-sm">${ssrInterpolate($options.formatDate(post.created_at))}</p><div class="flex flex-col justify-between max-w-lg mx-auto"></div><!--[-->`);
    ssrRenderList(post.tags, (tag) => {
      _push(`<span class="font-semibold text-gray-600 bg-opacity-25 dark:bg-opacity-40 dark:text-gray-300 text-sm rounded bg-gray-200 dark:bg-primary mr-1 px-1"> #${ssrInterpolate(tag)}</span>`);
    });
    _push(`<!--]--><p class="text-base text-gray-700 dark:text-gray-200 my-1">${ssrInterpolate(post.description)}</p>`);
    _push(ssrRenderComponent(_component_nuxt_link, {
      to: `/posts/${post.slug}`,
      class: "text-base font-semibold text-gray-700 dark:text-gray-200 my-3 hover:underline"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(` Read more &gt; `);
        } else {
          return [
            createTextVNode(" Read more > ")
          ];
        }
      }),
      _: 2
    }, _parent));
    _push(`</div></div></div>`);
  });
  _push(`<!--]--></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Blogs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { __nuxt_component_0 as _, __nuxt_component_0$1 as a };
//# sourceMappingURL=Blogs-Cya3E5IJ.mjs.map
