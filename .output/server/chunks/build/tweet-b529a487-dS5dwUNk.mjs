import { defineComponent, computed, ref, createElementBlock, onMounted, openBlock, onBeforeMount, reactive } from 'vue';
import { o as oe, b as ue } from './server.mjs';
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
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const n = reactive({
  callbacks: []
}), E = (e) => {
  onBeforeMount(() => {
    if ((void 0).getElementById("twitter-widgets-js"))
      n.callbacks.push(e);
    else {
      n.callbacks.push(e);
      var t = (void 0).createElement("script");
      t.id = "twitter-widgets-js", t.src = "https://platform.twitter.com/widgets.js", t.onload = () => n.callbacks.forEach((o) => o()), (void 0).body.appendChild(t);
    }
  });
}, b = {
  key: 1,
  class: "notion-tweet-error"
}, g = {
  name: "NotionTweet"
}, j = /* @__PURE__ */ defineComponent({
  ...g,
  props: { ...oe },
  setup(e) {
    const c = e, { properties: t } = ue(c), o = computed(() => {
      var _a, _b, _c, _d;
      return (_d = (_c = (_b = (_a = t.value) == null ? void 0 : _a.source) == null ? void 0 : _b[0]) == null ? void 0 : _c[0].split("status/")) == null ? void 0 : _d[1].split("?")[0];
    }), a = ref(), r = ref(), l = () => {
      var _a;
      (_a = (void 0).twttr) == null ? void 0 : _a.ready().then(({ widgets: i }) => {
        i.createTweetEmbed(o.value, a.value, {}).then((s) => {
          r.value = s ? void 0 : "error";
        }).catch((s) => {
          r.value = s;
        });
      });
    };
    return E(l), onMounted(() => {
      l();
    }), (w, i) => r.value ? (openBlock(), createElementBlock("div", b, "Error loading Tweet")) : (openBlock(), createElementBlock("div", {
      key: 0,
      class: "notion-tweet",
      ref_key: "el",
      ref: a
    }, null, 512));
  }
});

export { j as default };
//# sourceMappingURL=tweet-b529a487-dS5dwUNk.mjs.map
