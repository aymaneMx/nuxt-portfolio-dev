import { defineComponent, computed, createElementBlock, openBlock, normalizeClass, createVNode, withCtx, createTextVNode, toDisplayString, createElementVNode, toRef, isRef, ref, inject, h as h$1, Suspense, hasInjectionContext, useSlots, toRefs, unref, getCurrentInstance, provide, shallowReactive, Fragment, shallowRef, cloneVNode, resolveComponent, createBlock, resolveDynamicComponent, mergeProps, renderList, createCommentVNode, normalizeProps, guardReactiveProps, normalizeStyle, renderSlot, defineAsyncComponent, createApp, onErrorCaptured, onServerPrefetch, reactive, effectScope, isReadonly, isShallow, isReactive, toRaw, getCurrentScope, watch, onScopeDispose, nextTick, useSSRContext } from 'vue';
import { c as createError$1, a as hasProtocol, o as isScriptProtocol, j as joinURL, q as withQuery, s as sanitizeStatusCode, r as getContext, $ as $fetch, t as createHooks, v as executeAsync, x as toRouteMatcher, y as createRouter$1, z as defu } from '../nitro/nitro.mjs';
import { u as useHead$1, h as headSymbol, a as baseURL } from '../routes/renderer.mjs';
import { RouterView, useRoute as useRoute$1, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'consola';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "value": null, "errorValue": null, "deep": true };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  var _a2;
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.17.7";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...((_a2 = options.ssrContext) == null ? void 0 : _a2.payload) || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  var _a2, _b, _c, _d;
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  const errors = [];
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    var _a3;
    const unresolvedPluginsForThisPlugin = ((_a3 = plugin2.dependsOn) == null ? void 0 : _a3.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name))) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      });
      if (plugin2.parallel) {
        parallels.push(promise.catch((e) => errors.push(e)));
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext) && ((_b = plugin2.env) == null ? void 0 : _b.islands) === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) && ((_d = plugin2.env) == null ? void 0 : _d.islands) === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (errors.length) {
    throw errors[0];
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  var _a2;
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = (_a2 = getCurrentInstance()) == null ? void 0 : _a2.appContext.app.$nuxt;
  }
  nuxtAppInstance || (nuxtAppInstance = getNuxtAppCtx(id).tryUse());
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = Symbol("layout-meta");
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  var _a2;
  return (_a2 = useNuxtApp()) == null ? void 0 : _a2.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to2, options) => {
  to2 || (to2 = "/");
  const toPath = typeof to2 === "string" ? to2 : "path" in to2 ? resolveRouteObject(to2) : useRouter().resolve(to2).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = (options == null ? void 0 : options.external) || isExternalHost;
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to2 === "string" || isExternal ? toPath : router.resolve(to2).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to2;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to2) : router.push(to2);
};
function resolveRouteObject(to2) {
  return withQuery(to2.path || "", to2.query || {}) + (to2.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value || (error2.value = nuxtError);
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter$1({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}
const _routes = [
  {
    name: "about",
    path: "/about",
    component: () => import('./about-DTSnmJsu.mjs')
  },
  {
    name: "index",
    path: "/",
    component: () => import('./index-Bh98FNdU.mjs')
  },
  {
    name: "posts-_slug",
    path: "/posts/_slug",
    component: () => import('./_slug-tBUJYhzE.mjs')
  },
  {
    name: "posts",
    path: "/posts",
    component: () => import('./index-Dn_KQC35.mjs')
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => {
    var _a2;
    return (_a2 = children.default) == null ? void 0 : _a2.call(children);
  } };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = (route == null ? void 0 : route.meta.key) ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r4) => {
    var _a2;
    return ((_a2 = route.params[r4.slice(1)]) == null ? void 0 : _a2.toString()) || "";
  });
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to2, from) {
  if (to2 === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to2) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to2.matched.every(
    (comp, index) => {
      var _a2, _b;
      return comp.components && comp.components.default === ((_b = (_a2 = from.matched[index]) == null ? void 0 : _a2.components) == null ? void 0 : _b.default);
    }
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
const routerOptions0 = {
  scrollBehavior(to2, from, savedPosition) {
    var _a2;
    const nuxtApp = useNuxtApp();
    const behavior = ((_a2 = useRouter().options) == null ? void 0 : _a2.scrollBehaviorType) ?? "auto";
    if (to2.path === from.path) {
      if (from.hash && !to2.hash) {
        return { left: 0, top: 0 };
      }
      if (to2.hash) {
        return { el: to2.hash, top: _getHashElementScrollMarginTop(to2.hash), behavior };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to2.meta.scrollToTop === "function" ? to2.meta.scrollToTop(to2, from) : to2.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    const hookToWait = nuxtApp._runningTransition ? "page:transition:finish" : "page:loading:end";
    return new Promise((resolve) => {
      if (from === START_LOCATION) {
        resolve(_calculatePosition(to2, from, savedPosition, behavior));
        return;
      }
      nuxtApp.hooks.hookOnce(hookToWait, () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to2, from, savedPosition, behavior)));
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to2, from, savedPosition, defaultBehavior) {
  if (savedPosition) {
    return savedPosition;
  }
  const isPageNavigation = isChangingPage(to2, from);
  if (to2.hash) {
    return {
      el: to2.hash,
      top: _getHashElementScrollMarginTop(to2.hash),
      behavior: isPageNavigation ? defaultBehavior : "instant"
    };
  }
  return {
    left: 0,
    top: 0,
    behavior: isPageNavigation ? defaultBehavior : "instant"
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to2, from) => {
  var _a2;
  let __temp, __restore;
  if (!((_a2 = to2.meta) == null ? void 0 : _a2.validate)) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to2.meta.validate(to2))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    statusCode: result && result.statusCode || 404,
    statusMessage: result && result.statusMessage || `Page Not Found: ${to2.fullPath}`,
    data: {
      path: to2.fullPath
    }
  });
  return error;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to2) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a2, _b, _c;
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = ((_a2 = routerOptions.history) == null ? void 0 : _a2.call(routerOptions, routerBase)) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to2, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to2, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    nuxtApp.hook("page:finish", syncCurrentRoute);
    router.afterEach((to2, from) => {
      var _a3, _b2, _c2, _d;
      if (((_b2 = (_a3 = to2.matched[0]) == null ? void 0 : _a3.components) == null ? void 0 : _b2.default) === ((_d = (_c2 = from.matched[0]) == null ? void 0 : _c2.components) == null ? void 0 : _d.default)) {
        syncCurrentRoute();
      }
    });
    const route = {};
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware || (nuxtApp._middleware = {
      global: [],
      named: {}
    });
    useError();
    if (!((_b = nuxtApp.ssrContext) == null ? void 0 : _b.islandContext)) {
      router.afterEach(async (to2, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if ((failure == null ? void 0 : failure.type) === 4) {
          return;
        }
        if (to2.redirectedFrom && to2.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to2.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    syncCurrentRoute();
    if ((_c = nuxtApp.ssrContext) == null ? void 0 : _c.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to2, from) => {
      var _a3, _b2;
      await nuxtApp.callHook("page:loading:start");
      to2.meta = reactive(to2.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to2.meta.layout)) {
        to2.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!((_a3 = nuxtApp.ssrContext) == null ? void 0 : _a3.islandContext)) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to2.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        {
          const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to2.path }));
          if (routeRules.appMiddleware) {
            for (const key in routeRules.appMiddleware) {
              if (routeRules.appMiddleware[key]) {
                middlewareEntries.add(key);
              } else {
                middlewareEntries.delete(key);
              }
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r4) => r4.default || r4)) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            const result = await nuxtApp.runWithContext(() => middleware(to2, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach(async (to2, _from) => {
      if (to2.matched.length === 0) {
        await nuxtApp.runWithContext(() => showError(createError({
          statusCode: 404,
          fatal: false,
          statusMessage: `Page not found: ${to2.fullPath}`,
          data: {
            path: to2.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        await router.replace({
          ...resolvedInitialRoute,
          force: true
        });
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
function injectHead(nuxtApp) {
  var _a2;
  const nuxt = nuxtApp || tryUseNuxtApp();
  return ((_a2 = nuxt == null ? void 0 : nuxt.ssrContext) == null ? void 0 : _a2.head) || (nuxt == null ? void 0 : nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      return inject(headSymbol);
    }
  }));
}
function useHead(input, options = {}) {
  const head = injectHead(options.nuxt);
  if (head) {
    return useHead$1(input, { head, ...options });
  }
}
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      var _a2;
      if (mounted.value) {
        const vnodes = (_a2 = slots.default) == null ? void 0 : _a2.call(slots);
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h$1(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useRequestEvent(nuxtApp) {
  var _a2;
  nuxtApp || (nuxtApp = useNuxtApp());
  return (_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.event;
}
function useRequestFetch() {
  var _a2;
  return ((_a2 = useRequestEvent()) == null ? void 0 : _a2.$fetch) || globalThis.$fetch;
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const _0_siteConfig_tU0SxKrPeVRXWcGu2sOnIfhNDbYiKNfDCvYZhRueG0Q = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt-site-config:init",
  enforce: "pre",
  async setup(nuxtApp) {
    var _a2, _b;
    const stack = (_b = (_a2 = useRequestEvent()) == null ? void 0 : _a2.context) == null ? void 0 : _b.siteConfig;
    const state = useState("site-config");
    {
      nuxtApp.hooks.hook("app:rendered", () => {
        state.value = stack == null ? void 0 : stack.get({
          debug: (/* @__PURE__ */ useRuntimeConfig())["nuxt-site-config"].debug,
          resolveRefs: true
        });
      });
    }
    return {
      provide: {
        nuxtSiteConfig: stack
      }
    };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const rt = (r4) => r4.reduce((e, t) => e + t[0], ""), vn = (r4) => {
  const e = [];
  let t, a = -1;
  return Object.keys(r4).forEach((n) => {
    var _a2;
    const i = (_a2 = r4[n]) == null ? void 0 : _a2.value;
    (i == null ? void 0 : i.content) && (i.content.forEach((o) => {
      var _a3;
      const u = (_a3 = r4[o]) == null ? void 0 : _a3.value;
      if (!u)
        return;
      const c = u.type;
      c && c !== t && (a++, t = c, e[a] = []), e[a].push(o);
    }), t = void 0);
  }), e;
}, bn = (r4, e) => {
  const a = vn(e).find((n) => n.includes(r4));
  if (a)
    return a.indexOf(r4) + 1;
}, yn = (r4 = "", e) => {
  const t = new URL(
    `https://www.notion.so${r4.startsWith("/image") ? r4 : `/image/${encodeURIComponent(r4)}`}`
  );
  if (e && !r4.includes("/images/page-cover/")) {
    const a = e.value.parent_table === "space" ? "block" : e.value.parent_table;
    t.searchParams.set("table", a), t.searchParams.set("id", e.value.id), t.searchParams.set("cache", "v2");
  }
  return t.toString();
}, wn = (r4 = "") => (r4 = r4.replace(/-/g, ""), `/${r4}`), oe = {
  blockMap: { type: Object, required: true },
  contentId: { type: String, required: false },
  contentIndex: { type: Number, default: 0 },
  embedAllow: { type: String, default: "fullscreen" },
  fullPage: { type: Boolean, default: false },
  hideList: { type: Array, default: () => [] },
  level: { type: Number, default: 0 },
  mapImageUrl: { type: Function, default: yn },
  mapPageUrl: { type: Function, default: wn },
  pageLinkOptions: Object,
  pageLinkTarget: { type: String, default: "_self" },
  prism: { type: Boolean, default: false },
  katex: { type: Boolean, default: false },
  textLinkTarget: { type: String, default: "_blank" }
}, ue = (r4) => {
  const e = computed(() => {
    const b = r4.contentId || Object.keys(r4.blockMap)[0];
    return r4.blockMap[b];
  }), t = computed(() => ({
    blockMap: r4.blockMap,
    contentId: r4.contentId,
    contentIndex: r4.contentIndex,
    embedAllow: r4.embedAllow,
    fullPage: r4.fullPage,
    hideList: r4.hideList,
    level: r4.level,
    mapImageUrl: r4.mapImageUrl,
    mapPageUrl: r4.mapPageUrl,
    pageLinkOptions: r4.pageLinkOptions,
    prism: r4.prism,
    katex: r4.katex
  })), a = computed(() => {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _i2, _j, _k, _l2, _m, _n2, _o2, _p, _q, _r, _s2, _t2, _u;
    return {
      block_aspect_ratio: (_c = (_b = (_a2 = e.value) == null ? void 0 : _a2.value) == null ? void 0 : _b.format) == null ? void 0 : _c.block_aspect_ratio,
      block_height: ((_f = (_e = (_d = e.value) == null ? void 0 : _d.value) == null ? void 0 : _e.format) == null ? void 0 : _f.block_height) || 1,
      block_width: ((_i2 = (_h = (_g = e.value) == null ? void 0 : _g.value) == null ? void 0 : _h.format) == null ? void 0 : _i2.block_width) || 1,
      block_color: (_l2 = (_k = (_j = e.value) == null ? void 0 : _j.value) == null ? void 0 : _k.format) == null ? void 0 : _l2.block_color,
      bookmark_icon: (_o2 = (_n2 = (_m = e.value) == null ? void 0 : _m.value) == null ? void 0 : _n2.format) == null ? void 0 : _o2.bookmark_icon,
      bookmark_cover: (_r = (_q = (_p = e.value) == null ? void 0 : _p.value) == null ? void 0 : _q.format) == null ? void 0 : _r.bookmark_cover,
      display_source: (_u = (_t2 = (_s2 = e.value) == null ? void 0 : _s2.value) == null ? void 0 : _t2.format) == null ? void 0 : _u.display_source
    };
  }), n = computed(() => {
    var _a2;
    return (_a2 = e.value) == null ? void 0 : _a2.value.format;
  }), i = computed(() => {
    var _a2;
    return (_a2 = e.value) == null ? void 0 : _a2.value.properties;
  }), o = computed(() => {
    var _a2;
    return (_a2 = n.value) == null ? void 0 : _a2.page_icon;
  }), u = computed(() => {
    var _a2;
    return (_a2 = n.value) == null ? void 0 : _a2.block_width;
  }), c = computed(() => {
    var _a2;
    return (_a2 = i.value) == null ? void 0 : _a2.title;
  }), m = computed(() => {
    var _a2;
    return (_a2 = i.value) == null ? void 0 : _a2.caption;
  }), p = computed(() => {
    var _a2;
    return (_a2 = i.value) == null ? void 0 : _a2.description;
  }), v = computed(() => {
    var _a2;
    return (_a2 = e.value) == null ? void 0 : _a2.value.type;
  }), k = computed(() => {
    var _a2;
    return v.value ? !((_a2 = r4.hideList) == null ? void 0 : _a2.includes(v.value)) : false;
  }), S = computed(() => {
    var _a2, _b;
    return ((_a2 = r4.pageLinkOptions) == null ? void 0 : _a2.component) && ((_b = r4.pageLinkOptions) == null ? void 0 : _b.href);
  }), z = computed(() => {
    var _a2;
    return r4.blockMap[(_a2 = e.value) == null ? void 0 : _a2.value.parent_id];
  });
  return {
    props: r4,
    block: e,
    pass: t,
    f: a,
    format: n,
    properties: i,
    icon: o,
    width: u,
    title: c,
    caption: m,
    description: p,
    type: v,
    visible: k,
    hasPageLinkOptions: S,
    parent: z,
    isType: (b) => Array.isArray(b) ? k.value && b.includes(v.value) : k.value && v.value === b,
    blockColorClass: (b = "") => {
      var _a2, _b, _c;
      const y = (_c = (_b = (_a2 = e.value) == null ? void 0 : _a2.value) == null ? void 0 : _b.format) == null ? void 0 : _c.block_color;
      return y ? `notion-${y}${b}` : void 0;
    },
    pageLinkProps: (b) => r4.pageLinkOptions ? {
      [r4.pageLinkOptions.href]: r4.mapPageUrl(b)
    } : {}
  };
}, xn = [
  "page",
  "header",
  "sub_header",
  "sub_sub_header",
  "bookmark",
  "callout",
  "code",
  "equation",
  "text",
  "quote",
  "to_do",
  "toggle",
  "column_list",
  "column",
  "bulleted_list",
  "numbered_list",
  "image",
  "embed",
  "figma",
  "video",
  "audio",
  "table",
  "table_row",
  "tweet",
  "divider",
  "table_of_contents",
  "transclusion_container",
  "transclusion_reference"
];
class Ie {
  // The + prefix indicates that these fields aren't writeable
  // Lexer holding the input string.
  // Start offset, zero-based inclusive.
  // End offset, zero-based exclusive.
  constructor(e, t, a) {
    this.lexer = void 0, this.start = void 0, this.end = void 0, this.lexer = e, this.start = t, this.end = a;
  }
  /**
   * Merges two `SourceLocation`s from location providers, given they are
   * provided in order of appearance.
   * - Returns the first one's location if only the first is provided.
   * - Returns a merged range of the first and the last if both are provided
   *   and their lexers match.
   * - Otherwise, returns null.
   */
  static range(e, t) {
    return t ? !e || !e.loc || !t.loc || e.loc.lexer !== t.loc.lexer ? null : new Ie(e.loc.lexer, e.loc.start, t.loc.end) : e && e.loc;
  }
}
class qe {
  // don't expand the token
  // used in \noexpand
  constructor(e, t) {
    this.text = void 0, this.loc = void 0, this.noexpand = void 0, this.treatAsRelax = void 0, this.text = e, this.loc = t;
  }
  /**
   * Given a pair of tokens (this and endToken), compute a `Token` encompassing
   * the whole input range enclosed by these two.
   */
  range(e, t) {
    return new qe(t, Ie.range(this, e));
  }
}
class L {
  // Error position based on passed-in Token or ParseNode.
  constructor(e, t) {
    this.position = void 0;
    var a = "KaTeX parse error: " + e, n, i = t && t.loc;
    if (i && i.start <= i.end) {
      var o = i.lexer.input;
      n = i.start;
      var u = i.end;
      n === o.length ? a += " at end of input: " : a += " at position " + (n + 1) + ": ";
      var c = o.slice(n, u).replace(/[^]/g, "$&̲"), m;
      n > 15 ? m = "…" + o.slice(n - 15, n) : m = o.slice(0, n);
      var p;
      u + 15 < o.length ? p = o.slice(u, u + 15) + "…" : p = o.slice(u), a += m + c + p;
    }
    var v = new Error(a);
    return v.name = "ParseError", v.__proto__ = L.prototype, v.position = n, v;
  }
}
L.prototype.__proto__ = Error.prototype;
var kn = function(e, t) {
  return e.indexOf(t) !== -1;
}, Sn = function(e, t) {
  return e === void 0 ? t : e;
}, An = /([A-Z])/g, Tn = function(e) {
  return e.replace(An, "-$1").toLowerCase();
}, _n = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#x27;"
}, En = /[&><"']/g;
function Mn(r4) {
  return String(r4).replace(En, (e) => _n[e]);
}
var da = function r(e) {
  return e.type === "ordgroup" || e.type === "color" ? e.body.length === 1 ? r(e.body[0]) : e : e.type === "font" ? r(e.body) : e;
}, zn = function(e) {
  var t = da(e);
  return t.type === "mathord" || t.type === "textord" || t.type === "atom";
}, Nn = function(e) {
  if (!e)
    throw new Error("Expected non-null, but got " + String(e));
  return e;
}, Cn = function(e) {
  var t = /^\s*([^\\/#]*?)(?::|&#0*58|&#x0*3a)/i.exec(e);
  return t != null ? t[1] : "_relative";
}, W = {
  contains: kn,
  deflt: Sn,
  escape: Mn,
  hyphenate: Tn,
  getBaseElem: da,
  isCharacterBox: zn,
  protocolFromUrl: Cn
}, Q0 = {
  displayMode: {
    type: "boolean",
    description: "Render math in display mode, which puts the math in display style (so \\int and \\sum are large, for example), and centers the math on the page on its own line.",
    cli: "-d, --display-mode"
  },
  output: {
    type: {
      enum: ["htmlAndMathml", "html", "mathml"]
    },
    description: "Determines the markup language of the output.",
    cli: "-F, --format <type>"
  },
  leqno: {
    type: "boolean",
    description: "Render display math in leqno style (left-justified tags)."
  },
  fleqn: {
    type: "boolean",
    description: "Render display math flush left."
  },
  throwOnError: {
    type: "boolean",
    default: true,
    cli: "-t, --no-throw-on-error",
    cliDescription: "Render errors (in the color given by --error-color) instead of throwing a ParseError exception when encountering an error."
  },
  errorColor: {
    type: "string",
    default: "#cc0000",
    cli: "-c, --error-color <color>",
    cliDescription: "A color string given in the format 'rgb' or 'rrggbb' (no #). This option determines the color of errors rendered by the -t option.",
    cliProcessor: (r4) => "#" + r4
  },
  macros: {
    type: "object",
    cli: "-m, --macro <def>",
    cliDescription: "Define custom macro of the form '\\foo:expansion' (use multiple -m arguments for multiple macros).",
    cliDefault: [],
    cliProcessor: (r4, e) => (e.push(r4), e)
  },
  minRuleThickness: {
    type: "number",
    description: "Specifies a minimum thickness, in ems, for fraction lines, `\\sqrt` top lines, `{array}` vertical lines, `\\hline`, `\\hdashline`, `\\underline`, `\\overline`, and the borders of `\\fbox`, `\\boxed`, and `\\fcolorbox`.",
    processor: (r4) => Math.max(0, r4),
    cli: "--min-rule-thickness <size>",
    cliProcessor: parseFloat
  },
  colorIsTextColor: {
    type: "boolean",
    description: "Makes \\color behave like LaTeX's 2-argument \\textcolor, instead of LaTeX's one-argument \\color mode change.",
    cli: "-b, --color-is-text-color"
  },
  strict: {
    type: [{
      enum: ["warn", "ignore", "error"]
    }, "boolean", "function"],
    description: "Turn on strict / LaTeX faithfulness mode, which throws an error if the input uses features that are not supported by LaTeX.",
    cli: "-S, --strict",
    cliDefault: false
  },
  trust: {
    type: ["boolean", "function"],
    description: "Trust the input, enabling all HTML features such as \\url.",
    cli: "-T, --trust"
  },
  maxSize: {
    type: "number",
    default: 1 / 0,
    description: "If non-zero, all user-specified sizes, e.g. in \\rule{500em}{500em}, will be capped to maxSize ems. Otherwise, elements and spaces can be arbitrarily large",
    processor: (r4) => Math.max(0, r4),
    cli: "-s, --max-size <n>",
    cliProcessor: parseInt
  },
  maxExpand: {
    type: "number",
    default: 1e3,
    description: "Limit the number of macro expansions to the specified number, to prevent e.g. infinite macro loops. If set to Infinity, the macro expander will try to fully expand as in LaTeX.",
    processor: (r4) => Math.max(0, r4),
    cli: "-e, --max-expand <n>",
    cliProcessor: (r4) => r4 === "Infinity" ? 1 / 0 : parseInt(r4)
  },
  globalGroup: {
    type: "boolean",
    cli: false
  }
};
function Dn(r4) {
  if (r4.default)
    return r4.default;
  var e = r4.type, t = Array.isArray(e) ? e[0] : e;
  if (typeof t != "string")
    return t.enum[0];
  switch (t) {
    case "boolean":
      return false;
    case "string":
      return "";
    case "number":
      return 0;
    case "object":
      return {};
  }
}
class Yt {
  constructor(e) {
    this.displayMode = void 0, this.output = void 0, this.leqno = void 0, this.fleqn = void 0, this.throwOnError = void 0, this.errorColor = void 0, this.macros = void 0, this.minRuleThickness = void 0, this.colorIsTextColor = void 0, this.strict = void 0, this.trust = void 0, this.maxSize = void 0, this.maxExpand = void 0, this.globalGroup = void 0, e = e || {};
    for (var t in Q0)
      if (Q0.hasOwnProperty(t)) {
        var a = Q0[t];
        this[t] = e[t] !== void 0 ? a.processor ? a.processor(e[t]) : e[t] : Dn(a);
      }
  }
  /**
   * Report nonstrict (non-LaTeX-compatible) input.
   * Can safely not be called if `this.strict` is false in JavaScript.
   */
  reportNonstrict(e, t, a) {
    var n = this.strict;
    if (typeof n == "function" && (n = n(e, t, a)), !(!n || n === "ignore")) {
      if (n === true || n === "error")
        throw new L("LaTeX-incompatible input and strict mode is set to 'error': " + (t + " [" + e + "]"), a);
      n === "warn" ? typeof console < "u" && console.warn("LaTeX-incompatible input and strict mode is set to 'warn': " + (t + " [" + e + "]")) : typeof console < "u" && console.warn("LaTeX-incompatible input and strict mode is set to " + ("unrecognized '" + n + "': " + t + " [" + e + "]"));
    }
  }
  /**
   * Check whether to apply strict (LaTeX-adhering) behavior for unusual
   * input (like `\\`).  Unlike `nonstrict`, will not throw an error;
   * instead, "error" translates to a return value of `true`, while "ignore"
   * translates to a return value of `false`.  May still print a warning:
   * "warn" prints a warning and returns `false`.
   * This is for the second category of `errorCode`s listed in the README.
   */
  useStrictBehavior(e, t, a) {
    var n = this.strict;
    if (typeof n == "function")
      try {
        n = n(e, t, a);
      } catch {
        n = "error";
      }
    return !n || n === "ignore" ? false : n === true || n === "error" ? true : n === "warn" ? (typeof console < "u" && console.warn("LaTeX-incompatible input and strict mode is set to 'warn': " + (t + " [" + e + "]")), false) : (typeof console < "u" && console.warn("LaTeX-incompatible input and strict mode is set to " + ("unrecognized '" + n + "': " + t + " [" + e + "]")), false);
  }
  /**
   * Check whether to test potentially dangerous input, and return
   * `true` (trusted) or `false` (untrusted).  The sole argument `context`
   * should be an object with `command` field specifying the relevant LaTeX
   * command (as a string starting with `\`), and any other arguments, etc.
   * If `context` has a `url` field, a `protocol` field will automatically
   * get added by this function (changing the specified object).
   */
  isTrusted(e) {
    e.url && !e.protocol && (e.protocol = W.protocolFromUrl(e.url));
    var t = typeof this.trust == "function" ? this.trust(e) : this.trust;
    return !!t;
  }
}
class u0 {
  constructor(e, t, a) {
    this.id = void 0, this.size = void 0, this.cramped = void 0, this.id = e, this.size = t, this.cramped = a;
  }
  /**
   * Get the style of a superscript given a base in the current style.
   */
  sup() {
    return Xe[Rn[this.id]];
  }
  /**
   * Get the style of a subscript given a base in the current style.
   */
  sub() {
    return Xe[In[this.id]];
  }
  /**
   * Get the style of a fraction numerator given the fraction in the current
   * style.
   */
  fracNum() {
    return Xe[Bn[this.id]];
  }
  /**
   * Get the style of a fraction denominator given the fraction in the current
   * style.
   */
  fracDen() {
    return Xe[On[this.id]];
  }
  /**
   * Get the cramped version of a style (in particular, cramping a cramped style
   * doesn't change the style).
   */
  cramp() {
    return Xe[Ln[this.id]];
  }
  /**
   * Get a text or display version of this style.
   */
  text() {
    return Xe[$n[this.id]];
  }
  /**
   * Return true if this style is tightly spaced (scriptstyle/scriptscriptstyle)
   */
  isTight() {
    return this.size >= 2;
  }
}
var Wt = 0, at = 1, T0 = 2, a0 = 3, I0 = 4, He = 5, _0 = 6, Ee = 7, Xe = [new u0(Wt, 0, false), new u0(at, 0, true), new u0(T0, 1, false), new u0(a0, 1, true), new u0(I0, 2, false), new u0(He, 2, true), new u0(_0, 3, false), new u0(Ee, 3, true)], Rn = [I0, He, I0, He, _0, Ee, _0, Ee], In = [He, He, He, He, Ee, Ee, Ee, Ee], Bn = [T0, a0, I0, He, _0, Ee, _0, Ee], On = [a0, a0, He, He, Ee, Ee, Ee, Ee], Ln = [at, at, a0, a0, He, He, Ee, Ee], $n = [Wt, at, T0, a0, T0, a0, T0, a0], U = {
  DISPLAY: Xe[Wt],
  TEXT: Xe[T0],
  SCRIPT: Xe[I0],
  SCRIPTSCRIPT: Xe[_0]
}, Ot = [{
  // Latin characters beyond the Latin-1 characters we have metrics for.
  // Needed for Czech, Hungarian and Turkish text, for example.
  name: "latin",
  blocks: [
    [256, 591],
    // Latin Extended-A and Latin Extended-B
    [768, 879]
    // Combining Diacritical marks
  ]
}, {
  // The Cyrillic script used by Russian and related languages.
  // A Cyrillic subset used to be supported as explicitly defined
  // symbols in symbols.js
  name: "cyrillic",
  blocks: [[1024, 1279]]
}, {
  // Armenian
  name: "armenian",
  blocks: [[1328, 1423]]
}, {
  // The Brahmic scripts of South and Southeast Asia
  // Devanagari (0900–097F)
  // Bengali (0980–09FF)
  // Gurmukhi (0A00–0A7F)
  // Gujarati (0A80–0AFF)
  // Oriya (0B00–0B7F)
  // Tamil (0B80–0BFF)
  // Telugu (0C00–0C7F)
  // Kannada (0C80–0CFF)
  // Malayalam (0D00–0D7F)
  // Sinhala (0D80–0DFF)
  // Thai (0E00–0E7F)
  // Lao (0E80–0EFF)
  // Tibetan (0F00–0FFF)
  // Myanmar (1000–109F)
  name: "brahmic",
  blocks: [[2304, 4255]]
}, {
  name: "georgian",
  blocks: [[4256, 4351]]
}, {
  // Chinese and Japanese.
  // The "k" in cjk is for Korean, but we've separated Korean out
  name: "cjk",
  blocks: [
    [12288, 12543],
    // CJK symbols and punctuation, Hiragana, Katakana
    [19968, 40879],
    // CJK ideograms
    [65280, 65376]
    // Fullwidth punctuation
    // TODO: add halfwidth Katakana and Romanji glyphs
  ]
}, {
  // Korean
  name: "hangul",
  blocks: [[44032, 55215]]
}];
function Fn(r4) {
  for (var e = 0; e < Ot.length; e++)
    for (var t = Ot[e], a = 0; a < t.blocks.length; a++) {
      var n = t.blocks[a];
      if (r4 >= n[0] && r4 <= n[1])
        return t.name;
    }
  return null;
}
var et = [];
Ot.forEach((r4) => r4.blocks.forEach((e) => et.push(...e)));
function ha(r4) {
  for (var e = 0; e < et.length; e += 2)
    if (r4 >= et[e] && r4 <= et[e + 1])
      return true;
  return false;
}
var A0 = 80, Pn = function(e, t) {
  return "M95," + (622 + e + t) + `
c-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14
c0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54
c44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10
s173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429
c69,-144,104.5,-217.7,106.5,-221
l` + e / 2.075 + " -" + e + `
c5.3,-9.3,12,-14,20,-14
H400000v` + (40 + e) + `H845.2724
s-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7
c-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z
M` + (834 + e) + " " + t + "h400000v" + (40 + e) + "h-400000z";
}, qn = function(e, t) {
  return "M263," + (601 + e + t) + `c0.7,0,18,39.7,52,119
c34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120
c340,-704.7,510.7,-1060.3,512,-1067
l` + e / 2.084 + " -" + e + `
c4.7,-7.3,11,-11,19,-11
H40000v` + (40 + e) + `H1012.3
s-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232
c-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1
s-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26
c-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z
M` + (1001 + e) + " " + t + "h400000v" + (40 + e) + "h-400000z";
}, Hn = function(e, t) {
  return "M983 " + (10 + e + t) + `
l` + e / 3.13 + " -" + e + `
c4,-6.7,10,-10,18,-10 H400000v` + (40 + e) + `
H1013.1s-83.4,268,-264.1,840c-180.7,572,-277,876.3,-289,913c-4.7,4.7,-12.7,7,-24,7
s-12,0,-12,0c-1.3,-3.3,-3.7,-11.7,-7,-25c-35.3,-125.3,-106.7,-373.3,-214,-744
c-10,12,-21,25,-33,39s-32,39,-32,39c-6,-5.3,-15,-14,-27,-26s25,-30,25,-30
c26.7,-32.7,52,-63,76,-91s52,-60,52,-60s208,722,208,722
c56,-175.3,126.3,-397.3,211,-666c84.7,-268.7,153.8,-488.2,207.5,-658.5
c53.7,-170.3,84.5,-266.8,92.5,-289.5z
M` + (1001 + e) + " " + t + "h400000v" + (40 + e) + "h-400000z";
}, Gn = function(e, t) {
  return "M424," + (2398 + e + t) + `
c-1.3,-0.7,-38.5,-172,-111.5,-514c-73,-342,-109.8,-513.3,-110.5,-514
c0,-2,-10.7,14.3,-32,49c-4.7,7.3,-9.8,15.7,-15.5,25c-5.7,9.3,-9.8,16,-12.5,20
s-5,7,-5,7c-4,-3.3,-8.3,-7.7,-13,-13s-13,-13,-13,-13s76,-122,76,-122s77,-121,77,-121
s209,968,209,968c0,-2,84.7,-361.7,254,-1079c169.3,-717.3,254.7,-1077.7,256,-1081
l` + e / 4.223 + " -" + e + `c4,-6.7,10,-10,18,-10 H400000
v` + (40 + e) + `H1014.6
s-87.3,378.7,-272.6,1166c-185.3,787.3,-279.3,1182.3,-282,1185
c-2,6,-10,9,-24,9
c-8,0,-12,-0.7,-12,-2z M` + (1001 + e) + " " + t + `
h400000v` + (40 + e) + "h-400000z";
}, Un = function(e, t) {
  return "M473," + (2713 + e + t) + `
c339.3,-1799.3,509.3,-2700,510,-2702 l` + e / 5.298 + " -" + e + `
c3.3,-7.3,9.3,-11,18,-11 H400000v` + (40 + e) + `H1017.7
s-90.5,478,-276.2,1466c-185.7,988,-279.5,1483,-281.5,1485c-2,6,-10,9,-24,9
c-8,0,-12,-0.7,-12,-2c0,-1.3,-5.3,-32,-16,-92c-50.7,-293.3,-119.7,-693.3,-207,-1200
c0,-1.3,-5.3,8.7,-16,30c-10.7,21.3,-21.3,42.7,-32,64s-16,33,-16,33s-26,-26,-26,-26
s76,-153,76,-153s77,-151,77,-151c0.7,0.7,35.7,202,105,604c67.3,400.7,102,602.7,104,
606zM` + (1001 + e) + " " + t + "h400000v" + (40 + e) + "H1017.7z";
}, Vn = function(e) {
  var t = e / 2;
  return "M400000 " + e + " H0 L" + t + " 0 l65 45 L145 " + (e - 80) + " H400000z";
}, jn = function(e, t, a) {
  var n = a - 54 - t - e;
  return "M702 " + (e + t) + "H400000" + (40 + e) + `
H742v` + n + `l-4 4-4 4c-.667.7 -2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1
h-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170
c-4-3.333-8.333-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667
219 661 l218 661zM702 ` + t + "H400000v" + (40 + e) + "H742z";
}, Yn = function(e, t, a) {
  t = 1e3 * t;
  var n = "";
  switch (e) {
    case "sqrtMain":
      n = Pn(t, A0);
      break;
    case "sqrtSize1":
      n = qn(t, A0);
      break;
    case "sqrtSize2":
      n = Hn(t, A0);
      break;
    case "sqrtSize3":
      n = Gn(t, A0);
      break;
    case "sqrtSize4":
      n = Un(t, A0);
      break;
    case "sqrtTall":
      n = jn(t, A0, a);
  }
  return n;
}, Wn = function(e, t) {
  switch (e) {
    case "⎜":
      return "M291 0 H417 V" + t + " H291z M291 0 H417 V" + t + " H291z";
    case "∣":
      return "M145 0 H188 V" + t + " H145z M145 0 H188 V" + t + " H145z";
    case "∥":
      return "M145 0 H188 V" + t + " H145z M145 0 H188 V" + t + " H145z" + ("M367 0 H410 V" + t + " H367z M367 0 H410 V" + t + " H367z");
    case "⎟":
      return "M457 0 H583 V" + t + " H457z M457 0 H583 V" + t + " H457z";
    case "⎢":
      return "M319 0 H403 V" + t + " H319z M319 0 H403 V" + t + " H319z";
    case "⎥":
      return "M263 0 H347 V" + t + " H263z M263 0 H347 V" + t + " H263z";
    case "⎪":
      return "M384 0 H504 V" + t + " H384z M384 0 H504 V" + t + " H384z";
    case "⏐":
      return "M312 0 H355 V" + t + " H312z M312 0 H355 V" + t + " H312z";
    case "‖":
      return "M257 0 H300 V" + t + " H257z M257 0 H300 V" + t + " H257z" + ("M478 0 H521 V" + t + " H478z M478 0 H521 V" + t + " H478z");
    default:
      return "";
  }
}, br = {
  // The doubleleftarrow geometry is from glyph U+21D0 in the font KaTeX Main
  doubleleftarrow: `M262 157
l10-10c34-36 62.7-77 86-123 3.3-8 5-13.3 5-16 0-5.3-6.7-8-20-8-7.3
 0-12.2.5-14.5 1.5-2.3 1-4.8 4.5-7.5 10.5-49.3 97.3-121.7 169.3-217 216-28
 14-57.3 25-88 33-6.7 2-11 3.8-13 5.5-2 1.7-3 4.2-3 7.5s1 5.8 3 7.5
c2 1.7 6.3 3.5 13 5.5 68 17.3 128.2 47.8 180.5 91.5 52.3 43.7 93.8 96.2 124.5
 157.5 9.3 8 15.3 12.3 18 13h6c12-.7 18-4 18-10 0-2-1.7-7-5-15-23.3-46-52-87
-86-123l-10-10h399738v-40H218c328 0 0 0 0 0l-10-8c-26.7-20-65.7-43-117-69 2.7
-2 6-3.7 10-5 36.7-16 72.3-37.3 107-64l10-8h399782v-40z
m8 0v40h399730v-40zm0 194v40h399730v-40z`,
  // doublerightarrow is from glyph U+21D2 in font KaTeX Main
  doublerightarrow: `M399738 392l
-10 10c-34 36-62.7 77-86 123-3.3 8-5 13.3-5 16 0 5.3 6.7 8 20 8 7.3 0 12.2-.5
 14.5-1.5 2.3-1 4.8-4.5 7.5-10.5 49.3-97.3 121.7-169.3 217-216 28-14 57.3-25 88
-33 6.7-2 11-3.8 13-5.5 2-1.7 3-4.2 3-7.5s-1-5.8-3-7.5c-2-1.7-6.3-3.5-13-5.5-68
-17.3-128.2-47.8-180.5-91.5-52.3-43.7-93.8-96.2-124.5-157.5-9.3-8-15.3-12.3-18
-13h-6c-12 .7-18 4-18 10 0 2 1.7 7 5 15 23.3 46 52 87 86 123l10 10H0v40h399782
c-328 0 0 0 0 0l10 8c26.7 20 65.7 43 117 69-2.7 2-6 3.7-10 5-36.7 16-72.3 37.3
-107 64l-10 8H0v40zM0 157v40h399730v-40zm0 194v40h399730v-40z`,
  // leftarrow is from glyph U+2190 in font KaTeX Main
  leftarrow: `M400000 241H110l3-3c68.7-52.7 113.7-120
 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8
-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247
c-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208
 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3
 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202
 l-3-3h399890zM100 241v40h399900v-40z`,
  // overbrace is from glyphs U+23A9/23A8/23A7 in font KaTeX_Size4-Regular
  leftbrace: `M6 548l-6-6v-35l6-11c56-104 135.3-181.3 238-232 57.3-28.7 117
-45 179-50h399577v120H403c-43.3 7-81 15-113 26-100.7 33-179.7 91-237 174-2.7
 5-6 9-10 13-.7 1-7.3 1-20 1H6z`,
  leftbraceunder: `M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13
 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688
 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7
-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z`,
  // overgroup is from the MnSymbol package (public domain)
  leftgroup: `M400000 80
H435C64 80 168.3 229.4 21 260c-5.9 1.2-18 0-18 0-2 0-3-1-3-3v-38C76 61 257 0
 435 0h399565z`,
  leftgroupunder: `M400000 262
H435C64 262 168.3 112.6 21 82c-5.9-1.2-18 0-18 0-2 0-3 1-3 3v38c76 158 257 219
 435 219h399565z`,
  // Harpoons are from glyph U+21BD in font KaTeX Main
  leftharpoon: `M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3
-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5
-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7
-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40z`,
  leftharpoonplus: `M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3-3.3 10.2-9.5
 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5-18.3 3-21-1.3
-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7-196 228-6.7 4.7
-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40zM0 435v40h400000v-40z
m0 0v40h400000v-40z`,
  leftharpoondown: `M7 241c-4 4-6.333 8.667-7 14 0 5.333.667 9 2 11s5.333
 5.333 12 10c90.667 54 156 130 196 228 3.333 10.667 6.333 16.333 9 17 2 .667 5
 1 9 1h5c10.667 0 16.667-2 18-6 2-2.667 1-9.667-3-21-32-87.333-82.667-157.667
-152-211l-3-3h399907v-40zM93 281 H400000 v-40L7 241z`,
  leftharpoondownplus: `M7 435c-4 4-6.3 8.7-7 14 0 5.3.7 9 2 11s5.3 5.3 12
 10c90.7 54 156 130 196 228 3.3 10.7 6.3 16.3 9 17 2 .7 5 1 9 1h5c10.7 0 16.7
-2 18-6 2-2.7 1-9.7-3-21-32-87.3-82.7-157.7-152-211l-3-3h399907v-40H7zm93 0
v40h399900v-40zM0 241v40h399900v-40zm0 0v40h399900v-40z`,
  // hook is from glyph U+21A9 in font KaTeX Main
  lefthook: `M400000 281 H103s-33-11.2-61-33.5S0 197.3 0 164s14.2-61.2 42.5
-83.5C70.8 58.2 104 47 142 47 c16.7 0 25 6.7 25 20 0 12-8.7 18.7-26 20-40 3.3
-68.7 15.7-86 37-10 12-15 25.3-15 40 0 22.7 9.8 40.7 29.5 54 19.7 13.3 43.5 21
 71.5 23h399859zM103 281v-40h399897v40z`,
  leftlinesegment: `M40 281 V428 H0 V94 H40 V241 H400000 v40z
M40 281 V428 H0 V94 H40 V241 H400000 v40z`,
  leftmapsto: `M40 281 V448H0V74H40V241H400000v40z
M40 281 V448H0V74H40V241H400000v40z`,
  // tofrom is from glyph U+21C4 in font KaTeX AMS Regular
  leftToFrom: `M0 147h400000v40H0zm0 214c68 40 115.7 95.7 143 167h22c15.3 0 23
-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69-70-101l-7-8h399905v-40H95l7-8
c28.7-32 52-65.7 70-101 10.7-23.3 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 265.3
 68 321 0 361zm0-174v-40h399900v40zm100 154v40h399900v-40z`,
  longequal: `M0 50 h400000 v40H0z m0 194h40000v40H0z
M0 50 h400000 v40H0z m0 194h40000v40H0z`,
  midbrace: `M200428 334
c-100.7-8.3-195.3-44-280-108-55.3-42-101.7-93-139-153l-9-14c-2.7 4-5.7 8.7-9 14
-53.3 86.7-123.7 153-211 199-66.7 36-137.3 56.3-212 62H0V214h199568c178.3-11.7
 311.7-78.3 403-201 6-8 9.7-12 11-12 .7-.7 6.7-1 18-1s17.3.3 18 1c1.3 0 5 4 11
 12 44.7 59.3 101.3 106.3 170 141s145.3 54.3 229 60h199572v120z`,
  midbraceunder: `M199572 214
c100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14
 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3
 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0
-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z`,
  oiintSize1: `M512.6 71.6c272.6 0 320.3 106.8 320.3 178.2 0 70.8-47.7 177.6
-320.3 177.6S193.1 320.6 193.1 249.8c0-71.4 46.9-178.2 319.5-178.2z
m368.1 178.2c0-86.4-60.9-215.4-368.1-215.4-306.4 0-367.3 129-367.3 215.4 0 85.8
60.9 214.8 367.3 214.8 307.2 0 368.1-129 368.1-214.8z`,
  oiintSize2: `M757.8 100.1c384.7 0 451.1 137.6 451.1 230 0 91.3-66.4 228.8
-451.1 228.8-386.3 0-452.7-137.5-452.7-228.8 0-92.4 66.4-230 452.7-230z
m502.4 230c0-111.2-82.4-277.2-502.4-277.2s-504 166-504 277.2
c0 110 84 276 504 276s502.4-166 502.4-276z`,
  oiiintSize1: `M681.4 71.6c408.9 0 480.5 106.8 480.5 178.2 0 70.8-71.6 177.6
-480.5 177.6S202.1 320.6 202.1 249.8c0-71.4 70.5-178.2 479.3-178.2z
m525.8 178.2c0-86.4-86.8-215.4-525.7-215.4-437.9 0-524.7 129-524.7 215.4 0
85.8 86.8 214.8 524.7 214.8 438.9 0 525.7-129 525.7-214.8z`,
  oiiintSize2: `M1021.2 53c603.6 0 707.8 165.8 707.8 277.2 0 110-104.2 275.8
-707.8 275.8-606 0-710.2-165.8-710.2-275.8C311 218.8 415.2 53 1021.2 53z
m770.4 277.1c0-131.2-126.4-327.6-770.5-327.6S248.4 198.9 248.4 330.1
c0 130 128.8 326.4 772.7 326.4s770.5-196.4 770.5-326.4z`,
  rightarrow: `M0 241v40h399891c-47.3 35.3-84 78-110 128
-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20
 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7
 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85
-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
 151.7 139 205zm0 0v40h399900v-40z`,
  rightbrace: `M400000 542l
-6 6h-17c-12.7 0-19.3-.3-20-1-4-4-7.3-8.3-10-13-35.3-51.3-80.8-93.8-136.5-127.5
s-117.2-55.8-184.5-66.5c-.7 0-2-.3-4-1-18.7-2.7-76-4.3-172-5H0V214h399571l6 1
c124.7 8 235 61.7 331 161 31.3 33.3 59.7 72.7 85 118l7 13v35z`,
  rightbraceunder: `M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3
 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237
-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z`,
  rightgroup: `M0 80h399565c371 0 266.7 149.4 414 180 5.9 1.2 18 0 18 0 2 0
 3-1 3-3v-38c-76-158-257-219-435-219H0z`,
  rightgroupunder: `M0 262h399565c371 0 266.7-149.4 414-180 5.9-1.2 18 0 18
 0 2 0 3 1 3 3v38c-76 158-257 219-435 219H0z`,
  rightharpoon: `M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3
-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2
-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58
 69.2 92 94.5zm0 0v40h399900v-40z`,
  rightharpoonplus: `M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3-3.7-15.3-11
-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2-10.7 0-16.7
 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58 69.2 92 94.5z
m0 0v40h399900v-40z m100 194v40h399900v-40zm0 0v40h399900v-40z`,
  rightharpoondown: `M399747 511c0 7.3 6.7 11 20 11 8 0 13-.8 15-2.5s4.7-6.8
 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3 8.5-5.8 9.5
-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3-64.7 57-92 95
-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 241v40h399900v-40z`,
  rightharpoondownplus: `M399747 705c0 7.3 6.7 11 20 11 8 0 13-.8
 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3
 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3
-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 435v40h399900v-40z
m0-194v40h400000v-40zm0 0v40h400000v-40z`,
  righthook: `M399859 241c-764 0 0 0 0 0 40-3.3 68.7-15.7 86-37 10-12 15-25.3
 15-40 0-22.7-9.8-40.7-29.5-54-19.7-13.3-43.5-21-71.5-23-17.3-1.3-26-8-26-20 0
-13.3 8.7-20 26-20 38 0 71 11.2 99 33.5 0 0 7 5.6 21 16.7 14 11.2 21 33.5 21
 66.8s-14 61.2-42 83.5c-28 22.3-61 33.5-99 33.5L0 241z M0 281v-40h399859v40z`,
  rightlinesegment: `M399960 241 V94 h40 V428 h-40 V281 H0 v-40z
M399960 241 V94 h40 V428 h-40 V281 H0 v-40z`,
  rightToFrom: `M400000 167c-70.7-42-118-97.7-142-167h-23c-15.3 0-23 .3-23
 1 0 1.3 5.3 13.7 16 37 18 35.3 41.3 69 70 101l7 8H0v40h399905l-7 8c-28.7 32
-52 65.7-70 101-10.7 23.3-16 35.7-16 37 0 .7 7.7 1 23 1h23c24-69.3 71.3-125 142
-167z M100 147v40h399900v-40zM0 341v40h399900v-40z`,
  // twoheadleftarrow is from glyph U+219E in font KaTeX AMS Regular
  twoheadleftarrow: `M0 167c68 40
 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69
-70-101l-7-8h125l9 7c50.7 39.3 85 86 103 140h46c0-4.7-6.3-18.7-19-42-18-35.3
-40-67.3-66-96l-9-9h399716v-40H284l9-9c26-28.7 48-60.7 66-96 12.7-23.333 19
-37.333 19-42h-46c-18 54-52.3 100.7-103 140l-9 7H95l7-8c28.7-32 52-65.7 70-101
 10.7-23.333 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 71.3 68 127 0 167z`,
  twoheadrightarrow: `M400000 167
c-68-40-115.7-95.7-143-167h-22c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7 16 37 18 35.3
 41.3 69 70 101l7 8h-125l-9-7c-50.7-39.3-85-86-103-140h-46c0 4.7 6.3 18.7 19 42
 18 35.3 40 67.3 66 96l9 9H0v40h399716l-9 9c-26 28.7-48 60.7-66 96-12.7 23.333
-19 37.333-19 42h46c18-54 52.3-100.7 103-140l9-7h125l-7 8c-28.7 32-52 65.7-70
 101-10.7 23.333-16 35.7-16 37 0 .7 7.7 1 23 1h22c27.3-71.3 75-127 143-167z`,
  // tilde1 is a modified version of a glyph from the MnSymbol package
  tilde1: `M200 55.538c-77 0-168 73.953-177 73.953-3 0-7
-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0
 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0
 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128
-68.267.847-113-73.952-191-73.952z`,
  // ditto tilde2, tilde3, & tilde4
  tilde2: `M344 55.266c-142 0-300.638 81.316-311.5 86.418
-8.01 3.762-22.5 10.91-23.5 5.562L1 120c-1-2-1-3-1-4 0-5 3-9 8-10l18.4-9C160.9
 31.9 283 0 358 0c148 0 188 122 331 122s314-97 326-97c4 0 8 2 10 7l7 21.114
c1 2.14 1 3.21 1 4.28 0 5.347-3 9.626-7 10.696l-22.3 12.622C852.6 158.372 751
 181.476 676 181.476c-149 0-189-126.21-332-126.21z`,
  tilde3: `M786 59C457 59 32 175.242 13 175.242c-6 0-10-3.457
-11-10.37L.15 138c-1-7 3-12 10-13l19.2-6.4C378.4 40.7 634.3 0 804.3 0c337 0
 411.8 157 746.8 157 328 0 754-112 773-112 5 0 10 3 11 9l1 14.075c1 8.066-.697
 16.595-6.697 17.492l-21.052 7.31c-367.9 98.146-609.15 122.696-778.15 122.696
 -338 0-409-156.573-744-156.573z`,
  tilde4: `M786 58C457 58 32 177.487 13 177.487c-6 0-10-3.345
-11-10.035L.15 143c-1-7 3-12 10-13l22-6.7C381.2 35 637.15 0 807.15 0c337 0 409
 177 744 177 328 0 754-127 773-127 5 0 10 3 11 9l1 14.794c1 7.805-3 13.38-9
 14.495l-20.7 5.574c-366.85 99.79-607.3 139.372-776.3 139.372-338 0-409
 -175.236-744-175.236z`,
  // vec is from glyph U+20D7 in font KaTeX Main
  vec: `M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5
3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11
10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63
-1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1
-7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59
H213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359
c-16-25.333-24-45-24-59z`,
  // widehat1 is a modified version of a glyph from the MnSymbol package
  widehat1: `M529 0h5l519 115c5 1 9 5 9 10 0 1-1 2-1 3l-4 22
c-1 5-5 9-11 9h-2L532 67 19 159h-2c-5 0-9-4-11-9l-5-22c-1-6 2-12 8-13z`,
  // ditto widehat2, widehat3, & widehat4
  widehat2: `M1181 0h2l1171 176c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 220h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z`,
  widehat3: `M1181 0h2l1171 236c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 280h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z`,
  widehat4: `M1181 0h2l1171 296c6 0 10 5 10 11l-2 23c-1 6-5 10
-11 10h-1L1182 67 15 340h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z`,
  // widecheck paths are all inverted versions of widehat
  widecheck1: `M529,159h5l519,-115c5,-1,9,-5,9,-10c0,-1,-1,-2,-1,-3l-4,-22c-1,
-5,-5,-9,-11,-9h-2l-512,92l-513,-92h-2c-5,0,-9,4,-11,9l-5,22c-1,6,2,12,8,13z`,
  widecheck2: `M1181,220h2l1171,-176c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,
-11,-10h-1l-1168,153l-1167,-153h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z`,
  widecheck3: `M1181,280h2l1171,-236c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,
-11,-10h-1l-1168,213l-1167,-213h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z`,
  widecheck4: `M1181,340h2l1171,-296c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,
-11,-10h-1l-1168,273l-1167,-273h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z`,
  // The next ten paths support reaction arrows from the mhchem package.
  // Arrows for \ce{<-->} are offset from xAxis by 0.22ex, per mhchem in LaTeX
  // baraboveleftarrow is mostly from from glyph U+2190 in font KaTeX Main
  baraboveleftarrow: `M400000 620h-399890l3 -3c68.7 -52.7 113.7 -120 135 -202
c4 -14.7 6 -23 6 -25c0 -7.3 -7 -11 -21 -11c-8 0 -13.2 0.8 -15.5 2.5
c-2.3 1.7 -4.2 5.8 -5.5 12.5c-1.3 4.7 -2.7 10.3 -4 17c-12 48.7 -34.8 92 -68.5 130
s-74.2 66.3 -121.5 85c-10 4 -16 7.7 -18 11c0 8.7 6 14.3 18 17c47.3 18.7 87.8 47
121.5 85s56.5 81.3 68.5 130c0.7 2 1.3 5 2 9s1.2 6.7 1.5 8c0.3 1.3 1 3.3 2 6
s2.2 4.5 3.5 5.5c1.3 1 3.3 1.8 6 2.5s6 1 10 1c14 0 21 -3.7 21 -11
c0 -2 -2 -10.3 -6 -25c-20 -79.3 -65 -146.7 -135 -202l-3 -3h399890z
M100 620v40h399900v-40z M0 241v40h399900v-40zM0 241v40h399900v-40z`,
  // rightarrowabovebar is mostly from glyph U+2192, KaTeX Main
  rightarrowabovebar: `M0 241v40h399891c-47.3 35.3-84 78-110 128-16.7 32
-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20 11 8 0
13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7 39
-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85-40.5
-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5
-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67
151.7 139 205zm96 379h399894v40H0zm0 0h399904v40H0z`,
  // The short left harpoon has 0.5em (i.e. 500 units) kern on the left end.
  // Ref from mhchem.sty: \rlap{\raisebox{-.22ex}{$\kern0.5em
  baraboveshortleftharpoon: `M507,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11
c1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17
c2,0.7,5,1,9,1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21
c-32,-87.3,-82.7,-157.7,-152,-211c0,0,-3,-3,-3,-3l399351,0l0,-40
c-398570,0,-399437,0,-399437,0z M593 435 v40 H399500 v-40z
M0 281 v-40 H399908 v40z M0 281 v-40 H399908 v40z`,
  rightharpoonaboveshortbar: `M0,241 l0,40c399126,0,399993,0,399993,0
c4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,
-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6
c-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z
M0 241 v40 H399908 v-40z M0 475 v-40 H399500 v40z M0 475 v-40 H399500 v40z`,
  shortbaraboveleftharpoon: `M7,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11
c1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17c2,0.7,5,1,9,
1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21c-32,-87.3,-82.7,-157.7,
-152,-211c0,0,-3,-3,-3,-3l399907,0l0,-40c-399126,0,-399993,0,-399993,0z
M93 435 v40 H400000 v-40z M500 241 v40 H400000 v-40z M500 241 v40 H400000 v-40z`,
  shortrightharpoonabovebar: `M53,241l0,40c398570,0,399437,0,399437,0
c4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,
-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6
c-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z
M500 241 v40 H399408 v-40z M500 435 v40 H400000 v-40z`
};
class $0 {
  // HtmlDomNode
  // Never used; needed for satisfying interface.
  constructor(e) {
    this.children = void 0, this.classes = void 0, this.height = void 0, this.depth = void 0, this.maxFontSize = void 0, this.style = void 0, this.children = e, this.classes = [], this.height = 0, this.depth = 0, this.maxFontSize = 0, this.style = {};
  }
  hasClass(e) {
    return W.contains(this.classes, e);
  }
  /** Convert the fragment into a node. */
  toNode() {
    for (var e = (void 0).createDocumentFragment(), t = 0; t < this.children.length; t++)
      e.appendChild(this.children[t].toNode());
    return e;
  }
  /** Convert the fragment into HTML markup. */
  toMarkup() {
    for (var e = "", t = 0; t < this.children.length; t++)
      e += this.children[t].toMarkup();
    return e;
  }
  /**
   * Converts the math node into a string, similar to innerText. Applies to
   * MathDomNode's only.
   */
  toText() {
    var e = (t) => t.toText();
    return this.children.map(e).join("");
  }
}
var Ze = {
  "AMS-Regular": {
    32: [0, 0, 0, 0, 0.25],
    65: [0, 0.68889, 0, 0, 0.72222],
    66: [0, 0.68889, 0, 0, 0.66667],
    67: [0, 0.68889, 0, 0, 0.72222],
    68: [0, 0.68889, 0, 0, 0.72222],
    69: [0, 0.68889, 0, 0, 0.66667],
    70: [0, 0.68889, 0, 0, 0.61111],
    71: [0, 0.68889, 0, 0, 0.77778],
    72: [0, 0.68889, 0, 0, 0.77778],
    73: [0, 0.68889, 0, 0, 0.38889],
    74: [0.16667, 0.68889, 0, 0, 0.5],
    75: [0, 0.68889, 0, 0, 0.77778],
    76: [0, 0.68889, 0, 0, 0.66667],
    77: [0, 0.68889, 0, 0, 0.94445],
    78: [0, 0.68889, 0, 0, 0.72222],
    79: [0.16667, 0.68889, 0, 0, 0.77778],
    80: [0, 0.68889, 0, 0, 0.61111],
    81: [0.16667, 0.68889, 0, 0, 0.77778],
    82: [0, 0.68889, 0, 0, 0.72222],
    83: [0, 0.68889, 0, 0, 0.55556],
    84: [0, 0.68889, 0, 0, 0.66667],
    85: [0, 0.68889, 0, 0, 0.72222],
    86: [0, 0.68889, 0, 0, 0.72222],
    87: [0, 0.68889, 0, 0, 1],
    88: [0, 0.68889, 0, 0, 0.72222],
    89: [0, 0.68889, 0, 0, 0.72222],
    90: [0, 0.68889, 0, 0, 0.66667],
    107: [0, 0.68889, 0, 0, 0.55556],
    160: [0, 0, 0, 0, 0.25],
    165: [0, 0.675, 0.025, 0, 0.75],
    174: [0.15559, 0.69224, 0, 0, 0.94666],
    240: [0, 0.68889, 0, 0, 0.55556],
    295: [0, 0.68889, 0, 0, 0.54028],
    710: [0, 0.825, 0, 0, 2.33334],
    732: [0, 0.9, 0, 0, 2.33334],
    770: [0, 0.825, 0, 0, 2.33334],
    771: [0, 0.9, 0, 0, 2.33334],
    989: [0.08167, 0.58167, 0, 0, 0.77778],
    1008: [0, 0.43056, 0.04028, 0, 0.66667],
    8245: [0, 0.54986, 0, 0, 0.275],
    8463: [0, 0.68889, 0, 0, 0.54028],
    8487: [0, 0.68889, 0, 0, 0.72222],
    8498: [0, 0.68889, 0, 0, 0.55556],
    8502: [0, 0.68889, 0, 0, 0.66667],
    8503: [0, 0.68889, 0, 0, 0.44445],
    8504: [0, 0.68889, 0, 0, 0.66667],
    8513: [0, 0.68889, 0, 0, 0.63889],
    8592: [-0.03598, 0.46402, 0, 0, 0.5],
    8594: [-0.03598, 0.46402, 0, 0, 0.5],
    8602: [-0.13313, 0.36687, 0, 0, 1],
    8603: [-0.13313, 0.36687, 0, 0, 1],
    8606: [0.01354, 0.52239, 0, 0, 1],
    8608: [0.01354, 0.52239, 0, 0, 1],
    8610: [0.01354, 0.52239, 0, 0, 1.11111],
    8611: [0.01354, 0.52239, 0, 0, 1.11111],
    8619: [0, 0.54986, 0, 0, 1],
    8620: [0, 0.54986, 0, 0, 1],
    8621: [-0.13313, 0.37788, 0, 0, 1.38889],
    8622: [-0.13313, 0.36687, 0, 0, 1],
    8624: [0, 0.69224, 0, 0, 0.5],
    8625: [0, 0.69224, 0, 0, 0.5],
    8630: [0, 0.43056, 0, 0, 1],
    8631: [0, 0.43056, 0, 0, 1],
    8634: [0.08198, 0.58198, 0, 0, 0.77778],
    8635: [0.08198, 0.58198, 0, 0, 0.77778],
    8638: [0.19444, 0.69224, 0, 0, 0.41667],
    8639: [0.19444, 0.69224, 0, 0, 0.41667],
    8642: [0.19444, 0.69224, 0, 0, 0.41667],
    8643: [0.19444, 0.69224, 0, 0, 0.41667],
    8644: [0.1808, 0.675, 0, 0, 1],
    8646: [0.1808, 0.675, 0, 0, 1],
    8647: [0.1808, 0.675, 0, 0, 1],
    8648: [0.19444, 0.69224, 0, 0, 0.83334],
    8649: [0.1808, 0.675, 0, 0, 1],
    8650: [0.19444, 0.69224, 0, 0, 0.83334],
    8651: [0.01354, 0.52239, 0, 0, 1],
    8652: [0.01354, 0.52239, 0, 0, 1],
    8653: [-0.13313, 0.36687, 0, 0, 1],
    8654: [-0.13313, 0.36687, 0, 0, 1],
    8655: [-0.13313, 0.36687, 0, 0, 1],
    8666: [0.13667, 0.63667, 0, 0, 1],
    8667: [0.13667, 0.63667, 0, 0, 1],
    8669: [-0.13313, 0.37788, 0, 0, 1],
    8672: [-0.064, 0.437, 0, 0, 1.334],
    8674: [-0.064, 0.437, 0, 0, 1.334],
    8705: [0, 0.825, 0, 0, 0.5],
    8708: [0, 0.68889, 0, 0, 0.55556],
    8709: [0.08167, 0.58167, 0, 0, 0.77778],
    8717: [0, 0.43056, 0, 0, 0.42917],
    8722: [-0.03598, 0.46402, 0, 0, 0.5],
    8724: [0.08198, 0.69224, 0, 0, 0.77778],
    8726: [0.08167, 0.58167, 0, 0, 0.77778],
    8733: [0, 0.69224, 0, 0, 0.77778],
    8736: [0, 0.69224, 0, 0, 0.72222],
    8737: [0, 0.69224, 0, 0, 0.72222],
    8738: [0.03517, 0.52239, 0, 0, 0.72222],
    8739: [0.08167, 0.58167, 0, 0, 0.22222],
    8740: [0.25142, 0.74111, 0, 0, 0.27778],
    8741: [0.08167, 0.58167, 0, 0, 0.38889],
    8742: [0.25142, 0.74111, 0, 0, 0.5],
    8756: [0, 0.69224, 0, 0, 0.66667],
    8757: [0, 0.69224, 0, 0, 0.66667],
    8764: [-0.13313, 0.36687, 0, 0, 0.77778],
    8765: [-0.13313, 0.37788, 0, 0, 0.77778],
    8769: [-0.13313, 0.36687, 0, 0, 0.77778],
    8770: [-0.03625, 0.46375, 0, 0, 0.77778],
    8774: [0.30274, 0.79383, 0, 0, 0.77778],
    8776: [-0.01688, 0.48312, 0, 0, 0.77778],
    8778: [0.08167, 0.58167, 0, 0, 0.77778],
    8782: [0.06062, 0.54986, 0, 0, 0.77778],
    8783: [0.06062, 0.54986, 0, 0, 0.77778],
    8785: [0.08198, 0.58198, 0, 0, 0.77778],
    8786: [0.08198, 0.58198, 0, 0, 0.77778],
    8787: [0.08198, 0.58198, 0, 0, 0.77778],
    8790: [0, 0.69224, 0, 0, 0.77778],
    8791: [0.22958, 0.72958, 0, 0, 0.77778],
    8796: [0.08198, 0.91667, 0, 0, 0.77778],
    8806: [0.25583, 0.75583, 0, 0, 0.77778],
    8807: [0.25583, 0.75583, 0, 0, 0.77778],
    8808: [0.25142, 0.75726, 0, 0, 0.77778],
    8809: [0.25142, 0.75726, 0, 0, 0.77778],
    8812: [0.25583, 0.75583, 0, 0, 0.5],
    8814: [0.20576, 0.70576, 0, 0, 0.77778],
    8815: [0.20576, 0.70576, 0, 0, 0.77778],
    8816: [0.30274, 0.79383, 0, 0, 0.77778],
    8817: [0.30274, 0.79383, 0, 0, 0.77778],
    8818: [0.22958, 0.72958, 0, 0, 0.77778],
    8819: [0.22958, 0.72958, 0, 0, 0.77778],
    8822: [0.1808, 0.675, 0, 0, 0.77778],
    8823: [0.1808, 0.675, 0, 0, 0.77778],
    8828: [0.13667, 0.63667, 0, 0, 0.77778],
    8829: [0.13667, 0.63667, 0, 0, 0.77778],
    8830: [0.22958, 0.72958, 0, 0, 0.77778],
    8831: [0.22958, 0.72958, 0, 0, 0.77778],
    8832: [0.20576, 0.70576, 0, 0, 0.77778],
    8833: [0.20576, 0.70576, 0, 0, 0.77778],
    8840: [0.30274, 0.79383, 0, 0, 0.77778],
    8841: [0.30274, 0.79383, 0, 0, 0.77778],
    8842: [0.13597, 0.63597, 0, 0, 0.77778],
    8843: [0.13597, 0.63597, 0, 0, 0.77778],
    8847: [0.03517, 0.54986, 0, 0, 0.77778],
    8848: [0.03517, 0.54986, 0, 0, 0.77778],
    8858: [0.08198, 0.58198, 0, 0, 0.77778],
    8859: [0.08198, 0.58198, 0, 0, 0.77778],
    8861: [0.08198, 0.58198, 0, 0, 0.77778],
    8862: [0, 0.675, 0, 0, 0.77778],
    8863: [0, 0.675, 0, 0, 0.77778],
    8864: [0, 0.675, 0, 0, 0.77778],
    8865: [0, 0.675, 0, 0, 0.77778],
    8872: [0, 0.69224, 0, 0, 0.61111],
    8873: [0, 0.69224, 0, 0, 0.72222],
    8874: [0, 0.69224, 0, 0, 0.88889],
    8876: [0, 0.68889, 0, 0, 0.61111],
    8877: [0, 0.68889, 0, 0, 0.61111],
    8878: [0, 0.68889, 0, 0, 0.72222],
    8879: [0, 0.68889, 0, 0, 0.72222],
    8882: [0.03517, 0.54986, 0, 0, 0.77778],
    8883: [0.03517, 0.54986, 0, 0, 0.77778],
    8884: [0.13667, 0.63667, 0, 0, 0.77778],
    8885: [0.13667, 0.63667, 0, 0, 0.77778],
    8888: [0, 0.54986, 0, 0, 1.11111],
    8890: [0.19444, 0.43056, 0, 0, 0.55556],
    8891: [0.19444, 0.69224, 0, 0, 0.61111],
    8892: [0.19444, 0.69224, 0, 0, 0.61111],
    8901: [0, 0.54986, 0, 0, 0.27778],
    8903: [0.08167, 0.58167, 0, 0, 0.77778],
    8905: [0.08167, 0.58167, 0, 0, 0.77778],
    8906: [0.08167, 0.58167, 0, 0, 0.77778],
    8907: [0, 0.69224, 0, 0, 0.77778],
    8908: [0, 0.69224, 0, 0, 0.77778],
    8909: [-0.03598, 0.46402, 0, 0, 0.77778],
    8910: [0, 0.54986, 0, 0, 0.76042],
    8911: [0, 0.54986, 0, 0, 0.76042],
    8912: [0.03517, 0.54986, 0, 0, 0.77778],
    8913: [0.03517, 0.54986, 0, 0, 0.77778],
    8914: [0, 0.54986, 0, 0, 0.66667],
    8915: [0, 0.54986, 0, 0, 0.66667],
    8916: [0, 0.69224, 0, 0, 0.66667],
    8918: [0.0391, 0.5391, 0, 0, 0.77778],
    8919: [0.0391, 0.5391, 0, 0, 0.77778],
    8920: [0.03517, 0.54986, 0, 0, 1.33334],
    8921: [0.03517, 0.54986, 0, 0, 1.33334],
    8922: [0.38569, 0.88569, 0, 0, 0.77778],
    8923: [0.38569, 0.88569, 0, 0, 0.77778],
    8926: [0.13667, 0.63667, 0, 0, 0.77778],
    8927: [0.13667, 0.63667, 0, 0, 0.77778],
    8928: [0.30274, 0.79383, 0, 0, 0.77778],
    8929: [0.30274, 0.79383, 0, 0, 0.77778],
    8934: [0.23222, 0.74111, 0, 0, 0.77778],
    8935: [0.23222, 0.74111, 0, 0, 0.77778],
    8936: [0.23222, 0.74111, 0, 0, 0.77778],
    8937: [0.23222, 0.74111, 0, 0, 0.77778],
    8938: [0.20576, 0.70576, 0, 0, 0.77778],
    8939: [0.20576, 0.70576, 0, 0, 0.77778],
    8940: [0.30274, 0.79383, 0, 0, 0.77778],
    8941: [0.30274, 0.79383, 0, 0, 0.77778],
    8994: [0.19444, 0.69224, 0, 0, 0.77778],
    8995: [0.19444, 0.69224, 0, 0, 0.77778],
    9416: [0.15559, 0.69224, 0, 0, 0.90222],
    9484: [0, 0.69224, 0, 0, 0.5],
    9488: [0, 0.69224, 0, 0, 0.5],
    9492: [0, 0.37788, 0, 0, 0.5],
    9496: [0, 0.37788, 0, 0, 0.5],
    9585: [0.19444, 0.68889, 0, 0, 0.88889],
    9586: [0.19444, 0.74111, 0, 0, 0.88889],
    9632: [0, 0.675, 0, 0, 0.77778],
    9633: [0, 0.675, 0, 0, 0.77778],
    9650: [0, 0.54986, 0, 0, 0.72222],
    9651: [0, 0.54986, 0, 0, 0.72222],
    9654: [0.03517, 0.54986, 0, 0, 0.77778],
    9660: [0, 0.54986, 0, 0, 0.72222],
    9661: [0, 0.54986, 0, 0, 0.72222],
    9664: [0.03517, 0.54986, 0, 0, 0.77778],
    9674: [0.11111, 0.69224, 0, 0, 0.66667],
    9733: [0.19444, 0.69224, 0, 0, 0.94445],
    10003: [0, 0.69224, 0, 0, 0.83334],
    10016: [0, 0.69224, 0, 0, 0.83334],
    10731: [0.11111, 0.69224, 0, 0, 0.66667],
    10846: [0.19444, 0.75583, 0, 0, 0.61111],
    10877: [0.13667, 0.63667, 0, 0, 0.77778],
    10878: [0.13667, 0.63667, 0, 0, 0.77778],
    10885: [0.25583, 0.75583, 0, 0, 0.77778],
    10886: [0.25583, 0.75583, 0, 0, 0.77778],
    10887: [0.13597, 0.63597, 0, 0, 0.77778],
    10888: [0.13597, 0.63597, 0, 0, 0.77778],
    10889: [0.26167, 0.75726, 0, 0, 0.77778],
    10890: [0.26167, 0.75726, 0, 0, 0.77778],
    10891: [0.48256, 0.98256, 0, 0, 0.77778],
    10892: [0.48256, 0.98256, 0, 0, 0.77778],
    10901: [0.13667, 0.63667, 0, 0, 0.77778],
    10902: [0.13667, 0.63667, 0, 0, 0.77778],
    10933: [0.25142, 0.75726, 0, 0, 0.77778],
    10934: [0.25142, 0.75726, 0, 0, 0.77778],
    10935: [0.26167, 0.75726, 0, 0, 0.77778],
    10936: [0.26167, 0.75726, 0, 0, 0.77778],
    10937: [0.26167, 0.75726, 0, 0, 0.77778],
    10938: [0.26167, 0.75726, 0, 0, 0.77778],
    10949: [0.25583, 0.75583, 0, 0, 0.77778],
    10950: [0.25583, 0.75583, 0, 0, 0.77778],
    10955: [0.28481, 0.79383, 0, 0, 0.77778],
    10956: [0.28481, 0.79383, 0, 0, 0.77778],
    57350: [0.08167, 0.58167, 0, 0, 0.22222],
    57351: [0.08167, 0.58167, 0, 0, 0.38889],
    57352: [0.08167, 0.58167, 0, 0, 0.77778],
    57353: [0, 0.43056, 0.04028, 0, 0.66667],
    57356: [0.25142, 0.75726, 0, 0, 0.77778],
    57357: [0.25142, 0.75726, 0, 0, 0.77778],
    57358: [0.41951, 0.91951, 0, 0, 0.77778],
    57359: [0.30274, 0.79383, 0, 0, 0.77778],
    57360: [0.30274, 0.79383, 0, 0, 0.77778],
    57361: [0.41951, 0.91951, 0, 0, 0.77778],
    57366: [0.25142, 0.75726, 0, 0, 0.77778],
    57367: [0.25142, 0.75726, 0, 0, 0.77778],
    57368: [0.25142, 0.75726, 0, 0, 0.77778],
    57369: [0.25142, 0.75726, 0, 0, 0.77778],
    57370: [0.13597, 0.63597, 0, 0, 0.77778],
    57371: [0.13597, 0.63597, 0, 0, 0.77778]
  },
  "Caligraphic-Regular": {
    32: [0, 0, 0, 0, 0.25],
    65: [0, 0.68333, 0, 0.19445, 0.79847],
    66: [0, 0.68333, 0.03041, 0.13889, 0.65681],
    67: [0, 0.68333, 0.05834, 0.13889, 0.52653],
    68: [0, 0.68333, 0.02778, 0.08334, 0.77139],
    69: [0, 0.68333, 0.08944, 0.11111, 0.52778],
    70: [0, 0.68333, 0.09931, 0.11111, 0.71875],
    71: [0.09722, 0.68333, 0.0593, 0.11111, 0.59487],
    72: [0, 0.68333, 965e-5, 0.11111, 0.84452],
    73: [0, 0.68333, 0.07382, 0, 0.54452],
    74: [0.09722, 0.68333, 0.18472, 0.16667, 0.67778],
    75: [0, 0.68333, 0.01445, 0.05556, 0.76195],
    76: [0, 0.68333, 0, 0.13889, 0.68972],
    77: [0, 0.68333, 0, 0.13889, 1.2009],
    78: [0, 0.68333, 0.14736, 0.08334, 0.82049],
    79: [0, 0.68333, 0.02778, 0.11111, 0.79611],
    80: [0, 0.68333, 0.08222, 0.08334, 0.69556],
    81: [0.09722, 0.68333, 0, 0.11111, 0.81667],
    82: [0, 0.68333, 0, 0.08334, 0.8475],
    83: [0, 0.68333, 0.075, 0.13889, 0.60556],
    84: [0, 0.68333, 0.25417, 0, 0.54464],
    85: [0, 0.68333, 0.09931, 0.08334, 0.62583],
    86: [0, 0.68333, 0.08222, 0, 0.61278],
    87: [0, 0.68333, 0.08222, 0.08334, 0.98778],
    88: [0, 0.68333, 0.14643, 0.13889, 0.7133],
    89: [0.09722, 0.68333, 0.08222, 0.08334, 0.66834],
    90: [0, 0.68333, 0.07944, 0.13889, 0.72473],
    160: [0, 0, 0, 0, 0.25]
  },
  "Fraktur-Regular": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69141, 0, 0, 0.29574],
    34: [0, 0.69141, 0, 0, 0.21471],
    38: [0, 0.69141, 0, 0, 0.73786],
    39: [0, 0.69141, 0, 0, 0.21201],
    40: [0.24982, 0.74947, 0, 0, 0.38865],
    41: [0.24982, 0.74947, 0, 0, 0.38865],
    42: [0, 0.62119, 0, 0, 0.27764],
    43: [0.08319, 0.58283, 0, 0, 0.75623],
    44: [0, 0.10803, 0, 0, 0.27764],
    45: [0.08319, 0.58283, 0, 0, 0.75623],
    46: [0, 0.10803, 0, 0, 0.27764],
    47: [0.24982, 0.74947, 0, 0, 0.50181],
    48: [0, 0.47534, 0, 0, 0.50181],
    49: [0, 0.47534, 0, 0, 0.50181],
    50: [0, 0.47534, 0, 0, 0.50181],
    51: [0.18906, 0.47534, 0, 0, 0.50181],
    52: [0.18906, 0.47534, 0, 0, 0.50181],
    53: [0.18906, 0.47534, 0, 0, 0.50181],
    54: [0, 0.69141, 0, 0, 0.50181],
    55: [0.18906, 0.47534, 0, 0, 0.50181],
    56: [0, 0.69141, 0, 0, 0.50181],
    57: [0.18906, 0.47534, 0, 0, 0.50181],
    58: [0, 0.47534, 0, 0, 0.21606],
    59: [0.12604, 0.47534, 0, 0, 0.21606],
    61: [-0.13099, 0.36866, 0, 0, 0.75623],
    63: [0, 0.69141, 0, 0, 0.36245],
    65: [0, 0.69141, 0, 0, 0.7176],
    66: [0, 0.69141, 0, 0, 0.88397],
    67: [0, 0.69141, 0, 0, 0.61254],
    68: [0, 0.69141, 0, 0, 0.83158],
    69: [0, 0.69141, 0, 0, 0.66278],
    70: [0.12604, 0.69141, 0, 0, 0.61119],
    71: [0, 0.69141, 0, 0, 0.78539],
    72: [0.06302, 0.69141, 0, 0, 0.7203],
    73: [0, 0.69141, 0, 0, 0.55448],
    74: [0.12604, 0.69141, 0, 0, 0.55231],
    75: [0, 0.69141, 0, 0, 0.66845],
    76: [0, 0.69141, 0, 0, 0.66602],
    77: [0, 0.69141, 0, 0, 1.04953],
    78: [0, 0.69141, 0, 0, 0.83212],
    79: [0, 0.69141, 0, 0, 0.82699],
    80: [0.18906, 0.69141, 0, 0, 0.82753],
    81: [0.03781, 0.69141, 0, 0, 0.82699],
    82: [0, 0.69141, 0, 0, 0.82807],
    83: [0, 0.69141, 0, 0, 0.82861],
    84: [0, 0.69141, 0, 0, 0.66899],
    85: [0, 0.69141, 0, 0, 0.64576],
    86: [0, 0.69141, 0, 0, 0.83131],
    87: [0, 0.69141, 0, 0, 1.04602],
    88: [0, 0.69141, 0, 0, 0.71922],
    89: [0.18906, 0.69141, 0, 0, 0.83293],
    90: [0.12604, 0.69141, 0, 0, 0.60201],
    91: [0.24982, 0.74947, 0, 0, 0.27764],
    93: [0.24982, 0.74947, 0, 0, 0.27764],
    94: [0, 0.69141, 0, 0, 0.49965],
    97: [0, 0.47534, 0, 0, 0.50046],
    98: [0, 0.69141, 0, 0, 0.51315],
    99: [0, 0.47534, 0, 0, 0.38946],
    100: [0, 0.62119, 0, 0, 0.49857],
    101: [0, 0.47534, 0, 0, 0.40053],
    102: [0.18906, 0.69141, 0, 0, 0.32626],
    103: [0.18906, 0.47534, 0, 0, 0.5037],
    104: [0.18906, 0.69141, 0, 0, 0.52126],
    105: [0, 0.69141, 0, 0, 0.27899],
    106: [0, 0.69141, 0, 0, 0.28088],
    107: [0, 0.69141, 0, 0, 0.38946],
    108: [0, 0.69141, 0, 0, 0.27953],
    109: [0, 0.47534, 0, 0, 0.76676],
    110: [0, 0.47534, 0, 0, 0.52666],
    111: [0, 0.47534, 0, 0, 0.48885],
    112: [0.18906, 0.52396, 0, 0, 0.50046],
    113: [0.18906, 0.47534, 0, 0, 0.48912],
    114: [0, 0.47534, 0, 0, 0.38919],
    115: [0, 0.47534, 0, 0, 0.44266],
    116: [0, 0.62119, 0, 0, 0.33301],
    117: [0, 0.47534, 0, 0, 0.5172],
    118: [0, 0.52396, 0, 0, 0.5118],
    119: [0, 0.52396, 0, 0, 0.77351],
    120: [0.18906, 0.47534, 0, 0, 0.38865],
    121: [0.18906, 0.47534, 0, 0, 0.49884],
    122: [0.18906, 0.47534, 0, 0, 0.39054],
    160: [0, 0, 0, 0, 0.25],
    8216: [0, 0.69141, 0, 0, 0.21471],
    8217: [0, 0.69141, 0, 0, 0.21471],
    58112: [0, 0.62119, 0, 0, 0.49749],
    58113: [0, 0.62119, 0, 0, 0.4983],
    58114: [0.18906, 0.69141, 0, 0, 0.33328],
    58115: [0.18906, 0.69141, 0, 0, 0.32923],
    58116: [0.18906, 0.47534, 0, 0, 0.50343],
    58117: [0, 0.69141, 0, 0, 0.33301],
    58118: [0, 0.62119, 0, 0, 0.33409],
    58119: [0, 0.47534, 0, 0, 0.50073]
  },
  "Main-Bold": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0, 0, 0.35],
    34: [0, 0.69444, 0, 0, 0.60278],
    35: [0.19444, 0.69444, 0, 0, 0.95833],
    36: [0.05556, 0.75, 0, 0, 0.575],
    37: [0.05556, 0.75, 0, 0, 0.95833],
    38: [0, 0.69444, 0, 0, 0.89444],
    39: [0, 0.69444, 0, 0, 0.31944],
    40: [0.25, 0.75, 0, 0, 0.44722],
    41: [0.25, 0.75, 0, 0, 0.44722],
    42: [0, 0.75, 0, 0, 0.575],
    43: [0.13333, 0.63333, 0, 0, 0.89444],
    44: [0.19444, 0.15556, 0, 0, 0.31944],
    45: [0, 0.44444, 0, 0, 0.38333],
    46: [0, 0.15556, 0, 0, 0.31944],
    47: [0.25, 0.75, 0, 0, 0.575],
    48: [0, 0.64444, 0, 0, 0.575],
    49: [0, 0.64444, 0, 0, 0.575],
    50: [0, 0.64444, 0, 0, 0.575],
    51: [0, 0.64444, 0, 0, 0.575],
    52: [0, 0.64444, 0, 0, 0.575],
    53: [0, 0.64444, 0, 0, 0.575],
    54: [0, 0.64444, 0, 0, 0.575],
    55: [0, 0.64444, 0, 0, 0.575],
    56: [0, 0.64444, 0, 0, 0.575],
    57: [0, 0.64444, 0, 0, 0.575],
    58: [0, 0.44444, 0, 0, 0.31944],
    59: [0.19444, 0.44444, 0, 0, 0.31944],
    60: [0.08556, 0.58556, 0, 0, 0.89444],
    61: [-0.10889, 0.39111, 0, 0, 0.89444],
    62: [0.08556, 0.58556, 0, 0, 0.89444],
    63: [0, 0.69444, 0, 0, 0.54305],
    64: [0, 0.69444, 0, 0, 0.89444],
    65: [0, 0.68611, 0, 0, 0.86944],
    66: [0, 0.68611, 0, 0, 0.81805],
    67: [0, 0.68611, 0, 0, 0.83055],
    68: [0, 0.68611, 0, 0, 0.88194],
    69: [0, 0.68611, 0, 0, 0.75555],
    70: [0, 0.68611, 0, 0, 0.72361],
    71: [0, 0.68611, 0, 0, 0.90416],
    72: [0, 0.68611, 0, 0, 0.9],
    73: [0, 0.68611, 0, 0, 0.43611],
    74: [0, 0.68611, 0, 0, 0.59444],
    75: [0, 0.68611, 0, 0, 0.90138],
    76: [0, 0.68611, 0, 0, 0.69166],
    77: [0, 0.68611, 0, 0, 1.09166],
    78: [0, 0.68611, 0, 0, 0.9],
    79: [0, 0.68611, 0, 0, 0.86388],
    80: [0, 0.68611, 0, 0, 0.78611],
    81: [0.19444, 0.68611, 0, 0, 0.86388],
    82: [0, 0.68611, 0, 0, 0.8625],
    83: [0, 0.68611, 0, 0, 0.63889],
    84: [0, 0.68611, 0, 0, 0.8],
    85: [0, 0.68611, 0, 0, 0.88472],
    86: [0, 0.68611, 0.01597, 0, 0.86944],
    87: [0, 0.68611, 0.01597, 0, 1.18888],
    88: [0, 0.68611, 0, 0, 0.86944],
    89: [0, 0.68611, 0.02875, 0, 0.86944],
    90: [0, 0.68611, 0, 0, 0.70277],
    91: [0.25, 0.75, 0, 0, 0.31944],
    92: [0.25, 0.75, 0, 0, 0.575],
    93: [0.25, 0.75, 0, 0, 0.31944],
    94: [0, 0.69444, 0, 0, 0.575],
    95: [0.31, 0.13444, 0.03194, 0, 0.575],
    97: [0, 0.44444, 0, 0, 0.55902],
    98: [0, 0.69444, 0, 0, 0.63889],
    99: [0, 0.44444, 0, 0, 0.51111],
    100: [0, 0.69444, 0, 0, 0.63889],
    101: [0, 0.44444, 0, 0, 0.52708],
    102: [0, 0.69444, 0.10903, 0, 0.35139],
    103: [0.19444, 0.44444, 0.01597, 0, 0.575],
    104: [0, 0.69444, 0, 0, 0.63889],
    105: [0, 0.69444, 0, 0, 0.31944],
    106: [0.19444, 0.69444, 0, 0, 0.35139],
    107: [0, 0.69444, 0, 0, 0.60694],
    108: [0, 0.69444, 0, 0, 0.31944],
    109: [0, 0.44444, 0, 0, 0.95833],
    110: [0, 0.44444, 0, 0, 0.63889],
    111: [0, 0.44444, 0, 0, 0.575],
    112: [0.19444, 0.44444, 0, 0, 0.63889],
    113: [0.19444, 0.44444, 0, 0, 0.60694],
    114: [0, 0.44444, 0, 0, 0.47361],
    115: [0, 0.44444, 0, 0, 0.45361],
    116: [0, 0.63492, 0, 0, 0.44722],
    117: [0, 0.44444, 0, 0, 0.63889],
    118: [0, 0.44444, 0.01597, 0, 0.60694],
    119: [0, 0.44444, 0.01597, 0, 0.83055],
    120: [0, 0.44444, 0, 0, 0.60694],
    121: [0.19444, 0.44444, 0.01597, 0, 0.60694],
    122: [0, 0.44444, 0, 0, 0.51111],
    123: [0.25, 0.75, 0, 0, 0.575],
    124: [0.25, 0.75, 0, 0, 0.31944],
    125: [0.25, 0.75, 0, 0, 0.575],
    126: [0.35, 0.34444, 0, 0, 0.575],
    160: [0, 0, 0, 0, 0.25],
    163: [0, 0.69444, 0, 0, 0.86853],
    168: [0, 0.69444, 0, 0, 0.575],
    172: [0, 0.44444, 0, 0, 0.76666],
    176: [0, 0.69444, 0, 0, 0.86944],
    177: [0.13333, 0.63333, 0, 0, 0.89444],
    184: [0.17014, 0, 0, 0, 0.51111],
    198: [0, 0.68611, 0, 0, 1.04166],
    215: [0.13333, 0.63333, 0, 0, 0.89444],
    216: [0.04861, 0.73472, 0, 0, 0.89444],
    223: [0, 0.69444, 0, 0, 0.59722],
    230: [0, 0.44444, 0, 0, 0.83055],
    247: [0.13333, 0.63333, 0, 0, 0.89444],
    248: [0.09722, 0.54167, 0, 0, 0.575],
    305: [0, 0.44444, 0, 0, 0.31944],
    338: [0, 0.68611, 0, 0, 1.16944],
    339: [0, 0.44444, 0, 0, 0.89444],
    567: [0.19444, 0.44444, 0, 0, 0.35139],
    710: [0, 0.69444, 0, 0, 0.575],
    711: [0, 0.63194, 0, 0, 0.575],
    713: [0, 0.59611, 0, 0, 0.575],
    714: [0, 0.69444, 0, 0, 0.575],
    715: [0, 0.69444, 0, 0, 0.575],
    728: [0, 0.69444, 0, 0, 0.575],
    729: [0, 0.69444, 0, 0, 0.31944],
    730: [0, 0.69444, 0, 0, 0.86944],
    732: [0, 0.69444, 0, 0, 0.575],
    733: [0, 0.69444, 0, 0, 0.575],
    915: [0, 0.68611, 0, 0, 0.69166],
    916: [0, 0.68611, 0, 0, 0.95833],
    920: [0, 0.68611, 0, 0, 0.89444],
    923: [0, 0.68611, 0, 0, 0.80555],
    926: [0, 0.68611, 0, 0, 0.76666],
    928: [0, 0.68611, 0, 0, 0.9],
    931: [0, 0.68611, 0, 0, 0.83055],
    933: [0, 0.68611, 0, 0, 0.89444],
    934: [0, 0.68611, 0, 0, 0.83055],
    936: [0, 0.68611, 0, 0, 0.89444],
    937: [0, 0.68611, 0, 0, 0.83055],
    8211: [0, 0.44444, 0.03194, 0, 0.575],
    8212: [0, 0.44444, 0.03194, 0, 1.14999],
    8216: [0, 0.69444, 0, 0, 0.31944],
    8217: [0, 0.69444, 0, 0, 0.31944],
    8220: [0, 0.69444, 0, 0, 0.60278],
    8221: [0, 0.69444, 0, 0, 0.60278],
    8224: [0.19444, 0.69444, 0, 0, 0.51111],
    8225: [0.19444, 0.69444, 0, 0, 0.51111],
    8242: [0, 0.55556, 0, 0, 0.34444],
    8407: [0, 0.72444, 0.15486, 0, 0.575],
    8463: [0, 0.69444, 0, 0, 0.66759],
    8465: [0, 0.69444, 0, 0, 0.83055],
    8467: [0, 0.69444, 0, 0, 0.47361],
    8472: [0.19444, 0.44444, 0, 0, 0.74027],
    8476: [0, 0.69444, 0, 0, 0.83055],
    8501: [0, 0.69444, 0, 0, 0.70277],
    8592: [-0.10889, 0.39111, 0, 0, 1.14999],
    8593: [0.19444, 0.69444, 0, 0, 0.575],
    8594: [-0.10889, 0.39111, 0, 0, 1.14999],
    8595: [0.19444, 0.69444, 0, 0, 0.575],
    8596: [-0.10889, 0.39111, 0, 0, 1.14999],
    8597: [0.25, 0.75, 0, 0, 0.575],
    8598: [0.19444, 0.69444, 0, 0, 1.14999],
    8599: [0.19444, 0.69444, 0, 0, 1.14999],
    8600: [0.19444, 0.69444, 0, 0, 1.14999],
    8601: [0.19444, 0.69444, 0, 0, 1.14999],
    8636: [-0.10889, 0.39111, 0, 0, 1.14999],
    8637: [-0.10889, 0.39111, 0, 0, 1.14999],
    8640: [-0.10889, 0.39111, 0, 0, 1.14999],
    8641: [-0.10889, 0.39111, 0, 0, 1.14999],
    8656: [-0.10889, 0.39111, 0, 0, 1.14999],
    8657: [0.19444, 0.69444, 0, 0, 0.70277],
    8658: [-0.10889, 0.39111, 0, 0, 1.14999],
    8659: [0.19444, 0.69444, 0, 0, 0.70277],
    8660: [-0.10889, 0.39111, 0, 0, 1.14999],
    8661: [0.25, 0.75, 0, 0, 0.70277],
    8704: [0, 0.69444, 0, 0, 0.63889],
    8706: [0, 0.69444, 0.06389, 0, 0.62847],
    8707: [0, 0.69444, 0, 0, 0.63889],
    8709: [0.05556, 0.75, 0, 0, 0.575],
    8711: [0, 0.68611, 0, 0, 0.95833],
    8712: [0.08556, 0.58556, 0, 0, 0.76666],
    8715: [0.08556, 0.58556, 0, 0, 0.76666],
    8722: [0.13333, 0.63333, 0, 0, 0.89444],
    8723: [0.13333, 0.63333, 0, 0, 0.89444],
    8725: [0.25, 0.75, 0, 0, 0.575],
    8726: [0.25, 0.75, 0, 0, 0.575],
    8727: [-0.02778, 0.47222, 0, 0, 0.575],
    8728: [-0.02639, 0.47361, 0, 0, 0.575],
    8729: [-0.02639, 0.47361, 0, 0, 0.575],
    8730: [0.18, 0.82, 0, 0, 0.95833],
    8733: [0, 0.44444, 0, 0, 0.89444],
    8734: [0, 0.44444, 0, 0, 1.14999],
    8736: [0, 0.69224, 0, 0, 0.72222],
    8739: [0.25, 0.75, 0, 0, 0.31944],
    8741: [0.25, 0.75, 0, 0, 0.575],
    8743: [0, 0.55556, 0, 0, 0.76666],
    8744: [0, 0.55556, 0, 0, 0.76666],
    8745: [0, 0.55556, 0, 0, 0.76666],
    8746: [0, 0.55556, 0, 0, 0.76666],
    8747: [0.19444, 0.69444, 0.12778, 0, 0.56875],
    8764: [-0.10889, 0.39111, 0, 0, 0.89444],
    8768: [0.19444, 0.69444, 0, 0, 0.31944],
    8771: [222e-5, 0.50222, 0, 0, 0.89444],
    8773: [0.027, 0.638, 0, 0, 0.894],
    8776: [0.02444, 0.52444, 0, 0, 0.89444],
    8781: [222e-5, 0.50222, 0, 0, 0.89444],
    8801: [222e-5, 0.50222, 0, 0, 0.89444],
    8804: [0.19667, 0.69667, 0, 0, 0.89444],
    8805: [0.19667, 0.69667, 0, 0, 0.89444],
    8810: [0.08556, 0.58556, 0, 0, 1.14999],
    8811: [0.08556, 0.58556, 0, 0, 1.14999],
    8826: [0.08556, 0.58556, 0, 0, 0.89444],
    8827: [0.08556, 0.58556, 0, 0, 0.89444],
    8834: [0.08556, 0.58556, 0, 0, 0.89444],
    8835: [0.08556, 0.58556, 0, 0, 0.89444],
    8838: [0.19667, 0.69667, 0, 0, 0.89444],
    8839: [0.19667, 0.69667, 0, 0, 0.89444],
    8846: [0, 0.55556, 0, 0, 0.76666],
    8849: [0.19667, 0.69667, 0, 0, 0.89444],
    8850: [0.19667, 0.69667, 0, 0, 0.89444],
    8851: [0, 0.55556, 0, 0, 0.76666],
    8852: [0, 0.55556, 0, 0, 0.76666],
    8853: [0.13333, 0.63333, 0, 0, 0.89444],
    8854: [0.13333, 0.63333, 0, 0, 0.89444],
    8855: [0.13333, 0.63333, 0, 0, 0.89444],
    8856: [0.13333, 0.63333, 0, 0, 0.89444],
    8857: [0.13333, 0.63333, 0, 0, 0.89444],
    8866: [0, 0.69444, 0, 0, 0.70277],
    8867: [0, 0.69444, 0, 0, 0.70277],
    8868: [0, 0.69444, 0, 0, 0.89444],
    8869: [0, 0.69444, 0, 0, 0.89444],
    8900: [-0.02639, 0.47361, 0, 0, 0.575],
    8901: [-0.02639, 0.47361, 0, 0, 0.31944],
    8902: [-0.02778, 0.47222, 0, 0, 0.575],
    8968: [0.25, 0.75, 0, 0, 0.51111],
    8969: [0.25, 0.75, 0, 0, 0.51111],
    8970: [0.25, 0.75, 0, 0, 0.51111],
    8971: [0.25, 0.75, 0, 0, 0.51111],
    8994: [-0.13889, 0.36111, 0, 0, 1.14999],
    8995: [-0.13889, 0.36111, 0, 0, 1.14999],
    9651: [0.19444, 0.69444, 0, 0, 1.02222],
    9657: [-0.02778, 0.47222, 0, 0, 0.575],
    9661: [0.19444, 0.69444, 0, 0, 1.02222],
    9667: [-0.02778, 0.47222, 0, 0, 0.575],
    9711: [0.19444, 0.69444, 0, 0, 1.14999],
    9824: [0.12963, 0.69444, 0, 0, 0.89444],
    9825: [0.12963, 0.69444, 0, 0, 0.89444],
    9826: [0.12963, 0.69444, 0, 0, 0.89444],
    9827: [0.12963, 0.69444, 0, 0, 0.89444],
    9837: [0, 0.75, 0, 0, 0.44722],
    9838: [0.19444, 0.69444, 0, 0, 0.44722],
    9839: [0.19444, 0.69444, 0, 0, 0.44722],
    10216: [0.25, 0.75, 0, 0, 0.44722],
    10217: [0.25, 0.75, 0, 0, 0.44722],
    10815: [0, 0.68611, 0, 0, 0.9],
    10927: [0.19667, 0.69667, 0, 0, 0.89444],
    10928: [0.19667, 0.69667, 0, 0, 0.89444],
    57376: [0.19444, 0.69444, 0, 0, 0]
  },
  "Main-BoldItalic": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0.11417, 0, 0.38611],
    34: [0, 0.69444, 0.07939, 0, 0.62055],
    35: [0.19444, 0.69444, 0.06833, 0, 0.94444],
    37: [0.05556, 0.75, 0.12861, 0, 0.94444],
    38: [0, 0.69444, 0.08528, 0, 0.88555],
    39: [0, 0.69444, 0.12945, 0, 0.35555],
    40: [0.25, 0.75, 0.15806, 0, 0.47333],
    41: [0.25, 0.75, 0.03306, 0, 0.47333],
    42: [0, 0.75, 0.14333, 0, 0.59111],
    43: [0.10333, 0.60333, 0.03306, 0, 0.88555],
    44: [0.19444, 0.14722, 0, 0, 0.35555],
    45: [0, 0.44444, 0.02611, 0, 0.41444],
    46: [0, 0.14722, 0, 0, 0.35555],
    47: [0.25, 0.75, 0.15806, 0, 0.59111],
    48: [0, 0.64444, 0.13167, 0, 0.59111],
    49: [0, 0.64444, 0.13167, 0, 0.59111],
    50: [0, 0.64444, 0.13167, 0, 0.59111],
    51: [0, 0.64444, 0.13167, 0, 0.59111],
    52: [0.19444, 0.64444, 0.13167, 0, 0.59111],
    53: [0, 0.64444, 0.13167, 0, 0.59111],
    54: [0, 0.64444, 0.13167, 0, 0.59111],
    55: [0.19444, 0.64444, 0.13167, 0, 0.59111],
    56: [0, 0.64444, 0.13167, 0, 0.59111],
    57: [0, 0.64444, 0.13167, 0, 0.59111],
    58: [0, 0.44444, 0.06695, 0, 0.35555],
    59: [0.19444, 0.44444, 0.06695, 0, 0.35555],
    61: [-0.10889, 0.39111, 0.06833, 0, 0.88555],
    63: [0, 0.69444, 0.11472, 0, 0.59111],
    64: [0, 0.69444, 0.09208, 0, 0.88555],
    65: [0, 0.68611, 0, 0, 0.86555],
    66: [0, 0.68611, 0.0992, 0, 0.81666],
    67: [0, 0.68611, 0.14208, 0, 0.82666],
    68: [0, 0.68611, 0.09062, 0, 0.87555],
    69: [0, 0.68611, 0.11431, 0, 0.75666],
    70: [0, 0.68611, 0.12903, 0, 0.72722],
    71: [0, 0.68611, 0.07347, 0, 0.89527],
    72: [0, 0.68611, 0.17208, 0, 0.8961],
    73: [0, 0.68611, 0.15681, 0, 0.47166],
    74: [0, 0.68611, 0.145, 0, 0.61055],
    75: [0, 0.68611, 0.14208, 0, 0.89499],
    76: [0, 0.68611, 0, 0, 0.69777],
    77: [0, 0.68611, 0.17208, 0, 1.07277],
    78: [0, 0.68611, 0.17208, 0, 0.8961],
    79: [0, 0.68611, 0.09062, 0, 0.85499],
    80: [0, 0.68611, 0.0992, 0, 0.78721],
    81: [0.19444, 0.68611, 0.09062, 0, 0.85499],
    82: [0, 0.68611, 0.02559, 0, 0.85944],
    83: [0, 0.68611, 0.11264, 0, 0.64999],
    84: [0, 0.68611, 0.12903, 0, 0.7961],
    85: [0, 0.68611, 0.17208, 0, 0.88083],
    86: [0, 0.68611, 0.18625, 0, 0.86555],
    87: [0, 0.68611, 0.18625, 0, 1.15999],
    88: [0, 0.68611, 0.15681, 0, 0.86555],
    89: [0, 0.68611, 0.19803, 0, 0.86555],
    90: [0, 0.68611, 0.14208, 0, 0.70888],
    91: [0.25, 0.75, 0.1875, 0, 0.35611],
    93: [0.25, 0.75, 0.09972, 0, 0.35611],
    94: [0, 0.69444, 0.06709, 0, 0.59111],
    95: [0.31, 0.13444, 0.09811, 0, 0.59111],
    97: [0, 0.44444, 0.09426, 0, 0.59111],
    98: [0, 0.69444, 0.07861, 0, 0.53222],
    99: [0, 0.44444, 0.05222, 0, 0.53222],
    100: [0, 0.69444, 0.10861, 0, 0.59111],
    101: [0, 0.44444, 0.085, 0, 0.53222],
    102: [0.19444, 0.69444, 0.21778, 0, 0.4],
    103: [0.19444, 0.44444, 0.105, 0, 0.53222],
    104: [0, 0.69444, 0.09426, 0, 0.59111],
    105: [0, 0.69326, 0.11387, 0, 0.35555],
    106: [0.19444, 0.69326, 0.1672, 0, 0.35555],
    107: [0, 0.69444, 0.11111, 0, 0.53222],
    108: [0, 0.69444, 0.10861, 0, 0.29666],
    109: [0, 0.44444, 0.09426, 0, 0.94444],
    110: [0, 0.44444, 0.09426, 0, 0.64999],
    111: [0, 0.44444, 0.07861, 0, 0.59111],
    112: [0.19444, 0.44444, 0.07861, 0, 0.59111],
    113: [0.19444, 0.44444, 0.105, 0, 0.53222],
    114: [0, 0.44444, 0.11111, 0, 0.50167],
    115: [0, 0.44444, 0.08167, 0, 0.48694],
    116: [0, 0.63492, 0.09639, 0, 0.385],
    117: [0, 0.44444, 0.09426, 0, 0.62055],
    118: [0, 0.44444, 0.11111, 0, 0.53222],
    119: [0, 0.44444, 0.11111, 0, 0.76777],
    120: [0, 0.44444, 0.12583, 0, 0.56055],
    121: [0.19444, 0.44444, 0.105, 0, 0.56166],
    122: [0, 0.44444, 0.13889, 0, 0.49055],
    126: [0.35, 0.34444, 0.11472, 0, 0.59111],
    160: [0, 0, 0, 0, 0.25],
    168: [0, 0.69444, 0.11473, 0, 0.59111],
    176: [0, 0.69444, 0, 0, 0.94888],
    184: [0.17014, 0, 0, 0, 0.53222],
    198: [0, 0.68611, 0.11431, 0, 1.02277],
    216: [0.04861, 0.73472, 0.09062, 0, 0.88555],
    223: [0.19444, 0.69444, 0.09736, 0, 0.665],
    230: [0, 0.44444, 0.085, 0, 0.82666],
    248: [0.09722, 0.54167, 0.09458, 0, 0.59111],
    305: [0, 0.44444, 0.09426, 0, 0.35555],
    338: [0, 0.68611, 0.11431, 0, 1.14054],
    339: [0, 0.44444, 0.085, 0, 0.82666],
    567: [0.19444, 0.44444, 0.04611, 0, 0.385],
    710: [0, 0.69444, 0.06709, 0, 0.59111],
    711: [0, 0.63194, 0.08271, 0, 0.59111],
    713: [0, 0.59444, 0.10444, 0, 0.59111],
    714: [0, 0.69444, 0.08528, 0, 0.59111],
    715: [0, 0.69444, 0, 0, 0.59111],
    728: [0, 0.69444, 0.10333, 0, 0.59111],
    729: [0, 0.69444, 0.12945, 0, 0.35555],
    730: [0, 0.69444, 0, 0, 0.94888],
    732: [0, 0.69444, 0.11472, 0, 0.59111],
    733: [0, 0.69444, 0.11472, 0, 0.59111],
    915: [0, 0.68611, 0.12903, 0, 0.69777],
    916: [0, 0.68611, 0, 0, 0.94444],
    920: [0, 0.68611, 0.09062, 0, 0.88555],
    923: [0, 0.68611, 0, 0, 0.80666],
    926: [0, 0.68611, 0.15092, 0, 0.76777],
    928: [0, 0.68611, 0.17208, 0, 0.8961],
    931: [0, 0.68611, 0.11431, 0, 0.82666],
    933: [0, 0.68611, 0.10778, 0, 0.88555],
    934: [0, 0.68611, 0.05632, 0, 0.82666],
    936: [0, 0.68611, 0.10778, 0, 0.88555],
    937: [0, 0.68611, 0.0992, 0, 0.82666],
    8211: [0, 0.44444, 0.09811, 0, 0.59111],
    8212: [0, 0.44444, 0.09811, 0, 1.18221],
    8216: [0, 0.69444, 0.12945, 0, 0.35555],
    8217: [0, 0.69444, 0.12945, 0, 0.35555],
    8220: [0, 0.69444, 0.16772, 0, 0.62055],
    8221: [0, 0.69444, 0.07939, 0, 0.62055]
  },
  "Main-Italic": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0.12417, 0, 0.30667],
    34: [0, 0.69444, 0.06961, 0, 0.51444],
    35: [0.19444, 0.69444, 0.06616, 0, 0.81777],
    37: [0.05556, 0.75, 0.13639, 0, 0.81777],
    38: [0, 0.69444, 0.09694, 0, 0.76666],
    39: [0, 0.69444, 0.12417, 0, 0.30667],
    40: [0.25, 0.75, 0.16194, 0, 0.40889],
    41: [0.25, 0.75, 0.03694, 0, 0.40889],
    42: [0, 0.75, 0.14917, 0, 0.51111],
    43: [0.05667, 0.56167, 0.03694, 0, 0.76666],
    44: [0.19444, 0.10556, 0, 0, 0.30667],
    45: [0, 0.43056, 0.02826, 0, 0.35778],
    46: [0, 0.10556, 0, 0, 0.30667],
    47: [0.25, 0.75, 0.16194, 0, 0.51111],
    48: [0, 0.64444, 0.13556, 0, 0.51111],
    49: [0, 0.64444, 0.13556, 0, 0.51111],
    50: [0, 0.64444, 0.13556, 0, 0.51111],
    51: [0, 0.64444, 0.13556, 0, 0.51111],
    52: [0.19444, 0.64444, 0.13556, 0, 0.51111],
    53: [0, 0.64444, 0.13556, 0, 0.51111],
    54: [0, 0.64444, 0.13556, 0, 0.51111],
    55: [0.19444, 0.64444, 0.13556, 0, 0.51111],
    56: [0, 0.64444, 0.13556, 0, 0.51111],
    57: [0, 0.64444, 0.13556, 0, 0.51111],
    58: [0, 0.43056, 0.0582, 0, 0.30667],
    59: [0.19444, 0.43056, 0.0582, 0, 0.30667],
    61: [-0.13313, 0.36687, 0.06616, 0, 0.76666],
    63: [0, 0.69444, 0.1225, 0, 0.51111],
    64: [0, 0.69444, 0.09597, 0, 0.76666],
    65: [0, 0.68333, 0, 0, 0.74333],
    66: [0, 0.68333, 0.10257, 0, 0.70389],
    67: [0, 0.68333, 0.14528, 0, 0.71555],
    68: [0, 0.68333, 0.09403, 0, 0.755],
    69: [0, 0.68333, 0.12028, 0, 0.67833],
    70: [0, 0.68333, 0.13305, 0, 0.65277],
    71: [0, 0.68333, 0.08722, 0, 0.77361],
    72: [0, 0.68333, 0.16389, 0, 0.74333],
    73: [0, 0.68333, 0.15806, 0, 0.38555],
    74: [0, 0.68333, 0.14028, 0, 0.525],
    75: [0, 0.68333, 0.14528, 0, 0.76888],
    76: [0, 0.68333, 0, 0, 0.62722],
    77: [0, 0.68333, 0.16389, 0, 0.89666],
    78: [0, 0.68333, 0.16389, 0, 0.74333],
    79: [0, 0.68333, 0.09403, 0, 0.76666],
    80: [0, 0.68333, 0.10257, 0, 0.67833],
    81: [0.19444, 0.68333, 0.09403, 0, 0.76666],
    82: [0, 0.68333, 0.03868, 0, 0.72944],
    83: [0, 0.68333, 0.11972, 0, 0.56222],
    84: [0, 0.68333, 0.13305, 0, 0.71555],
    85: [0, 0.68333, 0.16389, 0, 0.74333],
    86: [0, 0.68333, 0.18361, 0, 0.74333],
    87: [0, 0.68333, 0.18361, 0, 0.99888],
    88: [0, 0.68333, 0.15806, 0, 0.74333],
    89: [0, 0.68333, 0.19383, 0, 0.74333],
    90: [0, 0.68333, 0.14528, 0, 0.61333],
    91: [0.25, 0.75, 0.1875, 0, 0.30667],
    93: [0.25, 0.75, 0.10528, 0, 0.30667],
    94: [0, 0.69444, 0.06646, 0, 0.51111],
    95: [0.31, 0.12056, 0.09208, 0, 0.51111],
    97: [0, 0.43056, 0.07671, 0, 0.51111],
    98: [0, 0.69444, 0.06312, 0, 0.46],
    99: [0, 0.43056, 0.05653, 0, 0.46],
    100: [0, 0.69444, 0.10333, 0, 0.51111],
    101: [0, 0.43056, 0.07514, 0, 0.46],
    102: [0.19444, 0.69444, 0.21194, 0, 0.30667],
    103: [0.19444, 0.43056, 0.08847, 0, 0.46],
    104: [0, 0.69444, 0.07671, 0, 0.51111],
    105: [0, 0.65536, 0.1019, 0, 0.30667],
    106: [0.19444, 0.65536, 0.14467, 0, 0.30667],
    107: [0, 0.69444, 0.10764, 0, 0.46],
    108: [0, 0.69444, 0.10333, 0, 0.25555],
    109: [0, 0.43056, 0.07671, 0, 0.81777],
    110: [0, 0.43056, 0.07671, 0, 0.56222],
    111: [0, 0.43056, 0.06312, 0, 0.51111],
    112: [0.19444, 0.43056, 0.06312, 0, 0.51111],
    113: [0.19444, 0.43056, 0.08847, 0, 0.46],
    114: [0, 0.43056, 0.10764, 0, 0.42166],
    115: [0, 0.43056, 0.08208, 0, 0.40889],
    116: [0, 0.61508, 0.09486, 0, 0.33222],
    117: [0, 0.43056, 0.07671, 0, 0.53666],
    118: [0, 0.43056, 0.10764, 0, 0.46],
    119: [0, 0.43056, 0.10764, 0, 0.66444],
    120: [0, 0.43056, 0.12042, 0, 0.46389],
    121: [0.19444, 0.43056, 0.08847, 0, 0.48555],
    122: [0, 0.43056, 0.12292, 0, 0.40889],
    126: [0.35, 0.31786, 0.11585, 0, 0.51111],
    160: [0, 0, 0, 0, 0.25],
    168: [0, 0.66786, 0.10474, 0, 0.51111],
    176: [0, 0.69444, 0, 0, 0.83129],
    184: [0.17014, 0, 0, 0, 0.46],
    198: [0, 0.68333, 0.12028, 0, 0.88277],
    216: [0.04861, 0.73194, 0.09403, 0, 0.76666],
    223: [0.19444, 0.69444, 0.10514, 0, 0.53666],
    230: [0, 0.43056, 0.07514, 0, 0.71555],
    248: [0.09722, 0.52778, 0.09194, 0, 0.51111],
    338: [0, 0.68333, 0.12028, 0, 0.98499],
    339: [0, 0.43056, 0.07514, 0, 0.71555],
    710: [0, 0.69444, 0.06646, 0, 0.51111],
    711: [0, 0.62847, 0.08295, 0, 0.51111],
    713: [0, 0.56167, 0.10333, 0, 0.51111],
    714: [0, 0.69444, 0.09694, 0, 0.51111],
    715: [0, 0.69444, 0, 0, 0.51111],
    728: [0, 0.69444, 0.10806, 0, 0.51111],
    729: [0, 0.66786, 0.11752, 0, 0.30667],
    730: [0, 0.69444, 0, 0, 0.83129],
    732: [0, 0.66786, 0.11585, 0, 0.51111],
    733: [0, 0.69444, 0.1225, 0, 0.51111],
    915: [0, 0.68333, 0.13305, 0, 0.62722],
    916: [0, 0.68333, 0, 0, 0.81777],
    920: [0, 0.68333, 0.09403, 0, 0.76666],
    923: [0, 0.68333, 0, 0, 0.69222],
    926: [0, 0.68333, 0.15294, 0, 0.66444],
    928: [0, 0.68333, 0.16389, 0, 0.74333],
    931: [0, 0.68333, 0.12028, 0, 0.71555],
    933: [0, 0.68333, 0.11111, 0, 0.76666],
    934: [0, 0.68333, 0.05986, 0, 0.71555],
    936: [0, 0.68333, 0.11111, 0, 0.76666],
    937: [0, 0.68333, 0.10257, 0, 0.71555],
    8211: [0, 0.43056, 0.09208, 0, 0.51111],
    8212: [0, 0.43056, 0.09208, 0, 1.02222],
    8216: [0, 0.69444, 0.12417, 0, 0.30667],
    8217: [0, 0.69444, 0.12417, 0, 0.30667],
    8220: [0, 0.69444, 0.1685, 0, 0.51444],
    8221: [0, 0.69444, 0.06961, 0, 0.51444],
    8463: [0, 0.68889, 0, 0, 0.54028]
  },
  "Main-Regular": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0, 0, 0.27778],
    34: [0, 0.69444, 0, 0, 0.5],
    35: [0.19444, 0.69444, 0, 0, 0.83334],
    36: [0.05556, 0.75, 0, 0, 0.5],
    37: [0.05556, 0.75, 0, 0, 0.83334],
    38: [0, 0.69444, 0, 0, 0.77778],
    39: [0, 0.69444, 0, 0, 0.27778],
    40: [0.25, 0.75, 0, 0, 0.38889],
    41: [0.25, 0.75, 0, 0, 0.38889],
    42: [0, 0.75, 0, 0, 0.5],
    43: [0.08333, 0.58333, 0, 0, 0.77778],
    44: [0.19444, 0.10556, 0, 0, 0.27778],
    45: [0, 0.43056, 0, 0, 0.33333],
    46: [0, 0.10556, 0, 0, 0.27778],
    47: [0.25, 0.75, 0, 0, 0.5],
    48: [0, 0.64444, 0, 0, 0.5],
    49: [0, 0.64444, 0, 0, 0.5],
    50: [0, 0.64444, 0, 0, 0.5],
    51: [0, 0.64444, 0, 0, 0.5],
    52: [0, 0.64444, 0, 0, 0.5],
    53: [0, 0.64444, 0, 0, 0.5],
    54: [0, 0.64444, 0, 0, 0.5],
    55: [0, 0.64444, 0, 0, 0.5],
    56: [0, 0.64444, 0, 0, 0.5],
    57: [0, 0.64444, 0, 0, 0.5],
    58: [0, 0.43056, 0, 0, 0.27778],
    59: [0.19444, 0.43056, 0, 0, 0.27778],
    60: [0.0391, 0.5391, 0, 0, 0.77778],
    61: [-0.13313, 0.36687, 0, 0, 0.77778],
    62: [0.0391, 0.5391, 0, 0, 0.77778],
    63: [0, 0.69444, 0, 0, 0.47222],
    64: [0, 0.69444, 0, 0, 0.77778],
    65: [0, 0.68333, 0, 0, 0.75],
    66: [0, 0.68333, 0, 0, 0.70834],
    67: [0, 0.68333, 0, 0, 0.72222],
    68: [0, 0.68333, 0, 0, 0.76389],
    69: [0, 0.68333, 0, 0, 0.68056],
    70: [0, 0.68333, 0, 0, 0.65278],
    71: [0, 0.68333, 0, 0, 0.78472],
    72: [0, 0.68333, 0, 0, 0.75],
    73: [0, 0.68333, 0, 0, 0.36111],
    74: [0, 0.68333, 0, 0, 0.51389],
    75: [0, 0.68333, 0, 0, 0.77778],
    76: [0, 0.68333, 0, 0, 0.625],
    77: [0, 0.68333, 0, 0, 0.91667],
    78: [0, 0.68333, 0, 0, 0.75],
    79: [0, 0.68333, 0, 0, 0.77778],
    80: [0, 0.68333, 0, 0, 0.68056],
    81: [0.19444, 0.68333, 0, 0, 0.77778],
    82: [0, 0.68333, 0, 0, 0.73611],
    83: [0, 0.68333, 0, 0, 0.55556],
    84: [0, 0.68333, 0, 0, 0.72222],
    85: [0, 0.68333, 0, 0, 0.75],
    86: [0, 0.68333, 0.01389, 0, 0.75],
    87: [0, 0.68333, 0.01389, 0, 1.02778],
    88: [0, 0.68333, 0, 0, 0.75],
    89: [0, 0.68333, 0.025, 0, 0.75],
    90: [0, 0.68333, 0, 0, 0.61111],
    91: [0.25, 0.75, 0, 0, 0.27778],
    92: [0.25, 0.75, 0, 0, 0.5],
    93: [0.25, 0.75, 0, 0, 0.27778],
    94: [0, 0.69444, 0, 0, 0.5],
    95: [0.31, 0.12056, 0.02778, 0, 0.5],
    97: [0, 0.43056, 0, 0, 0.5],
    98: [0, 0.69444, 0, 0, 0.55556],
    99: [0, 0.43056, 0, 0, 0.44445],
    100: [0, 0.69444, 0, 0, 0.55556],
    101: [0, 0.43056, 0, 0, 0.44445],
    102: [0, 0.69444, 0.07778, 0, 0.30556],
    103: [0.19444, 0.43056, 0.01389, 0, 0.5],
    104: [0, 0.69444, 0, 0, 0.55556],
    105: [0, 0.66786, 0, 0, 0.27778],
    106: [0.19444, 0.66786, 0, 0, 0.30556],
    107: [0, 0.69444, 0, 0, 0.52778],
    108: [0, 0.69444, 0, 0, 0.27778],
    109: [0, 0.43056, 0, 0, 0.83334],
    110: [0, 0.43056, 0, 0, 0.55556],
    111: [0, 0.43056, 0, 0, 0.5],
    112: [0.19444, 0.43056, 0, 0, 0.55556],
    113: [0.19444, 0.43056, 0, 0, 0.52778],
    114: [0, 0.43056, 0, 0, 0.39167],
    115: [0, 0.43056, 0, 0, 0.39445],
    116: [0, 0.61508, 0, 0, 0.38889],
    117: [0, 0.43056, 0, 0, 0.55556],
    118: [0, 0.43056, 0.01389, 0, 0.52778],
    119: [0, 0.43056, 0.01389, 0, 0.72222],
    120: [0, 0.43056, 0, 0, 0.52778],
    121: [0.19444, 0.43056, 0.01389, 0, 0.52778],
    122: [0, 0.43056, 0, 0, 0.44445],
    123: [0.25, 0.75, 0, 0, 0.5],
    124: [0.25, 0.75, 0, 0, 0.27778],
    125: [0.25, 0.75, 0, 0, 0.5],
    126: [0.35, 0.31786, 0, 0, 0.5],
    160: [0, 0, 0, 0, 0.25],
    163: [0, 0.69444, 0, 0, 0.76909],
    167: [0.19444, 0.69444, 0, 0, 0.44445],
    168: [0, 0.66786, 0, 0, 0.5],
    172: [0, 0.43056, 0, 0, 0.66667],
    176: [0, 0.69444, 0, 0, 0.75],
    177: [0.08333, 0.58333, 0, 0, 0.77778],
    182: [0.19444, 0.69444, 0, 0, 0.61111],
    184: [0.17014, 0, 0, 0, 0.44445],
    198: [0, 0.68333, 0, 0, 0.90278],
    215: [0.08333, 0.58333, 0, 0, 0.77778],
    216: [0.04861, 0.73194, 0, 0, 0.77778],
    223: [0, 0.69444, 0, 0, 0.5],
    230: [0, 0.43056, 0, 0, 0.72222],
    247: [0.08333, 0.58333, 0, 0, 0.77778],
    248: [0.09722, 0.52778, 0, 0, 0.5],
    305: [0, 0.43056, 0, 0, 0.27778],
    338: [0, 0.68333, 0, 0, 1.01389],
    339: [0, 0.43056, 0, 0, 0.77778],
    567: [0.19444, 0.43056, 0, 0, 0.30556],
    710: [0, 0.69444, 0, 0, 0.5],
    711: [0, 0.62847, 0, 0, 0.5],
    713: [0, 0.56778, 0, 0, 0.5],
    714: [0, 0.69444, 0, 0, 0.5],
    715: [0, 0.69444, 0, 0, 0.5],
    728: [0, 0.69444, 0, 0, 0.5],
    729: [0, 0.66786, 0, 0, 0.27778],
    730: [0, 0.69444, 0, 0, 0.75],
    732: [0, 0.66786, 0, 0, 0.5],
    733: [0, 0.69444, 0, 0, 0.5],
    915: [0, 0.68333, 0, 0, 0.625],
    916: [0, 0.68333, 0, 0, 0.83334],
    920: [0, 0.68333, 0, 0, 0.77778],
    923: [0, 0.68333, 0, 0, 0.69445],
    926: [0, 0.68333, 0, 0, 0.66667],
    928: [0, 0.68333, 0, 0, 0.75],
    931: [0, 0.68333, 0, 0, 0.72222],
    933: [0, 0.68333, 0, 0, 0.77778],
    934: [0, 0.68333, 0, 0, 0.72222],
    936: [0, 0.68333, 0, 0, 0.77778],
    937: [0, 0.68333, 0, 0, 0.72222],
    8211: [0, 0.43056, 0.02778, 0, 0.5],
    8212: [0, 0.43056, 0.02778, 0, 1],
    8216: [0, 0.69444, 0, 0, 0.27778],
    8217: [0, 0.69444, 0, 0, 0.27778],
    8220: [0, 0.69444, 0, 0, 0.5],
    8221: [0, 0.69444, 0, 0, 0.5],
    8224: [0.19444, 0.69444, 0, 0, 0.44445],
    8225: [0.19444, 0.69444, 0, 0, 0.44445],
    8230: [0, 0.123, 0, 0, 1.172],
    8242: [0, 0.55556, 0, 0, 0.275],
    8407: [0, 0.71444, 0.15382, 0, 0.5],
    8463: [0, 0.68889, 0, 0, 0.54028],
    8465: [0, 0.69444, 0, 0, 0.72222],
    8467: [0, 0.69444, 0, 0.11111, 0.41667],
    8472: [0.19444, 0.43056, 0, 0.11111, 0.63646],
    8476: [0, 0.69444, 0, 0, 0.72222],
    8501: [0, 0.69444, 0, 0, 0.61111],
    8592: [-0.13313, 0.36687, 0, 0, 1],
    8593: [0.19444, 0.69444, 0, 0, 0.5],
    8594: [-0.13313, 0.36687, 0, 0, 1],
    8595: [0.19444, 0.69444, 0, 0, 0.5],
    8596: [-0.13313, 0.36687, 0, 0, 1],
    8597: [0.25, 0.75, 0, 0, 0.5],
    8598: [0.19444, 0.69444, 0, 0, 1],
    8599: [0.19444, 0.69444, 0, 0, 1],
    8600: [0.19444, 0.69444, 0, 0, 1],
    8601: [0.19444, 0.69444, 0, 0, 1],
    8614: [0.011, 0.511, 0, 0, 1],
    8617: [0.011, 0.511, 0, 0, 1.126],
    8618: [0.011, 0.511, 0, 0, 1.126],
    8636: [-0.13313, 0.36687, 0, 0, 1],
    8637: [-0.13313, 0.36687, 0, 0, 1],
    8640: [-0.13313, 0.36687, 0, 0, 1],
    8641: [-0.13313, 0.36687, 0, 0, 1],
    8652: [0.011, 0.671, 0, 0, 1],
    8656: [-0.13313, 0.36687, 0, 0, 1],
    8657: [0.19444, 0.69444, 0, 0, 0.61111],
    8658: [-0.13313, 0.36687, 0, 0, 1],
    8659: [0.19444, 0.69444, 0, 0, 0.61111],
    8660: [-0.13313, 0.36687, 0, 0, 1],
    8661: [0.25, 0.75, 0, 0, 0.61111],
    8704: [0, 0.69444, 0, 0, 0.55556],
    8706: [0, 0.69444, 0.05556, 0.08334, 0.5309],
    8707: [0, 0.69444, 0, 0, 0.55556],
    8709: [0.05556, 0.75, 0, 0, 0.5],
    8711: [0, 0.68333, 0, 0, 0.83334],
    8712: [0.0391, 0.5391, 0, 0, 0.66667],
    8715: [0.0391, 0.5391, 0, 0, 0.66667],
    8722: [0.08333, 0.58333, 0, 0, 0.77778],
    8723: [0.08333, 0.58333, 0, 0, 0.77778],
    8725: [0.25, 0.75, 0, 0, 0.5],
    8726: [0.25, 0.75, 0, 0, 0.5],
    8727: [-0.03472, 0.46528, 0, 0, 0.5],
    8728: [-0.05555, 0.44445, 0, 0, 0.5],
    8729: [-0.05555, 0.44445, 0, 0, 0.5],
    8730: [0.2, 0.8, 0, 0, 0.83334],
    8733: [0, 0.43056, 0, 0, 0.77778],
    8734: [0, 0.43056, 0, 0, 1],
    8736: [0, 0.69224, 0, 0, 0.72222],
    8739: [0.25, 0.75, 0, 0, 0.27778],
    8741: [0.25, 0.75, 0, 0, 0.5],
    8743: [0, 0.55556, 0, 0, 0.66667],
    8744: [0, 0.55556, 0, 0, 0.66667],
    8745: [0, 0.55556, 0, 0, 0.66667],
    8746: [0, 0.55556, 0, 0, 0.66667],
    8747: [0.19444, 0.69444, 0.11111, 0, 0.41667],
    8764: [-0.13313, 0.36687, 0, 0, 0.77778],
    8768: [0.19444, 0.69444, 0, 0, 0.27778],
    8771: [-0.03625, 0.46375, 0, 0, 0.77778],
    8773: [-0.022, 0.589, 0, 0, 0.778],
    8776: [-0.01688, 0.48312, 0, 0, 0.77778],
    8781: [-0.03625, 0.46375, 0, 0, 0.77778],
    8784: [-0.133, 0.673, 0, 0, 0.778],
    8801: [-0.03625, 0.46375, 0, 0, 0.77778],
    8804: [0.13597, 0.63597, 0, 0, 0.77778],
    8805: [0.13597, 0.63597, 0, 0, 0.77778],
    8810: [0.0391, 0.5391, 0, 0, 1],
    8811: [0.0391, 0.5391, 0, 0, 1],
    8826: [0.0391, 0.5391, 0, 0, 0.77778],
    8827: [0.0391, 0.5391, 0, 0, 0.77778],
    8834: [0.0391, 0.5391, 0, 0, 0.77778],
    8835: [0.0391, 0.5391, 0, 0, 0.77778],
    8838: [0.13597, 0.63597, 0, 0, 0.77778],
    8839: [0.13597, 0.63597, 0, 0, 0.77778],
    8846: [0, 0.55556, 0, 0, 0.66667],
    8849: [0.13597, 0.63597, 0, 0, 0.77778],
    8850: [0.13597, 0.63597, 0, 0, 0.77778],
    8851: [0, 0.55556, 0, 0, 0.66667],
    8852: [0, 0.55556, 0, 0, 0.66667],
    8853: [0.08333, 0.58333, 0, 0, 0.77778],
    8854: [0.08333, 0.58333, 0, 0, 0.77778],
    8855: [0.08333, 0.58333, 0, 0, 0.77778],
    8856: [0.08333, 0.58333, 0, 0, 0.77778],
    8857: [0.08333, 0.58333, 0, 0, 0.77778],
    8866: [0, 0.69444, 0, 0, 0.61111],
    8867: [0, 0.69444, 0, 0, 0.61111],
    8868: [0, 0.69444, 0, 0, 0.77778],
    8869: [0, 0.69444, 0, 0, 0.77778],
    8872: [0.249, 0.75, 0, 0, 0.867],
    8900: [-0.05555, 0.44445, 0, 0, 0.5],
    8901: [-0.05555, 0.44445, 0, 0, 0.27778],
    8902: [-0.03472, 0.46528, 0, 0, 0.5],
    8904: [5e-3, 0.505, 0, 0, 0.9],
    8942: [0.03, 0.903, 0, 0, 0.278],
    8943: [-0.19, 0.313, 0, 0, 1.172],
    8945: [-0.1, 0.823, 0, 0, 1.282],
    8968: [0.25, 0.75, 0, 0, 0.44445],
    8969: [0.25, 0.75, 0, 0, 0.44445],
    8970: [0.25, 0.75, 0, 0, 0.44445],
    8971: [0.25, 0.75, 0, 0, 0.44445],
    8994: [-0.14236, 0.35764, 0, 0, 1],
    8995: [-0.14236, 0.35764, 0, 0, 1],
    9136: [0.244, 0.744, 0, 0, 0.412],
    9137: [0.244, 0.745, 0, 0, 0.412],
    9651: [0.19444, 0.69444, 0, 0, 0.88889],
    9657: [-0.03472, 0.46528, 0, 0, 0.5],
    9661: [0.19444, 0.69444, 0, 0, 0.88889],
    9667: [-0.03472, 0.46528, 0, 0, 0.5],
    9711: [0.19444, 0.69444, 0, 0, 1],
    9824: [0.12963, 0.69444, 0, 0, 0.77778],
    9825: [0.12963, 0.69444, 0, 0, 0.77778],
    9826: [0.12963, 0.69444, 0, 0, 0.77778],
    9827: [0.12963, 0.69444, 0, 0, 0.77778],
    9837: [0, 0.75, 0, 0, 0.38889],
    9838: [0.19444, 0.69444, 0, 0, 0.38889],
    9839: [0.19444, 0.69444, 0, 0, 0.38889],
    10216: [0.25, 0.75, 0, 0, 0.38889],
    10217: [0.25, 0.75, 0, 0, 0.38889],
    10222: [0.244, 0.744, 0, 0, 0.412],
    10223: [0.244, 0.745, 0, 0, 0.412],
    10229: [0.011, 0.511, 0, 0, 1.609],
    10230: [0.011, 0.511, 0, 0, 1.638],
    10231: [0.011, 0.511, 0, 0, 1.859],
    10232: [0.024, 0.525, 0, 0, 1.609],
    10233: [0.024, 0.525, 0, 0, 1.638],
    10234: [0.024, 0.525, 0, 0, 1.858],
    10236: [0.011, 0.511, 0, 0, 1.638],
    10815: [0, 0.68333, 0, 0, 0.75],
    10927: [0.13597, 0.63597, 0, 0, 0.77778],
    10928: [0.13597, 0.63597, 0, 0, 0.77778],
    57376: [0.19444, 0.69444, 0, 0, 0]
  },
  "Math-BoldItalic": {
    32: [0, 0, 0, 0, 0.25],
    48: [0, 0.44444, 0, 0, 0.575],
    49: [0, 0.44444, 0, 0, 0.575],
    50: [0, 0.44444, 0, 0, 0.575],
    51: [0.19444, 0.44444, 0, 0, 0.575],
    52: [0.19444, 0.44444, 0, 0, 0.575],
    53: [0.19444, 0.44444, 0, 0, 0.575],
    54: [0, 0.64444, 0, 0, 0.575],
    55: [0.19444, 0.44444, 0, 0, 0.575],
    56: [0, 0.64444, 0, 0, 0.575],
    57: [0.19444, 0.44444, 0, 0, 0.575],
    65: [0, 0.68611, 0, 0, 0.86944],
    66: [0, 0.68611, 0.04835, 0, 0.8664],
    67: [0, 0.68611, 0.06979, 0, 0.81694],
    68: [0, 0.68611, 0.03194, 0, 0.93812],
    69: [0, 0.68611, 0.05451, 0, 0.81007],
    70: [0, 0.68611, 0.15972, 0, 0.68889],
    71: [0, 0.68611, 0, 0, 0.88673],
    72: [0, 0.68611, 0.08229, 0, 0.98229],
    73: [0, 0.68611, 0.07778, 0, 0.51111],
    74: [0, 0.68611, 0.10069, 0, 0.63125],
    75: [0, 0.68611, 0.06979, 0, 0.97118],
    76: [0, 0.68611, 0, 0, 0.75555],
    77: [0, 0.68611, 0.11424, 0, 1.14201],
    78: [0, 0.68611, 0.11424, 0, 0.95034],
    79: [0, 0.68611, 0.03194, 0, 0.83666],
    80: [0, 0.68611, 0.15972, 0, 0.72309],
    81: [0.19444, 0.68611, 0, 0, 0.86861],
    82: [0, 0.68611, 421e-5, 0, 0.87235],
    83: [0, 0.68611, 0.05382, 0, 0.69271],
    84: [0, 0.68611, 0.15972, 0, 0.63663],
    85: [0, 0.68611, 0.11424, 0, 0.80027],
    86: [0, 0.68611, 0.25555, 0, 0.67778],
    87: [0, 0.68611, 0.15972, 0, 1.09305],
    88: [0, 0.68611, 0.07778, 0, 0.94722],
    89: [0, 0.68611, 0.25555, 0, 0.67458],
    90: [0, 0.68611, 0.06979, 0, 0.77257],
    97: [0, 0.44444, 0, 0, 0.63287],
    98: [0, 0.69444, 0, 0, 0.52083],
    99: [0, 0.44444, 0, 0, 0.51342],
    100: [0, 0.69444, 0, 0, 0.60972],
    101: [0, 0.44444, 0, 0, 0.55361],
    102: [0.19444, 0.69444, 0.11042, 0, 0.56806],
    103: [0.19444, 0.44444, 0.03704, 0, 0.5449],
    104: [0, 0.69444, 0, 0, 0.66759],
    105: [0, 0.69326, 0, 0, 0.4048],
    106: [0.19444, 0.69326, 0.0622, 0, 0.47083],
    107: [0, 0.69444, 0.01852, 0, 0.6037],
    108: [0, 0.69444, 88e-4, 0, 0.34815],
    109: [0, 0.44444, 0, 0, 1.0324],
    110: [0, 0.44444, 0, 0, 0.71296],
    111: [0, 0.44444, 0, 0, 0.58472],
    112: [0.19444, 0.44444, 0, 0, 0.60092],
    113: [0.19444, 0.44444, 0.03704, 0, 0.54213],
    114: [0, 0.44444, 0.03194, 0, 0.5287],
    115: [0, 0.44444, 0, 0, 0.53125],
    116: [0, 0.63492, 0, 0, 0.41528],
    117: [0, 0.44444, 0, 0, 0.68102],
    118: [0, 0.44444, 0.03704, 0, 0.56666],
    119: [0, 0.44444, 0.02778, 0, 0.83148],
    120: [0, 0.44444, 0, 0, 0.65903],
    121: [0.19444, 0.44444, 0.03704, 0, 0.59028],
    122: [0, 0.44444, 0.04213, 0, 0.55509],
    160: [0, 0, 0, 0, 0.25],
    915: [0, 0.68611, 0.15972, 0, 0.65694],
    916: [0, 0.68611, 0, 0, 0.95833],
    920: [0, 0.68611, 0.03194, 0, 0.86722],
    923: [0, 0.68611, 0, 0, 0.80555],
    926: [0, 0.68611, 0.07458, 0, 0.84125],
    928: [0, 0.68611, 0.08229, 0, 0.98229],
    931: [0, 0.68611, 0.05451, 0, 0.88507],
    933: [0, 0.68611, 0.15972, 0, 0.67083],
    934: [0, 0.68611, 0, 0, 0.76666],
    936: [0, 0.68611, 0.11653, 0, 0.71402],
    937: [0, 0.68611, 0.04835, 0, 0.8789],
    945: [0, 0.44444, 0, 0, 0.76064],
    946: [0.19444, 0.69444, 0.03403, 0, 0.65972],
    947: [0.19444, 0.44444, 0.06389, 0, 0.59003],
    948: [0, 0.69444, 0.03819, 0, 0.52222],
    949: [0, 0.44444, 0, 0, 0.52882],
    950: [0.19444, 0.69444, 0.06215, 0, 0.50833],
    951: [0.19444, 0.44444, 0.03704, 0, 0.6],
    952: [0, 0.69444, 0.03194, 0, 0.5618],
    953: [0, 0.44444, 0, 0, 0.41204],
    954: [0, 0.44444, 0, 0, 0.66759],
    955: [0, 0.69444, 0, 0, 0.67083],
    956: [0.19444, 0.44444, 0, 0, 0.70787],
    957: [0, 0.44444, 0.06898, 0, 0.57685],
    958: [0.19444, 0.69444, 0.03021, 0, 0.50833],
    959: [0, 0.44444, 0, 0, 0.58472],
    960: [0, 0.44444, 0.03704, 0, 0.68241],
    961: [0.19444, 0.44444, 0, 0, 0.6118],
    962: [0.09722, 0.44444, 0.07917, 0, 0.42361],
    963: [0, 0.44444, 0.03704, 0, 0.68588],
    964: [0, 0.44444, 0.13472, 0, 0.52083],
    965: [0, 0.44444, 0.03704, 0, 0.63055],
    966: [0.19444, 0.44444, 0, 0, 0.74722],
    967: [0.19444, 0.44444, 0, 0, 0.71805],
    968: [0.19444, 0.69444, 0.03704, 0, 0.75833],
    969: [0, 0.44444, 0.03704, 0, 0.71782],
    977: [0, 0.69444, 0, 0, 0.69155],
    981: [0.19444, 0.69444, 0, 0, 0.7125],
    982: [0, 0.44444, 0.03194, 0, 0.975],
    1009: [0.19444, 0.44444, 0, 0, 0.6118],
    1013: [0, 0.44444, 0, 0, 0.48333],
    57649: [0, 0.44444, 0, 0, 0.39352],
    57911: [0.19444, 0.44444, 0, 0, 0.43889]
  },
  "Math-Italic": {
    32: [0, 0, 0, 0, 0.25],
    48: [0, 0.43056, 0, 0, 0.5],
    49: [0, 0.43056, 0, 0, 0.5],
    50: [0, 0.43056, 0, 0, 0.5],
    51: [0.19444, 0.43056, 0, 0, 0.5],
    52: [0.19444, 0.43056, 0, 0, 0.5],
    53: [0.19444, 0.43056, 0, 0, 0.5],
    54: [0, 0.64444, 0, 0, 0.5],
    55: [0.19444, 0.43056, 0, 0, 0.5],
    56: [0, 0.64444, 0, 0, 0.5],
    57: [0.19444, 0.43056, 0, 0, 0.5],
    65: [0, 0.68333, 0, 0.13889, 0.75],
    66: [0, 0.68333, 0.05017, 0.08334, 0.75851],
    67: [0, 0.68333, 0.07153, 0.08334, 0.71472],
    68: [0, 0.68333, 0.02778, 0.05556, 0.82792],
    69: [0, 0.68333, 0.05764, 0.08334, 0.7382],
    70: [0, 0.68333, 0.13889, 0.08334, 0.64306],
    71: [0, 0.68333, 0, 0.08334, 0.78625],
    72: [0, 0.68333, 0.08125, 0.05556, 0.83125],
    73: [0, 0.68333, 0.07847, 0.11111, 0.43958],
    74: [0, 0.68333, 0.09618, 0.16667, 0.55451],
    75: [0, 0.68333, 0.07153, 0.05556, 0.84931],
    76: [0, 0.68333, 0, 0.02778, 0.68056],
    77: [0, 0.68333, 0.10903, 0.08334, 0.97014],
    78: [0, 0.68333, 0.10903, 0.08334, 0.80347],
    79: [0, 0.68333, 0.02778, 0.08334, 0.76278],
    80: [0, 0.68333, 0.13889, 0.08334, 0.64201],
    81: [0.19444, 0.68333, 0, 0.08334, 0.79056],
    82: [0, 0.68333, 773e-5, 0.08334, 0.75929],
    83: [0, 0.68333, 0.05764, 0.08334, 0.6132],
    84: [0, 0.68333, 0.13889, 0.08334, 0.58438],
    85: [0, 0.68333, 0.10903, 0.02778, 0.68278],
    86: [0, 0.68333, 0.22222, 0, 0.58333],
    87: [0, 0.68333, 0.13889, 0, 0.94445],
    88: [0, 0.68333, 0.07847, 0.08334, 0.82847],
    89: [0, 0.68333, 0.22222, 0, 0.58056],
    90: [0, 0.68333, 0.07153, 0.08334, 0.68264],
    97: [0, 0.43056, 0, 0, 0.52859],
    98: [0, 0.69444, 0, 0, 0.42917],
    99: [0, 0.43056, 0, 0.05556, 0.43276],
    100: [0, 0.69444, 0, 0.16667, 0.52049],
    101: [0, 0.43056, 0, 0.05556, 0.46563],
    102: [0.19444, 0.69444, 0.10764, 0.16667, 0.48959],
    103: [0.19444, 0.43056, 0.03588, 0.02778, 0.47697],
    104: [0, 0.69444, 0, 0, 0.57616],
    105: [0, 0.65952, 0, 0, 0.34451],
    106: [0.19444, 0.65952, 0.05724, 0, 0.41181],
    107: [0, 0.69444, 0.03148, 0, 0.5206],
    108: [0, 0.69444, 0.01968, 0.08334, 0.29838],
    109: [0, 0.43056, 0, 0, 0.87801],
    110: [0, 0.43056, 0, 0, 0.60023],
    111: [0, 0.43056, 0, 0.05556, 0.48472],
    112: [0.19444, 0.43056, 0, 0.08334, 0.50313],
    113: [0.19444, 0.43056, 0.03588, 0.08334, 0.44641],
    114: [0, 0.43056, 0.02778, 0.05556, 0.45116],
    115: [0, 0.43056, 0, 0.05556, 0.46875],
    116: [0, 0.61508, 0, 0.08334, 0.36111],
    117: [0, 0.43056, 0, 0.02778, 0.57246],
    118: [0, 0.43056, 0.03588, 0.02778, 0.48472],
    119: [0, 0.43056, 0.02691, 0.08334, 0.71592],
    120: [0, 0.43056, 0, 0.02778, 0.57153],
    121: [0.19444, 0.43056, 0.03588, 0.05556, 0.49028],
    122: [0, 0.43056, 0.04398, 0.05556, 0.46505],
    160: [0, 0, 0, 0, 0.25],
    915: [0, 0.68333, 0.13889, 0.08334, 0.61528],
    916: [0, 0.68333, 0, 0.16667, 0.83334],
    920: [0, 0.68333, 0.02778, 0.08334, 0.76278],
    923: [0, 0.68333, 0, 0.16667, 0.69445],
    926: [0, 0.68333, 0.07569, 0.08334, 0.74236],
    928: [0, 0.68333, 0.08125, 0.05556, 0.83125],
    931: [0, 0.68333, 0.05764, 0.08334, 0.77986],
    933: [0, 0.68333, 0.13889, 0.05556, 0.58333],
    934: [0, 0.68333, 0, 0.08334, 0.66667],
    936: [0, 0.68333, 0.11, 0.05556, 0.61222],
    937: [0, 0.68333, 0.05017, 0.08334, 0.7724],
    945: [0, 0.43056, 37e-4, 0.02778, 0.6397],
    946: [0.19444, 0.69444, 0.05278, 0.08334, 0.56563],
    947: [0.19444, 0.43056, 0.05556, 0, 0.51773],
    948: [0, 0.69444, 0.03785, 0.05556, 0.44444],
    949: [0, 0.43056, 0, 0.08334, 0.46632],
    950: [0.19444, 0.69444, 0.07378, 0.08334, 0.4375],
    951: [0.19444, 0.43056, 0.03588, 0.05556, 0.49653],
    952: [0, 0.69444, 0.02778, 0.08334, 0.46944],
    953: [0, 0.43056, 0, 0.05556, 0.35394],
    954: [0, 0.43056, 0, 0, 0.57616],
    955: [0, 0.69444, 0, 0, 0.58334],
    956: [0.19444, 0.43056, 0, 0.02778, 0.60255],
    957: [0, 0.43056, 0.06366, 0.02778, 0.49398],
    958: [0.19444, 0.69444, 0.04601, 0.11111, 0.4375],
    959: [0, 0.43056, 0, 0.05556, 0.48472],
    960: [0, 0.43056, 0.03588, 0, 0.57003],
    961: [0.19444, 0.43056, 0, 0.08334, 0.51702],
    962: [0.09722, 0.43056, 0.07986, 0.08334, 0.36285],
    963: [0, 0.43056, 0.03588, 0, 0.57141],
    964: [0, 0.43056, 0.1132, 0.02778, 0.43715],
    965: [0, 0.43056, 0.03588, 0.02778, 0.54028],
    966: [0.19444, 0.43056, 0, 0.08334, 0.65417],
    967: [0.19444, 0.43056, 0, 0.05556, 0.62569],
    968: [0.19444, 0.69444, 0.03588, 0.11111, 0.65139],
    969: [0, 0.43056, 0.03588, 0, 0.62245],
    977: [0, 0.69444, 0, 0.08334, 0.59144],
    981: [0.19444, 0.69444, 0, 0.08334, 0.59583],
    982: [0, 0.43056, 0.02778, 0, 0.82813],
    1009: [0.19444, 0.43056, 0, 0.08334, 0.51702],
    1013: [0, 0.43056, 0, 0.05556, 0.4059],
    57649: [0, 0.43056, 0, 0.02778, 0.32246],
    57911: [0.19444, 0.43056, 0, 0.08334, 0.38403]
  },
  "SansSerif-Bold": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0, 0, 0.36667],
    34: [0, 0.69444, 0, 0, 0.55834],
    35: [0.19444, 0.69444, 0, 0, 0.91667],
    36: [0.05556, 0.75, 0, 0, 0.55],
    37: [0.05556, 0.75, 0, 0, 1.02912],
    38: [0, 0.69444, 0, 0, 0.83056],
    39: [0, 0.69444, 0, 0, 0.30556],
    40: [0.25, 0.75, 0, 0, 0.42778],
    41: [0.25, 0.75, 0, 0, 0.42778],
    42: [0, 0.75, 0, 0, 0.55],
    43: [0.11667, 0.61667, 0, 0, 0.85556],
    44: [0.10556, 0.13056, 0, 0, 0.30556],
    45: [0, 0.45833, 0, 0, 0.36667],
    46: [0, 0.13056, 0, 0, 0.30556],
    47: [0.25, 0.75, 0, 0, 0.55],
    48: [0, 0.69444, 0, 0, 0.55],
    49: [0, 0.69444, 0, 0, 0.55],
    50: [0, 0.69444, 0, 0, 0.55],
    51: [0, 0.69444, 0, 0, 0.55],
    52: [0, 0.69444, 0, 0, 0.55],
    53: [0, 0.69444, 0, 0, 0.55],
    54: [0, 0.69444, 0, 0, 0.55],
    55: [0, 0.69444, 0, 0, 0.55],
    56: [0, 0.69444, 0, 0, 0.55],
    57: [0, 0.69444, 0, 0, 0.55],
    58: [0, 0.45833, 0, 0, 0.30556],
    59: [0.10556, 0.45833, 0, 0, 0.30556],
    61: [-0.09375, 0.40625, 0, 0, 0.85556],
    63: [0, 0.69444, 0, 0, 0.51945],
    64: [0, 0.69444, 0, 0, 0.73334],
    65: [0, 0.69444, 0, 0, 0.73334],
    66: [0, 0.69444, 0, 0, 0.73334],
    67: [0, 0.69444, 0, 0, 0.70278],
    68: [0, 0.69444, 0, 0, 0.79445],
    69: [0, 0.69444, 0, 0, 0.64167],
    70: [0, 0.69444, 0, 0, 0.61111],
    71: [0, 0.69444, 0, 0, 0.73334],
    72: [0, 0.69444, 0, 0, 0.79445],
    73: [0, 0.69444, 0, 0, 0.33056],
    74: [0, 0.69444, 0, 0, 0.51945],
    75: [0, 0.69444, 0, 0, 0.76389],
    76: [0, 0.69444, 0, 0, 0.58056],
    77: [0, 0.69444, 0, 0, 0.97778],
    78: [0, 0.69444, 0, 0, 0.79445],
    79: [0, 0.69444, 0, 0, 0.79445],
    80: [0, 0.69444, 0, 0, 0.70278],
    81: [0.10556, 0.69444, 0, 0, 0.79445],
    82: [0, 0.69444, 0, 0, 0.70278],
    83: [0, 0.69444, 0, 0, 0.61111],
    84: [0, 0.69444, 0, 0, 0.73334],
    85: [0, 0.69444, 0, 0, 0.76389],
    86: [0, 0.69444, 0.01528, 0, 0.73334],
    87: [0, 0.69444, 0.01528, 0, 1.03889],
    88: [0, 0.69444, 0, 0, 0.73334],
    89: [0, 0.69444, 0.0275, 0, 0.73334],
    90: [0, 0.69444, 0, 0, 0.67223],
    91: [0.25, 0.75, 0, 0, 0.34306],
    93: [0.25, 0.75, 0, 0, 0.34306],
    94: [0, 0.69444, 0, 0, 0.55],
    95: [0.35, 0.10833, 0.03056, 0, 0.55],
    97: [0, 0.45833, 0, 0, 0.525],
    98: [0, 0.69444, 0, 0, 0.56111],
    99: [0, 0.45833, 0, 0, 0.48889],
    100: [0, 0.69444, 0, 0, 0.56111],
    101: [0, 0.45833, 0, 0, 0.51111],
    102: [0, 0.69444, 0.07639, 0, 0.33611],
    103: [0.19444, 0.45833, 0.01528, 0, 0.55],
    104: [0, 0.69444, 0, 0, 0.56111],
    105: [0, 0.69444, 0, 0, 0.25556],
    106: [0.19444, 0.69444, 0, 0, 0.28611],
    107: [0, 0.69444, 0, 0, 0.53056],
    108: [0, 0.69444, 0, 0, 0.25556],
    109: [0, 0.45833, 0, 0, 0.86667],
    110: [0, 0.45833, 0, 0, 0.56111],
    111: [0, 0.45833, 0, 0, 0.55],
    112: [0.19444, 0.45833, 0, 0, 0.56111],
    113: [0.19444, 0.45833, 0, 0, 0.56111],
    114: [0, 0.45833, 0.01528, 0, 0.37222],
    115: [0, 0.45833, 0, 0, 0.42167],
    116: [0, 0.58929, 0, 0, 0.40417],
    117: [0, 0.45833, 0, 0, 0.56111],
    118: [0, 0.45833, 0.01528, 0, 0.5],
    119: [0, 0.45833, 0.01528, 0, 0.74445],
    120: [0, 0.45833, 0, 0, 0.5],
    121: [0.19444, 0.45833, 0.01528, 0, 0.5],
    122: [0, 0.45833, 0, 0, 0.47639],
    126: [0.35, 0.34444, 0, 0, 0.55],
    160: [0, 0, 0, 0, 0.25],
    168: [0, 0.69444, 0, 0, 0.55],
    176: [0, 0.69444, 0, 0, 0.73334],
    180: [0, 0.69444, 0, 0, 0.55],
    184: [0.17014, 0, 0, 0, 0.48889],
    305: [0, 0.45833, 0, 0, 0.25556],
    567: [0.19444, 0.45833, 0, 0, 0.28611],
    710: [0, 0.69444, 0, 0, 0.55],
    711: [0, 0.63542, 0, 0, 0.55],
    713: [0, 0.63778, 0, 0, 0.55],
    728: [0, 0.69444, 0, 0, 0.55],
    729: [0, 0.69444, 0, 0, 0.30556],
    730: [0, 0.69444, 0, 0, 0.73334],
    732: [0, 0.69444, 0, 0, 0.55],
    733: [0, 0.69444, 0, 0, 0.55],
    915: [0, 0.69444, 0, 0, 0.58056],
    916: [0, 0.69444, 0, 0, 0.91667],
    920: [0, 0.69444, 0, 0, 0.85556],
    923: [0, 0.69444, 0, 0, 0.67223],
    926: [0, 0.69444, 0, 0, 0.73334],
    928: [0, 0.69444, 0, 0, 0.79445],
    931: [0, 0.69444, 0, 0, 0.79445],
    933: [0, 0.69444, 0, 0, 0.85556],
    934: [0, 0.69444, 0, 0, 0.79445],
    936: [0, 0.69444, 0, 0, 0.85556],
    937: [0, 0.69444, 0, 0, 0.79445],
    8211: [0, 0.45833, 0.03056, 0, 0.55],
    8212: [0, 0.45833, 0.03056, 0, 1.10001],
    8216: [0, 0.69444, 0, 0, 0.30556],
    8217: [0, 0.69444, 0, 0, 0.30556],
    8220: [0, 0.69444, 0, 0, 0.55834],
    8221: [0, 0.69444, 0, 0, 0.55834]
  },
  "SansSerif-Italic": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0.05733, 0, 0.31945],
    34: [0, 0.69444, 316e-5, 0, 0.5],
    35: [0.19444, 0.69444, 0.05087, 0, 0.83334],
    36: [0.05556, 0.75, 0.11156, 0, 0.5],
    37: [0.05556, 0.75, 0.03126, 0, 0.83334],
    38: [0, 0.69444, 0.03058, 0, 0.75834],
    39: [0, 0.69444, 0.07816, 0, 0.27778],
    40: [0.25, 0.75, 0.13164, 0, 0.38889],
    41: [0.25, 0.75, 0.02536, 0, 0.38889],
    42: [0, 0.75, 0.11775, 0, 0.5],
    43: [0.08333, 0.58333, 0.02536, 0, 0.77778],
    44: [0.125, 0.08333, 0, 0, 0.27778],
    45: [0, 0.44444, 0.01946, 0, 0.33333],
    46: [0, 0.08333, 0, 0, 0.27778],
    47: [0.25, 0.75, 0.13164, 0, 0.5],
    48: [0, 0.65556, 0.11156, 0, 0.5],
    49: [0, 0.65556, 0.11156, 0, 0.5],
    50: [0, 0.65556, 0.11156, 0, 0.5],
    51: [0, 0.65556, 0.11156, 0, 0.5],
    52: [0, 0.65556, 0.11156, 0, 0.5],
    53: [0, 0.65556, 0.11156, 0, 0.5],
    54: [0, 0.65556, 0.11156, 0, 0.5],
    55: [0, 0.65556, 0.11156, 0, 0.5],
    56: [0, 0.65556, 0.11156, 0, 0.5],
    57: [0, 0.65556, 0.11156, 0, 0.5],
    58: [0, 0.44444, 0.02502, 0, 0.27778],
    59: [0.125, 0.44444, 0.02502, 0, 0.27778],
    61: [-0.13, 0.37, 0.05087, 0, 0.77778],
    63: [0, 0.69444, 0.11809, 0, 0.47222],
    64: [0, 0.69444, 0.07555, 0, 0.66667],
    65: [0, 0.69444, 0, 0, 0.66667],
    66: [0, 0.69444, 0.08293, 0, 0.66667],
    67: [0, 0.69444, 0.11983, 0, 0.63889],
    68: [0, 0.69444, 0.07555, 0, 0.72223],
    69: [0, 0.69444, 0.11983, 0, 0.59722],
    70: [0, 0.69444, 0.13372, 0, 0.56945],
    71: [0, 0.69444, 0.11983, 0, 0.66667],
    72: [0, 0.69444, 0.08094, 0, 0.70834],
    73: [0, 0.69444, 0.13372, 0, 0.27778],
    74: [0, 0.69444, 0.08094, 0, 0.47222],
    75: [0, 0.69444, 0.11983, 0, 0.69445],
    76: [0, 0.69444, 0, 0, 0.54167],
    77: [0, 0.69444, 0.08094, 0, 0.875],
    78: [0, 0.69444, 0.08094, 0, 0.70834],
    79: [0, 0.69444, 0.07555, 0, 0.73611],
    80: [0, 0.69444, 0.08293, 0, 0.63889],
    81: [0.125, 0.69444, 0.07555, 0, 0.73611],
    82: [0, 0.69444, 0.08293, 0, 0.64584],
    83: [0, 0.69444, 0.09205, 0, 0.55556],
    84: [0, 0.69444, 0.13372, 0, 0.68056],
    85: [0, 0.69444, 0.08094, 0, 0.6875],
    86: [0, 0.69444, 0.1615, 0, 0.66667],
    87: [0, 0.69444, 0.1615, 0, 0.94445],
    88: [0, 0.69444, 0.13372, 0, 0.66667],
    89: [0, 0.69444, 0.17261, 0, 0.66667],
    90: [0, 0.69444, 0.11983, 0, 0.61111],
    91: [0.25, 0.75, 0.15942, 0, 0.28889],
    93: [0.25, 0.75, 0.08719, 0, 0.28889],
    94: [0, 0.69444, 0.0799, 0, 0.5],
    95: [0.35, 0.09444, 0.08616, 0, 0.5],
    97: [0, 0.44444, 981e-5, 0, 0.48056],
    98: [0, 0.69444, 0.03057, 0, 0.51667],
    99: [0, 0.44444, 0.08336, 0, 0.44445],
    100: [0, 0.69444, 0.09483, 0, 0.51667],
    101: [0, 0.44444, 0.06778, 0, 0.44445],
    102: [0, 0.69444, 0.21705, 0, 0.30556],
    103: [0.19444, 0.44444, 0.10836, 0, 0.5],
    104: [0, 0.69444, 0.01778, 0, 0.51667],
    105: [0, 0.67937, 0.09718, 0, 0.23889],
    106: [0.19444, 0.67937, 0.09162, 0, 0.26667],
    107: [0, 0.69444, 0.08336, 0, 0.48889],
    108: [0, 0.69444, 0.09483, 0, 0.23889],
    109: [0, 0.44444, 0.01778, 0, 0.79445],
    110: [0, 0.44444, 0.01778, 0, 0.51667],
    111: [0, 0.44444, 0.06613, 0, 0.5],
    112: [0.19444, 0.44444, 0.0389, 0, 0.51667],
    113: [0.19444, 0.44444, 0.04169, 0, 0.51667],
    114: [0, 0.44444, 0.10836, 0, 0.34167],
    115: [0, 0.44444, 0.0778, 0, 0.38333],
    116: [0, 0.57143, 0.07225, 0, 0.36111],
    117: [0, 0.44444, 0.04169, 0, 0.51667],
    118: [0, 0.44444, 0.10836, 0, 0.46111],
    119: [0, 0.44444, 0.10836, 0, 0.68334],
    120: [0, 0.44444, 0.09169, 0, 0.46111],
    121: [0.19444, 0.44444, 0.10836, 0, 0.46111],
    122: [0, 0.44444, 0.08752, 0, 0.43472],
    126: [0.35, 0.32659, 0.08826, 0, 0.5],
    160: [0, 0, 0, 0, 0.25],
    168: [0, 0.67937, 0.06385, 0, 0.5],
    176: [0, 0.69444, 0, 0, 0.73752],
    184: [0.17014, 0, 0, 0, 0.44445],
    305: [0, 0.44444, 0.04169, 0, 0.23889],
    567: [0.19444, 0.44444, 0.04169, 0, 0.26667],
    710: [0, 0.69444, 0.0799, 0, 0.5],
    711: [0, 0.63194, 0.08432, 0, 0.5],
    713: [0, 0.60889, 0.08776, 0, 0.5],
    714: [0, 0.69444, 0.09205, 0, 0.5],
    715: [0, 0.69444, 0, 0, 0.5],
    728: [0, 0.69444, 0.09483, 0, 0.5],
    729: [0, 0.67937, 0.07774, 0, 0.27778],
    730: [0, 0.69444, 0, 0, 0.73752],
    732: [0, 0.67659, 0.08826, 0, 0.5],
    733: [0, 0.69444, 0.09205, 0, 0.5],
    915: [0, 0.69444, 0.13372, 0, 0.54167],
    916: [0, 0.69444, 0, 0, 0.83334],
    920: [0, 0.69444, 0.07555, 0, 0.77778],
    923: [0, 0.69444, 0, 0, 0.61111],
    926: [0, 0.69444, 0.12816, 0, 0.66667],
    928: [0, 0.69444, 0.08094, 0, 0.70834],
    931: [0, 0.69444, 0.11983, 0, 0.72222],
    933: [0, 0.69444, 0.09031, 0, 0.77778],
    934: [0, 0.69444, 0.04603, 0, 0.72222],
    936: [0, 0.69444, 0.09031, 0, 0.77778],
    937: [0, 0.69444, 0.08293, 0, 0.72222],
    8211: [0, 0.44444, 0.08616, 0, 0.5],
    8212: [0, 0.44444, 0.08616, 0, 1],
    8216: [0, 0.69444, 0.07816, 0, 0.27778],
    8217: [0, 0.69444, 0.07816, 0, 0.27778],
    8220: [0, 0.69444, 0.14205, 0, 0.5],
    8221: [0, 0.69444, 316e-5, 0, 0.5]
  },
  "SansSerif-Regular": {
    32: [0, 0, 0, 0, 0.25],
    33: [0, 0.69444, 0, 0, 0.31945],
    34: [0, 0.69444, 0, 0, 0.5],
    35: [0.19444, 0.69444, 0, 0, 0.83334],
    36: [0.05556, 0.75, 0, 0, 0.5],
    37: [0.05556, 0.75, 0, 0, 0.83334],
    38: [0, 0.69444, 0, 0, 0.75834],
    39: [0, 0.69444, 0, 0, 0.27778],
    40: [0.25, 0.75, 0, 0, 0.38889],
    41: [0.25, 0.75, 0, 0, 0.38889],
    42: [0, 0.75, 0, 0, 0.5],
    43: [0.08333, 0.58333, 0, 0, 0.77778],
    44: [0.125, 0.08333, 0, 0, 0.27778],
    45: [0, 0.44444, 0, 0, 0.33333],
    46: [0, 0.08333, 0, 0, 0.27778],
    47: [0.25, 0.75, 0, 0, 0.5],
    48: [0, 0.65556, 0, 0, 0.5],
    49: [0, 0.65556, 0, 0, 0.5],
    50: [0, 0.65556, 0, 0, 0.5],
    51: [0, 0.65556, 0, 0, 0.5],
    52: [0, 0.65556, 0, 0, 0.5],
    53: [0, 0.65556, 0, 0, 0.5],
    54: [0, 0.65556, 0, 0, 0.5],
    55: [0, 0.65556, 0, 0, 0.5],
    56: [0, 0.65556, 0, 0, 0.5],
    57: [0, 0.65556, 0, 0, 0.5],
    58: [0, 0.44444, 0, 0, 0.27778],
    59: [0.125, 0.44444, 0, 0, 0.27778],
    61: [-0.13, 0.37, 0, 0, 0.77778],
    63: [0, 0.69444, 0, 0, 0.47222],
    64: [0, 0.69444, 0, 0, 0.66667],
    65: [0, 0.69444, 0, 0, 0.66667],
    66: [0, 0.69444, 0, 0, 0.66667],
    67: [0, 0.69444, 0, 0, 0.63889],
    68: [0, 0.69444, 0, 0, 0.72223],
    69: [0, 0.69444, 0, 0, 0.59722],
    70: [0, 0.69444, 0, 0, 0.56945],
    71: [0, 0.69444, 0, 0, 0.66667],
    72: [0, 0.69444, 0, 0, 0.70834],
    73: [0, 0.69444, 0, 0, 0.27778],
    74: [0, 0.69444, 0, 0, 0.47222],
    75: [0, 0.69444, 0, 0, 0.69445],
    76: [0, 0.69444, 0, 0, 0.54167],
    77: [0, 0.69444, 0, 0, 0.875],
    78: [0, 0.69444, 0, 0, 0.70834],
    79: [0, 0.69444, 0, 0, 0.73611],
    80: [0, 0.69444, 0, 0, 0.63889],
    81: [0.125, 0.69444, 0, 0, 0.73611],
    82: [0, 0.69444, 0, 0, 0.64584],
    83: [0, 0.69444, 0, 0, 0.55556],
    84: [0, 0.69444, 0, 0, 0.68056],
    85: [0, 0.69444, 0, 0, 0.6875],
    86: [0, 0.69444, 0.01389, 0, 0.66667],
    87: [0, 0.69444, 0.01389, 0, 0.94445],
    88: [0, 0.69444, 0, 0, 0.66667],
    89: [0, 0.69444, 0.025, 0, 0.66667],
    90: [0, 0.69444, 0, 0, 0.61111],
    91: [0.25, 0.75, 0, 0, 0.28889],
    93: [0.25, 0.75, 0, 0, 0.28889],
    94: [0, 0.69444, 0, 0, 0.5],
    95: [0.35, 0.09444, 0.02778, 0, 0.5],
    97: [0, 0.44444, 0, 0, 0.48056],
    98: [0, 0.69444, 0, 0, 0.51667],
    99: [0, 0.44444, 0, 0, 0.44445],
    100: [0, 0.69444, 0, 0, 0.51667],
    101: [0, 0.44444, 0, 0, 0.44445],
    102: [0, 0.69444, 0.06944, 0, 0.30556],
    103: [0.19444, 0.44444, 0.01389, 0, 0.5],
    104: [0, 0.69444, 0, 0, 0.51667],
    105: [0, 0.67937, 0, 0, 0.23889],
    106: [0.19444, 0.67937, 0, 0, 0.26667],
    107: [0, 0.69444, 0, 0, 0.48889],
    108: [0, 0.69444, 0, 0, 0.23889],
    109: [0, 0.44444, 0, 0, 0.79445],
    110: [0, 0.44444, 0, 0, 0.51667],
    111: [0, 0.44444, 0, 0, 0.5],
    112: [0.19444, 0.44444, 0, 0, 0.51667],
    113: [0.19444, 0.44444, 0, 0, 0.51667],
    114: [0, 0.44444, 0.01389, 0, 0.34167],
    115: [0, 0.44444, 0, 0, 0.38333],
    116: [0, 0.57143, 0, 0, 0.36111],
    117: [0, 0.44444, 0, 0, 0.51667],
    118: [0, 0.44444, 0.01389, 0, 0.46111],
    119: [0, 0.44444, 0.01389, 0, 0.68334],
    120: [0, 0.44444, 0, 0, 0.46111],
    121: [0.19444, 0.44444, 0.01389, 0, 0.46111],
    122: [0, 0.44444, 0, 0, 0.43472],
    126: [0.35, 0.32659, 0, 0, 0.5],
    160: [0, 0, 0, 0, 0.25],
    168: [0, 0.67937, 0, 0, 0.5],
    176: [0, 0.69444, 0, 0, 0.66667],
    184: [0.17014, 0, 0, 0, 0.44445],
    305: [0, 0.44444, 0, 0, 0.23889],
    567: [0.19444, 0.44444, 0, 0, 0.26667],
    710: [0, 0.69444, 0, 0, 0.5],
    711: [0, 0.63194, 0, 0, 0.5],
    713: [0, 0.60889, 0, 0, 0.5],
    714: [0, 0.69444, 0, 0, 0.5],
    715: [0, 0.69444, 0, 0, 0.5],
    728: [0, 0.69444, 0, 0, 0.5],
    729: [0, 0.67937, 0, 0, 0.27778],
    730: [0, 0.69444, 0, 0, 0.66667],
    732: [0, 0.67659, 0, 0, 0.5],
    733: [0, 0.69444, 0, 0, 0.5],
    915: [0, 0.69444, 0, 0, 0.54167],
    916: [0, 0.69444, 0, 0, 0.83334],
    920: [0, 0.69444, 0, 0, 0.77778],
    923: [0, 0.69444, 0, 0, 0.61111],
    926: [0, 0.69444, 0, 0, 0.66667],
    928: [0, 0.69444, 0, 0, 0.70834],
    931: [0, 0.69444, 0, 0, 0.72222],
    933: [0, 0.69444, 0, 0, 0.77778],
    934: [0, 0.69444, 0, 0, 0.72222],
    936: [0, 0.69444, 0, 0, 0.77778],
    937: [0, 0.69444, 0, 0, 0.72222],
    8211: [0, 0.44444, 0.02778, 0, 0.5],
    8212: [0, 0.44444, 0.02778, 0, 1],
    8216: [0, 0.69444, 0, 0, 0.27778],
    8217: [0, 0.69444, 0, 0, 0.27778],
    8220: [0, 0.69444, 0, 0, 0.5],
    8221: [0, 0.69444, 0, 0, 0.5]
  },
  "Script-Regular": {
    32: [0, 0, 0, 0, 0.25],
    65: [0, 0.7, 0.22925, 0, 0.80253],
    66: [0, 0.7, 0.04087, 0, 0.90757],
    67: [0, 0.7, 0.1689, 0, 0.66619],
    68: [0, 0.7, 0.09371, 0, 0.77443],
    69: [0, 0.7, 0.18583, 0, 0.56162],
    70: [0, 0.7, 0.13634, 0, 0.89544],
    71: [0, 0.7, 0.17322, 0, 0.60961],
    72: [0, 0.7, 0.29694, 0, 0.96919],
    73: [0, 0.7, 0.19189, 0, 0.80907],
    74: [0.27778, 0.7, 0.19189, 0, 1.05159],
    75: [0, 0.7, 0.31259, 0, 0.91364],
    76: [0, 0.7, 0.19189, 0, 0.87373],
    77: [0, 0.7, 0.15981, 0, 1.08031],
    78: [0, 0.7, 0.3525, 0, 0.9015],
    79: [0, 0.7, 0.08078, 0, 0.73787],
    80: [0, 0.7, 0.08078, 0, 1.01262],
    81: [0, 0.7, 0.03305, 0, 0.88282],
    82: [0, 0.7, 0.06259, 0, 0.85],
    83: [0, 0.7, 0.19189, 0, 0.86767],
    84: [0, 0.7, 0.29087, 0, 0.74697],
    85: [0, 0.7, 0.25815, 0, 0.79996],
    86: [0, 0.7, 0.27523, 0, 0.62204],
    87: [0, 0.7, 0.27523, 0, 0.80532],
    88: [0, 0.7, 0.26006, 0, 0.94445],
    89: [0, 0.7, 0.2939, 0, 0.70961],
    90: [0, 0.7, 0.24037, 0, 0.8212],
    160: [0, 0, 0, 0, 0.25]
  },
  "Size1-Regular": {
    32: [0, 0, 0, 0, 0.25],
    40: [0.35001, 0.85, 0, 0, 0.45834],
    41: [0.35001, 0.85, 0, 0, 0.45834],
    47: [0.35001, 0.85, 0, 0, 0.57778],
    91: [0.35001, 0.85, 0, 0, 0.41667],
    92: [0.35001, 0.85, 0, 0, 0.57778],
    93: [0.35001, 0.85, 0, 0, 0.41667],
    123: [0.35001, 0.85, 0, 0, 0.58334],
    125: [0.35001, 0.85, 0, 0, 0.58334],
    160: [0, 0, 0, 0, 0.25],
    710: [0, 0.72222, 0, 0, 0.55556],
    732: [0, 0.72222, 0, 0, 0.55556],
    770: [0, 0.72222, 0, 0, 0.55556],
    771: [0, 0.72222, 0, 0, 0.55556],
    8214: [-99e-5, 0.601, 0, 0, 0.77778],
    8593: [1e-5, 0.6, 0, 0, 0.66667],
    8595: [1e-5, 0.6, 0, 0, 0.66667],
    8657: [1e-5, 0.6, 0, 0, 0.77778],
    8659: [1e-5, 0.6, 0, 0, 0.77778],
    8719: [0.25001, 0.75, 0, 0, 0.94445],
    8720: [0.25001, 0.75, 0, 0, 0.94445],
    8721: [0.25001, 0.75, 0, 0, 1.05556],
    8730: [0.35001, 0.85, 0, 0, 1],
    8739: [-599e-5, 0.606, 0, 0, 0.33333],
    8741: [-599e-5, 0.606, 0, 0, 0.55556],
    8747: [0.30612, 0.805, 0.19445, 0, 0.47222],
    8748: [0.306, 0.805, 0.19445, 0, 0.47222],
    8749: [0.306, 0.805, 0.19445, 0, 0.47222],
    8750: [0.30612, 0.805, 0.19445, 0, 0.47222],
    8896: [0.25001, 0.75, 0, 0, 0.83334],
    8897: [0.25001, 0.75, 0, 0, 0.83334],
    8898: [0.25001, 0.75, 0, 0, 0.83334],
    8899: [0.25001, 0.75, 0, 0, 0.83334],
    8968: [0.35001, 0.85, 0, 0, 0.47222],
    8969: [0.35001, 0.85, 0, 0, 0.47222],
    8970: [0.35001, 0.85, 0, 0, 0.47222],
    8971: [0.35001, 0.85, 0, 0, 0.47222],
    9168: [-99e-5, 0.601, 0, 0, 0.66667],
    10216: [0.35001, 0.85, 0, 0, 0.47222],
    10217: [0.35001, 0.85, 0, 0, 0.47222],
    10752: [0.25001, 0.75, 0, 0, 1.11111],
    10753: [0.25001, 0.75, 0, 0, 1.11111],
    10754: [0.25001, 0.75, 0, 0, 1.11111],
    10756: [0.25001, 0.75, 0, 0, 0.83334],
    10758: [0.25001, 0.75, 0, 0, 0.83334]
  },
  "Size2-Regular": {
    32: [0, 0, 0, 0, 0.25],
    40: [0.65002, 1.15, 0, 0, 0.59722],
    41: [0.65002, 1.15, 0, 0, 0.59722],
    47: [0.65002, 1.15, 0, 0, 0.81111],
    91: [0.65002, 1.15, 0, 0, 0.47222],
    92: [0.65002, 1.15, 0, 0, 0.81111],
    93: [0.65002, 1.15, 0, 0, 0.47222],
    123: [0.65002, 1.15, 0, 0, 0.66667],
    125: [0.65002, 1.15, 0, 0, 0.66667],
    160: [0, 0, 0, 0, 0.25],
    710: [0, 0.75, 0, 0, 1],
    732: [0, 0.75, 0, 0, 1],
    770: [0, 0.75, 0, 0, 1],
    771: [0, 0.75, 0, 0, 1],
    8719: [0.55001, 1.05, 0, 0, 1.27778],
    8720: [0.55001, 1.05, 0, 0, 1.27778],
    8721: [0.55001, 1.05, 0, 0, 1.44445],
    8730: [0.65002, 1.15, 0, 0, 1],
    8747: [0.86225, 1.36, 0.44445, 0, 0.55556],
    8748: [0.862, 1.36, 0.44445, 0, 0.55556],
    8749: [0.862, 1.36, 0.44445, 0, 0.55556],
    8750: [0.86225, 1.36, 0.44445, 0, 0.55556],
    8896: [0.55001, 1.05, 0, 0, 1.11111],
    8897: [0.55001, 1.05, 0, 0, 1.11111],
    8898: [0.55001, 1.05, 0, 0, 1.11111],
    8899: [0.55001, 1.05, 0, 0, 1.11111],
    8968: [0.65002, 1.15, 0, 0, 0.52778],
    8969: [0.65002, 1.15, 0, 0, 0.52778],
    8970: [0.65002, 1.15, 0, 0, 0.52778],
    8971: [0.65002, 1.15, 0, 0, 0.52778],
    10216: [0.65002, 1.15, 0, 0, 0.61111],
    10217: [0.65002, 1.15, 0, 0, 0.61111],
    10752: [0.55001, 1.05, 0, 0, 1.51112],
    10753: [0.55001, 1.05, 0, 0, 1.51112],
    10754: [0.55001, 1.05, 0, 0, 1.51112],
    10756: [0.55001, 1.05, 0, 0, 1.11111],
    10758: [0.55001, 1.05, 0, 0, 1.11111]
  },
  "Size3-Regular": {
    32: [0, 0, 0, 0, 0.25],
    40: [0.95003, 1.45, 0, 0, 0.73611],
    41: [0.95003, 1.45, 0, 0, 0.73611],
    47: [0.95003, 1.45, 0, 0, 1.04445],
    91: [0.95003, 1.45, 0, 0, 0.52778],
    92: [0.95003, 1.45, 0, 0, 1.04445],
    93: [0.95003, 1.45, 0, 0, 0.52778],
    123: [0.95003, 1.45, 0, 0, 0.75],
    125: [0.95003, 1.45, 0, 0, 0.75],
    160: [0, 0, 0, 0, 0.25],
    710: [0, 0.75, 0, 0, 1.44445],
    732: [0, 0.75, 0, 0, 1.44445],
    770: [0, 0.75, 0, 0, 1.44445],
    771: [0, 0.75, 0, 0, 1.44445],
    8730: [0.95003, 1.45, 0, 0, 1],
    8968: [0.95003, 1.45, 0, 0, 0.58334],
    8969: [0.95003, 1.45, 0, 0, 0.58334],
    8970: [0.95003, 1.45, 0, 0, 0.58334],
    8971: [0.95003, 1.45, 0, 0, 0.58334],
    10216: [0.95003, 1.45, 0, 0, 0.75],
    10217: [0.95003, 1.45, 0, 0, 0.75]
  },
  "Size4-Regular": {
    32: [0, 0, 0, 0, 0.25],
    40: [1.25003, 1.75, 0, 0, 0.79167],
    41: [1.25003, 1.75, 0, 0, 0.79167],
    47: [1.25003, 1.75, 0, 0, 1.27778],
    91: [1.25003, 1.75, 0, 0, 0.58334],
    92: [1.25003, 1.75, 0, 0, 1.27778],
    93: [1.25003, 1.75, 0, 0, 0.58334],
    123: [1.25003, 1.75, 0, 0, 0.80556],
    125: [1.25003, 1.75, 0, 0, 0.80556],
    160: [0, 0, 0, 0, 0.25],
    710: [0, 0.825, 0, 0, 1.8889],
    732: [0, 0.825, 0, 0, 1.8889],
    770: [0, 0.825, 0, 0, 1.8889],
    771: [0, 0.825, 0, 0, 1.8889],
    8730: [1.25003, 1.75, 0, 0, 1],
    8968: [1.25003, 1.75, 0, 0, 0.63889],
    8969: [1.25003, 1.75, 0, 0, 0.63889],
    8970: [1.25003, 1.75, 0, 0, 0.63889],
    8971: [1.25003, 1.75, 0, 0, 0.63889],
    9115: [0.64502, 1.155, 0, 0, 0.875],
    9116: [1e-5, 0.6, 0, 0, 0.875],
    9117: [0.64502, 1.155, 0, 0, 0.875],
    9118: [0.64502, 1.155, 0, 0, 0.875],
    9119: [1e-5, 0.6, 0, 0, 0.875],
    9120: [0.64502, 1.155, 0, 0, 0.875],
    9121: [0.64502, 1.155, 0, 0, 0.66667],
    9122: [-99e-5, 0.601, 0, 0, 0.66667],
    9123: [0.64502, 1.155, 0, 0, 0.66667],
    9124: [0.64502, 1.155, 0, 0, 0.66667],
    9125: [-99e-5, 0.601, 0, 0, 0.66667],
    9126: [0.64502, 1.155, 0, 0, 0.66667],
    9127: [1e-5, 0.9, 0, 0, 0.88889],
    9128: [0.65002, 1.15, 0, 0, 0.88889],
    9129: [0.90001, 0, 0, 0, 0.88889],
    9130: [0, 0.3, 0, 0, 0.88889],
    9131: [1e-5, 0.9, 0, 0, 0.88889],
    9132: [0.65002, 1.15, 0, 0, 0.88889],
    9133: [0.90001, 0, 0, 0, 0.88889],
    9143: [0.88502, 0.915, 0, 0, 1.05556],
    10216: [1.25003, 1.75, 0, 0, 0.80556],
    10217: [1.25003, 1.75, 0, 0, 0.80556],
    57344: [-499e-5, 0.605, 0, 0, 1.05556],
    57345: [-499e-5, 0.605, 0, 0, 1.05556],
    57680: [0, 0.12, 0, 0, 0.45],
    57681: [0, 0.12, 0, 0, 0.45],
    57682: [0, 0.12, 0, 0, 0.45],
    57683: [0, 0.12, 0, 0, 0.45]
  },
  "Typewriter-Regular": {
    32: [0, 0, 0, 0, 0.525],
    33: [0, 0.61111, 0, 0, 0.525],
    34: [0, 0.61111, 0, 0, 0.525],
    35: [0, 0.61111, 0, 0, 0.525],
    36: [0.08333, 0.69444, 0, 0, 0.525],
    37: [0.08333, 0.69444, 0, 0, 0.525],
    38: [0, 0.61111, 0, 0, 0.525],
    39: [0, 0.61111, 0, 0, 0.525],
    40: [0.08333, 0.69444, 0, 0, 0.525],
    41: [0.08333, 0.69444, 0, 0, 0.525],
    42: [0, 0.52083, 0, 0, 0.525],
    43: [-0.08056, 0.53055, 0, 0, 0.525],
    44: [0.13889, 0.125, 0, 0, 0.525],
    45: [-0.08056, 0.53055, 0, 0, 0.525],
    46: [0, 0.125, 0, 0, 0.525],
    47: [0.08333, 0.69444, 0, 0, 0.525],
    48: [0, 0.61111, 0, 0, 0.525],
    49: [0, 0.61111, 0, 0, 0.525],
    50: [0, 0.61111, 0, 0, 0.525],
    51: [0, 0.61111, 0, 0, 0.525],
    52: [0, 0.61111, 0, 0, 0.525],
    53: [0, 0.61111, 0, 0, 0.525],
    54: [0, 0.61111, 0, 0, 0.525],
    55: [0, 0.61111, 0, 0, 0.525],
    56: [0, 0.61111, 0, 0, 0.525],
    57: [0, 0.61111, 0, 0, 0.525],
    58: [0, 0.43056, 0, 0, 0.525],
    59: [0.13889, 0.43056, 0, 0, 0.525],
    60: [-0.05556, 0.55556, 0, 0, 0.525],
    61: [-0.19549, 0.41562, 0, 0, 0.525],
    62: [-0.05556, 0.55556, 0, 0, 0.525],
    63: [0, 0.61111, 0, 0, 0.525],
    64: [0, 0.61111, 0, 0, 0.525],
    65: [0, 0.61111, 0, 0, 0.525],
    66: [0, 0.61111, 0, 0, 0.525],
    67: [0, 0.61111, 0, 0, 0.525],
    68: [0, 0.61111, 0, 0, 0.525],
    69: [0, 0.61111, 0, 0, 0.525],
    70: [0, 0.61111, 0, 0, 0.525],
    71: [0, 0.61111, 0, 0, 0.525],
    72: [0, 0.61111, 0, 0, 0.525],
    73: [0, 0.61111, 0, 0, 0.525],
    74: [0, 0.61111, 0, 0, 0.525],
    75: [0, 0.61111, 0, 0, 0.525],
    76: [0, 0.61111, 0, 0, 0.525],
    77: [0, 0.61111, 0, 0, 0.525],
    78: [0, 0.61111, 0, 0, 0.525],
    79: [0, 0.61111, 0, 0, 0.525],
    80: [0, 0.61111, 0, 0, 0.525],
    81: [0.13889, 0.61111, 0, 0, 0.525],
    82: [0, 0.61111, 0, 0, 0.525],
    83: [0, 0.61111, 0, 0, 0.525],
    84: [0, 0.61111, 0, 0, 0.525],
    85: [0, 0.61111, 0, 0, 0.525],
    86: [0, 0.61111, 0, 0, 0.525],
    87: [0, 0.61111, 0, 0, 0.525],
    88: [0, 0.61111, 0, 0, 0.525],
    89: [0, 0.61111, 0, 0, 0.525],
    90: [0, 0.61111, 0, 0, 0.525],
    91: [0.08333, 0.69444, 0, 0, 0.525],
    92: [0.08333, 0.69444, 0, 0, 0.525],
    93: [0.08333, 0.69444, 0, 0, 0.525],
    94: [0, 0.61111, 0, 0, 0.525],
    95: [0.09514, 0, 0, 0, 0.525],
    96: [0, 0.61111, 0, 0, 0.525],
    97: [0, 0.43056, 0, 0, 0.525],
    98: [0, 0.61111, 0, 0, 0.525],
    99: [0, 0.43056, 0, 0, 0.525],
    100: [0, 0.61111, 0, 0, 0.525],
    101: [0, 0.43056, 0, 0, 0.525],
    102: [0, 0.61111, 0, 0, 0.525],
    103: [0.22222, 0.43056, 0, 0, 0.525],
    104: [0, 0.61111, 0, 0, 0.525],
    105: [0, 0.61111, 0, 0, 0.525],
    106: [0.22222, 0.61111, 0, 0, 0.525],
    107: [0, 0.61111, 0, 0, 0.525],
    108: [0, 0.61111, 0, 0, 0.525],
    109: [0, 0.43056, 0, 0, 0.525],
    110: [0, 0.43056, 0, 0, 0.525],
    111: [0, 0.43056, 0, 0, 0.525],
    112: [0.22222, 0.43056, 0, 0, 0.525],
    113: [0.22222, 0.43056, 0, 0, 0.525],
    114: [0, 0.43056, 0, 0, 0.525],
    115: [0, 0.43056, 0, 0, 0.525],
    116: [0, 0.55358, 0, 0, 0.525],
    117: [0, 0.43056, 0, 0, 0.525],
    118: [0, 0.43056, 0, 0, 0.525],
    119: [0, 0.43056, 0, 0, 0.525],
    120: [0, 0.43056, 0, 0, 0.525],
    121: [0.22222, 0.43056, 0, 0, 0.525],
    122: [0, 0.43056, 0, 0, 0.525],
    123: [0.08333, 0.69444, 0, 0, 0.525],
    124: [0.08333, 0.69444, 0, 0, 0.525],
    125: [0.08333, 0.69444, 0, 0, 0.525],
    126: [0, 0.61111, 0, 0, 0.525],
    127: [0, 0.61111, 0, 0, 0.525],
    160: [0, 0, 0, 0, 0.525],
    176: [0, 0.61111, 0, 0, 0.525],
    184: [0.19445, 0, 0, 0, 0.525],
    305: [0, 0.43056, 0, 0, 0.525],
    567: [0.22222, 0.43056, 0, 0, 0.525],
    711: [0, 0.56597, 0, 0, 0.525],
    713: [0, 0.56555, 0, 0, 0.525],
    714: [0, 0.61111, 0, 0, 0.525],
    715: [0, 0.61111, 0, 0, 0.525],
    728: [0, 0.61111, 0, 0, 0.525],
    730: [0, 0.61111, 0, 0, 0.525],
    770: [0, 0.61111, 0, 0, 0.525],
    771: [0, 0.61111, 0, 0, 0.525],
    776: [0, 0.61111, 0, 0, 0.525],
    915: [0, 0.61111, 0, 0, 0.525],
    916: [0, 0.61111, 0, 0, 0.525],
    920: [0, 0.61111, 0, 0, 0.525],
    923: [0, 0.61111, 0, 0, 0.525],
    926: [0, 0.61111, 0, 0, 0.525],
    928: [0, 0.61111, 0, 0, 0.525],
    931: [0, 0.61111, 0, 0, 0.525],
    933: [0, 0.61111, 0, 0, 0.525],
    934: [0, 0.61111, 0, 0, 0.525],
    936: [0, 0.61111, 0, 0, 0.525],
    937: [0, 0.61111, 0, 0, 0.525],
    8216: [0, 0.61111, 0, 0, 0.525],
    8217: [0, 0.61111, 0, 0, 0.525],
    8242: [0, 0.61111, 0, 0, 0.525],
    9251: [0.11111, 0.21944, 0, 0, 0.525]
  }
}, U0 = {
  slant: [0.25, 0.25, 0.25],
  // sigma1
  space: [0, 0, 0],
  // sigma2
  stretch: [0, 0, 0],
  // sigma3
  shrink: [0, 0, 0],
  // sigma4
  xHeight: [0.431, 0.431, 0.431],
  // sigma5
  quad: [1, 1.171, 1.472],
  // sigma6
  extraSpace: [0, 0, 0],
  // sigma7
  num1: [0.677, 0.732, 0.925],
  // sigma8
  num2: [0.394, 0.384, 0.387],
  // sigma9
  num3: [0.444, 0.471, 0.504],
  // sigma10
  denom1: [0.686, 0.752, 1.025],
  // sigma11
  denom2: [0.345, 0.344, 0.532],
  // sigma12
  sup1: [0.413, 0.503, 0.504],
  // sigma13
  sup2: [0.363, 0.431, 0.404],
  // sigma14
  sup3: [0.289, 0.286, 0.294],
  // sigma15
  sub1: [0.15, 0.143, 0.2],
  // sigma16
  sub2: [0.247, 0.286, 0.4],
  // sigma17
  supDrop: [0.386, 0.353, 0.494],
  // sigma18
  subDrop: [0.05, 0.071, 0.1],
  // sigma19
  delim1: [2.39, 1.7, 1.98],
  // sigma20
  delim2: [1.01, 1.157, 1.42],
  // sigma21
  axisHeight: [0.25, 0.25, 0.25],
  // sigma22
  // These font metrics are extracted from TeX by using tftopl on cmex10.tfm;
  // they correspond to the font parameters of the extension fonts (family 3).
  // See the TeXbook, page 441. In AMSTeX, the extension fonts scale; to
  // match cmex7, we'd use cmex7.tfm values for script and scriptscript
  // values.
  defaultRuleThickness: [0.04, 0.049, 0.049],
  // xi8; cmex7: 0.049
  bigOpSpacing1: [0.111, 0.111, 0.111],
  // xi9
  bigOpSpacing2: [0.166, 0.166, 0.166],
  // xi10
  bigOpSpacing3: [0.2, 0.2, 0.2],
  // xi11
  bigOpSpacing4: [0.6, 0.611, 0.611],
  // xi12; cmex7: 0.611
  bigOpSpacing5: [0.1, 0.143, 0.143],
  // xi13; cmex7: 0.143
  // The \sqrt rule width is taken from the height of the surd character.
  // Since we use the same font at all sizes, this thickness doesn't scale.
  sqrtRuleThickness: [0.04, 0.04, 0.04],
  // This value determines how large a pt is, for metrics which are defined
  // in terms of pts.
  // This value is also used in katex.less; if you change it make sure the
  // values match.
  ptPerEm: [10, 10, 10],
  // The space between adjacent `|` columns in an array definition. From
  // `\showthe\doublerulesep` in LaTeX. Equals 2.0 / ptPerEm.
  doubleRuleSep: [0.2, 0.2, 0.2],
  // The width of separator lines in {array} environments. From
  // `\showthe\arrayrulewidth` in LaTeX. Equals 0.4 / ptPerEm.
  arrayRuleWidth: [0.04, 0.04, 0.04],
  // Two values from LaTeX source2e:
  fboxsep: [0.3, 0.3, 0.3],
  //        3 pt / ptPerEm
  fboxrule: [0.04, 0.04, 0.04]
  // 0.4 pt / ptPerEm
}, yr = {
  // Latin-1
  Å: "A",
  Ð: "D",
  Þ: "o",
  å: "a",
  ð: "d",
  þ: "o",
  // Cyrillic
  А: "A",
  Б: "B",
  В: "B",
  Г: "F",
  Д: "A",
  Е: "E",
  Ж: "K",
  З: "3",
  И: "N",
  Й: "N",
  К: "K",
  Л: "N",
  М: "M",
  Н: "H",
  О: "O",
  П: "N",
  Р: "P",
  С: "C",
  Т: "T",
  У: "y",
  Ф: "O",
  Х: "X",
  Ц: "U",
  Ч: "h",
  Ш: "W",
  Щ: "W",
  Ъ: "B",
  Ы: "X",
  Ь: "B",
  Э: "3",
  Ю: "X",
  Я: "R",
  а: "a",
  б: "b",
  в: "a",
  г: "r",
  д: "y",
  е: "e",
  ж: "m",
  з: "e",
  и: "n",
  й: "n",
  к: "n",
  л: "n",
  м: "m",
  н: "n",
  о: "o",
  п: "n",
  р: "p",
  с: "c",
  т: "o",
  у: "y",
  ф: "b",
  х: "x",
  ц: "n",
  ч: "n",
  ш: "w",
  щ: "w",
  ъ: "a",
  ы: "m",
  ь: "a",
  э: "e",
  ю: "m",
  я: "r"
};
function Xn(r4, e) {
  Ze[r4] = e;
}
function Xt(r4, e, t) {
  if (!Ze[e])
    throw new Error("Font metrics not found for font: " + e + ".");
  var a = r4.charCodeAt(0), n = Ze[e][a];
  if (!n && r4[0] in yr && (a = yr[r4[0]].charCodeAt(0), n = Ze[e][a]), !n && t === "text" && ha(a) && (n = Ze[e][77]), n)
    return {
      depth: n[0],
      height: n[1],
      italic: n[2],
      skew: n[3],
      width: n[4]
    };
}
var yt = {};
function Zn(r4) {
  var e;
  if (r4 >= 5 ? e = 0 : r4 >= 3 ? e = 1 : e = 2, !yt[e]) {
    var t = yt[e] = {
      cssEmPerMu: U0.quad[e] / 18
    };
    for (var a in U0)
      U0.hasOwnProperty(a) && (t[a] = U0[a][e]);
  }
  return yt[e];
}
var Kn = [
  // Each element contains [textsize, scriptsize, scriptscriptsize].
  // The size mappings are taken from TeX with \normalsize=10pt.
  [1, 1, 1],
  // size1: [5, 5, 5]              \tiny
  [2, 1, 1],
  // size2: [6, 5, 5]
  [3, 1, 1],
  // size3: [7, 5, 5]              \scriptsize
  [4, 2, 1],
  // size4: [8, 6, 5]              \footnotesize
  [5, 2, 1],
  // size5: [9, 6, 5]              \small
  [6, 3, 1],
  // size6: [10, 7, 5]             \normalsize
  [7, 4, 2],
  // size7: [12, 8, 6]             \large
  [8, 6, 3],
  // size8: [14.4, 10, 7]          \Large
  [9, 7, 6],
  // size9: [17.28, 12, 10]        \LARGE
  [10, 8, 7],
  // size10: [20.74, 14.4, 12]     \huge
  [11, 10, 9]
  // size11: [24.88, 20.74, 17.28] \HUGE
], wr = [
  // fontMetrics.js:getGlobalMetrics also uses size indexes, so if
  // you change size indexes, change that function.
  0.5,
  0.6,
  0.7,
  0.8,
  0.9,
  1,
  1.2,
  1.44,
  1.728,
  2.074,
  2.488
], xr = function(e, t) {
  return t.size < 2 ? e : Kn[e - 1][t.size - 1];
};
class r0 {
  // A font family applies to a group of fonts (i.e. SansSerif), while a font
  // represents a specific font (i.e. SansSerif Bold).
  // See: https://tex.stackexchange.com/questions/22350/difference-between-textrm-and-mathrm
  /**
   * The base size index.
   */
  constructor(e) {
    this.style = void 0, this.color = void 0, this.size = void 0, this.textSize = void 0, this.phantom = void 0, this.font = void 0, this.fontFamily = void 0, this.fontWeight = void 0, this.fontShape = void 0, this.sizeMultiplier = void 0, this.maxSize = void 0, this.minRuleThickness = void 0, this._fontMetrics = void 0, this.style = e.style, this.color = e.color, this.size = e.size || r0.BASESIZE, this.textSize = e.textSize || this.size, this.phantom = !!e.phantom, this.font = e.font || "", this.fontFamily = e.fontFamily || "", this.fontWeight = e.fontWeight || "", this.fontShape = e.fontShape || "", this.sizeMultiplier = wr[this.size - 1], this.maxSize = e.maxSize, this.minRuleThickness = e.minRuleThickness, this._fontMetrics = void 0;
  }
  /**
   * Returns a new options object with the same properties as "this".  Properties
   * from "extension" will be copied to the new options object.
   */
  extend(e) {
    var t = {
      style: this.style,
      size: this.size,
      textSize: this.textSize,
      color: this.color,
      phantom: this.phantom,
      font: this.font,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontShape: this.fontShape,
      maxSize: this.maxSize,
      minRuleThickness: this.minRuleThickness
    };
    for (var a in e)
      e.hasOwnProperty(a) && (t[a] = e[a]);
    return new r0(t);
  }
  /**
   * Return an options object with the given style. If `this.style === style`,
   * returns `this`.
   */
  havingStyle(e) {
    return this.style === e ? this : this.extend({
      style: e,
      size: xr(this.textSize, e)
    });
  }
  /**
   * Return an options object with a cramped version of the current style. If
   * the current style is cramped, returns `this`.
   */
  havingCrampedStyle() {
    return this.havingStyle(this.style.cramp());
  }
  /**
   * Return an options object with the given size and in at least `\textstyle`.
   * Returns `this` if appropriate.
   */
  havingSize(e) {
    return this.size === e && this.textSize === e ? this : this.extend({
      style: this.style.text(),
      size: e,
      textSize: e,
      sizeMultiplier: wr[e - 1]
    });
  }
  /**
   * Like `this.havingSize(BASESIZE).havingStyle(style)`. If `style` is omitted,
   * changes to at least `\textstyle`.
   */
  havingBaseStyle(e) {
    e = e || this.style.text();
    var t = xr(r0.BASESIZE, e);
    return this.size === t && this.textSize === r0.BASESIZE && this.style === e ? this : this.extend({
      style: e,
      size: t
    });
  }
  /**
   * Remove the effect of sizing changes such as \Huge.
   * Keep the effect of the current style, such as \scriptstyle.
   */
  havingBaseSizing() {
    var e;
    switch (this.style.id) {
      case 4:
      case 5:
        e = 3;
        break;
      case 6:
      case 7:
        e = 1;
        break;
      default:
        e = 6;
    }
    return this.extend({
      style: this.style.text(),
      size: e
    });
  }
  /**
   * Create a new options object with the given color.
   */
  withColor(e) {
    return this.extend({
      color: e
    });
  }
  /**
   * Create a new options object with "phantom" set to true.
   */
  withPhantom() {
    return this.extend({
      phantom: true
    });
  }
  /**
   * Creates a new options object with the given math font or old text font.
   * @type {[type]}
   */
  withFont(e) {
    return this.extend({
      font: e
    });
  }
  /**
   * Create a new options objects with the given fontFamily.
   */
  withTextFontFamily(e) {
    return this.extend({
      fontFamily: e,
      font: ""
    });
  }
  /**
   * Creates a new options object with the given font weight
   */
  withTextFontWeight(e) {
    return this.extend({
      fontWeight: e,
      font: ""
    });
  }
  /**
   * Creates a new options object with the given font weight
   */
  withTextFontShape(e) {
    return this.extend({
      fontShape: e,
      font: ""
    });
  }
  /**
   * Return the CSS sizing classes required to switch from enclosing options
   * `oldOptions` to `this`. Returns an array of classes.
   */
  sizingClasses(e) {
    return e.size !== this.size ? ["sizing", "reset-size" + e.size, "size" + this.size] : [];
  }
  /**
   * Return the CSS sizing classes required to switch to the base size. Like
   * `this.havingSize(BASESIZE).sizingClasses(this)`.
   */
  baseSizingClasses() {
    return this.size !== r0.BASESIZE ? ["sizing", "reset-size" + this.size, "size" + r0.BASESIZE] : [];
  }
  /**
   * Return the font metrics for this size.
   */
  fontMetrics() {
    return this._fontMetrics || (this._fontMetrics = Zn(this.size)), this._fontMetrics;
  }
  /**
   * Gets the CSS color of the current options object
   */
  getColor() {
    return this.phantom ? "transparent" : this.color;
  }
}
r0.BASESIZE = 6;
var Lt = {
  // https://en.wikibooks.org/wiki/LaTeX/Lengths and
  // https://tex.stackexchange.com/a/8263
  pt: 1,
  // TeX point
  mm: 7227 / 2540,
  // millimeter
  cm: 7227 / 254,
  // centimeter
  in: 72.27,
  // inch
  bp: 803 / 800,
  // big (PostScript) points
  pc: 12,
  // pica
  dd: 1238 / 1157,
  // didot
  cc: 14856 / 1157,
  // cicero (12 didot)
  nd: 685 / 642,
  // new didot
  nc: 1370 / 107,
  // new cicero (12 new didot)
  sp: 1 / 65536,
  // scaled point (TeX's internal smallest unit)
  // https://tex.stackexchange.com/a/41371
  px: 803 / 800
  // \pdfpxdimen defaults to 1 bp in pdfTeX and LuaTeX
}, Jn = {
  ex: true,
  em: true,
  mu: true
}, ma = function(e) {
  return typeof e != "string" && (e = e.unit), e in Lt || e in Jn || e === "ex";
}, pe = function(e, t) {
  var a;
  if (e.unit in Lt)
    a = Lt[e.unit] / t.fontMetrics().ptPerEm / t.sizeMultiplier;
  else if (e.unit === "mu")
    a = t.fontMetrics().cssEmPerMu;
  else {
    var n;
    if (t.style.isTight() ? n = t.havingStyle(t.style.text()) : n = t, e.unit === "ex")
      a = n.fontMetrics().xHeight;
    else if (e.unit === "em")
      a = n.fontMetrics().quad;
    else
      throw new L("Invalid unit: '" + e.unit + "'");
    n !== t && (a *= n.sizeMultiplier / t.sizeMultiplier);
  }
  return Math.min(e.number * a, t.maxSize);
}, $ = function(e) {
  return +e.toFixed(4) + "em";
}, h0 = function(e) {
  return e.filter((t) => t).join(" ");
}, pa = function(e, t, a) {
  if (this.classes = e || [], this.attributes = {}, this.height = 0, this.depth = 0, this.maxFontSize = 0, this.style = a || {}, t) {
    t.style.isTight() && this.classes.push("mtight");
    var n = t.getColor();
    n && (this.style.color = n);
  }
}, fa = function(e) {
  var t = (void 0).createElement(e);
  t.className = h0(this.classes);
  for (var a in this.style)
    this.style.hasOwnProperty(a) && (t.style[a] = this.style[a]);
  for (var n in this.attributes)
    this.attributes.hasOwnProperty(n) && t.setAttribute(n, this.attributes[n]);
  for (var i = 0; i < this.children.length; i++)
    t.appendChild(this.children[i].toNode());
  return t;
}, ga = function(e) {
  var t = "<" + e;
  this.classes.length && (t += ' class="' + W.escape(h0(this.classes)) + '"');
  var a = "";
  for (var n in this.style)
    this.style.hasOwnProperty(n) && (a += W.hyphenate(n) + ":" + this.style[n] + ";");
  a && (t += ' style="' + W.escape(a) + '"');
  for (var i in this.attributes)
    this.attributes.hasOwnProperty(i) && (t += " " + i + '="' + W.escape(this.attributes[i]) + '"');
  t += ">";
  for (var o = 0; o < this.children.length; o++)
    t += this.children[o].toMarkup();
  return t += "</" + e + ">", t;
};
class F0 {
  constructor(e, t, a, n) {
    this.children = void 0, this.attributes = void 0, this.classes = void 0, this.height = void 0, this.depth = void 0, this.width = void 0, this.maxFontSize = void 0, this.style = void 0, pa.call(this, e, a, n), this.children = t || [];
  }
  /**
   * Sets an arbitrary attribute on the span. Warning: use this wisely. Not
   * all browsers support attributes the same, and having too many custom
   * attributes is probably bad.
   */
  setAttribute(e, t) {
    this.attributes[e] = t;
  }
  hasClass(e) {
    return W.contains(this.classes, e);
  }
  toNode() {
    return fa.call(this, "span");
  }
  toMarkup() {
    return ga.call(this, "span");
  }
}
class Zt {
  constructor(e, t, a, n) {
    this.children = void 0, this.attributes = void 0, this.classes = void 0, this.height = void 0, this.depth = void 0, this.maxFontSize = void 0, this.style = void 0, pa.call(this, t, n), this.children = a || [], this.setAttribute("href", e);
  }
  setAttribute(e, t) {
    this.attributes[e] = t;
  }
  hasClass(e) {
    return W.contains(this.classes, e);
  }
  toNode() {
    return fa.call(this, "a");
  }
  toMarkup() {
    return ga.call(this, "a");
  }
}
class Qn {
  constructor(e, t, a) {
    this.src = void 0, this.alt = void 0, this.classes = void 0, this.height = void 0, this.depth = void 0, this.maxFontSize = void 0, this.style = void 0, this.alt = t, this.src = e, this.classes = ["mord"], this.style = a;
  }
  hasClass(e) {
    return W.contains(this.classes, e);
  }
  toNode() {
    var e = (void 0).createElement("img");
    e.src = this.src, e.alt = this.alt, e.className = "mord";
    for (var t in this.style)
      this.style.hasOwnProperty(t) && (e.style[t] = this.style[t]);
    return e;
  }
  toMarkup() {
    var e = "<img  src='" + this.src + " 'alt='" + this.alt + "' ", t = "";
    for (var a in this.style)
      this.style.hasOwnProperty(a) && (t += W.hyphenate(a) + ":" + this.style[a] + ";");
    return t && (e += ' style="' + W.escape(t) + '"'), e += "'/>", e;
  }
}
var ei = {
  î: "ı̂",
  ï: "ı̈",
  í: "ı́",
  // 'ī': '\u0131\u0304', // enable when we add Extended Latin
  ì: "ı̀"
};
class Ge {
  constructor(e, t, a, n, i, o, u, c) {
    this.text = void 0, this.height = void 0, this.depth = void 0, this.italic = void 0, this.skew = void 0, this.width = void 0, this.maxFontSize = void 0, this.classes = void 0, this.style = void 0, this.text = e, this.height = t || 0, this.depth = a || 0, this.italic = n || 0, this.skew = i || 0, this.width = o || 0, this.classes = u || [], this.style = c || {}, this.maxFontSize = 0;
    var m = Fn(this.text.charCodeAt(0));
    m && this.classes.push(m + "_fallback"), /[îïíì]/.test(this.text) && (this.text = ei[this.text]);
  }
  hasClass(e) {
    return W.contains(this.classes, e);
  }
  /**
   * Creates a text node or span from a symbol node. Note that a span is only
   * created if it is needed.
   */
  toNode() {
    var e = (void 0).createTextNode(this.text), t = null;
    this.italic > 0 && (t = (void 0).createElement("span"), t.style.marginRight = $(this.italic)), this.classes.length > 0 && (t = t || (void 0).createElement("span"), t.className = h0(this.classes));
    for (var a in this.style)
      this.style.hasOwnProperty(a) && (t = t || (void 0).createElement("span"), t.style[a] = this.style[a]);
    return t ? (t.appendChild(e), t) : e;
  }
  /**
   * Creates markup for a symbol node.
   */
  toMarkup() {
    var e = false, t = "<span";
    this.classes.length && (e = true, t += ' class="', t += W.escape(h0(this.classes)), t += '"');
    var a = "";
    this.italic > 0 && (a += "margin-right:" + this.italic + "em;");
    for (var n in this.style)
      this.style.hasOwnProperty(n) && (a += W.hyphenate(n) + ":" + this.style[n] + ";");
    a && (e = true, t += ' style="' + W.escape(a) + '"');
    var i = W.escape(this.text);
    return e ? (t += ">", t += i, t += "</span>", t) : i;
  }
}
class m0 {
  constructor(e, t) {
    this.children = void 0, this.attributes = void 0, this.children = e || [], this.attributes = t || {};
  }
  toNode() {
    var e = "http://www.w3.org/2000/svg", t = (void 0).createElementNS(e, "svg");
    for (var a in this.attributes)
      Object.prototype.hasOwnProperty.call(this.attributes, a) && t.setAttribute(a, this.attributes[a]);
    for (var n = 0; n < this.children.length; n++)
      t.appendChild(this.children[n].toNode());
    return t;
  }
  toMarkup() {
    var e = '<svg xmlns="http://www.w3.org/2000/svg"';
    for (var t in this.attributes)
      Object.prototype.hasOwnProperty.call(this.attributes, t) && (e += " " + t + "='" + this.attributes[t] + "'");
    e += ">";
    for (var a = 0; a < this.children.length; a++)
      e += this.children[a].toMarkup();
    return e += "</svg>", e;
  }
}
class w0 {
  constructor(e, t) {
    this.pathName = void 0, this.alternate = void 0, this.pathName = e, this.alternate = t;
  }
  toNode() {
    var e = "http://www.w3.org/2000/svg", t = (void 0).createElementNS(e, "path");
    return this.alternate ? t.setAttribute("d", this.alternate) : t.setAttribute("d", br[this.pathName]), t;
  }
  toMarkup() {
    return this.alternate ? "<path d='" + this.alternate + "'/>" : "<path d='" + br[this.pathName] + "'/>";
  }
}
class $t {
  constructor(e) {
    this.attributes = void 0, this.attributes = e || {};
  }
  toNode() {
    var e = "http://www.w3.org/2000/svg", t = (void 0).createElementNS(e, "line");
    for (var a in this.attributes)
      Object.prototype.hasOwnProperty.call(this.attributes, a) && t.setAttribute(a, this.attributes[a]);
    return t;
  }
  toMarkup() {
    var e = "<line";
    for (var t in this.attributes)
      Object.prototype.hasOwnProperty.call(this.attributes, t) && (e += " " + t + "='" + this.attributes[t] + "'");
    return e += "/>", e;
  }
}
function kr(r4) {
  if (r4 instanceof Ge)
    return r4;
  throw new Error("Expected symbolNode but got " + String(r4) + ".");
}
function ti(r4) {
  if (r4 instanceof F0)
    return r4;
  throw new Error("Expected span<HtmlDomNode> but got " + String(r4) + ".");
}
var ri = {
  bin: 1,
  close: 1,
  inner: 1,
  open: 1,
  punct: 1,
  rel: 1
}, ai = {
  "accent-token": 1,
  mathord: 1,
  "op-token": 1,
  spacing: 1,
  textord: 1
}, se = {
  math: {},
  text: {}
};
function s(r4, e, t, a, n, i) {
  se[r4][n] = {
    font: e,
    group: t,
    replace: a
  }, i && a && (se[r4][a] = se[r4][n]);
}
var l = "math", R = "text", d = "main", f = "ams", de = "accent-token", q = "bin", ze = "close", M0 = "inner", j = "mathord", be = "op-token", Be = "open", ct = "punct", g = "rel", l0 = "spacing", x = "textord";
s(l, d, g, "≡", "\\equiv", true);
s(l, d, g, "≺", "\\prec", true);
s(l, d, g, "≻", "\\succ", true);
s(l, d, g, "∼", "\\sim", true);
s(l, d, g, "⊥", "\\perp");
s(l, d, g, "⪯", "\\preceq", true);
s(l, d, g, "⪰", "\\succeq", true);
s(l, d, g, "≃", "\\simeq", true);
s(l, d, g, "∣", "\\mid", true);
s(l, d, g, "≪", "\\ll", true);
s(l, d, g, "≫", "\\gg", true);
s(l, d, g, "≍", "\\asymp", true);
s(l, d, g, "∥", "\\parallel");
s(l, d, g, "⋈", "\\bowtie", true);
s(l, d, g, "⌣", "\\smile", true);
s(l, d, g, "⊑", "\\sqsubseteq", true);
s(l, d, g, "⊒", "\\sqsupseteq", true);
s(l, d, g, "≐", "\\doteq", true);
s(l, d, g, "⌢", "\\frown", true);
s(l, d, g, "∋", "\\ni", true);
s(l, d, g, "∝", "\\propto", true);
s(l, d, g, "⊢", "\\vdash", true);
s(l, d, g, "⊣", "\\dashv", true);
s(l, d, g, "∋", "\\owns");
s(l, d, ct, ".", "\\ldotp");
s(l, d, ct, "⋅", "\\cdotp");
s(l, d, x, "#", "\\#");
s(R, d, x, "#", "\\#");
s(l, d, x, "&", "\\&");
s(R, d, x, "&", "\\&");
s(l, d, x, "ℵ", "\\aleph", true);
s(l, d, x, "∀", "\\forall", true);
s(l, d, x, "ℏ", "\\hbar", true);
s(l, d, x, "∃", "\\exists", true);
s(l, d, x, "∇", "\\nabla", true);
s(l, d, x, "♭", "\\flat", true);
s(l, d, x, "ℓ", "\\ell", true);
s(l, d, x, "♮", "\\natural", true);
s(l, d, x, "♣", "\\clubsuit", true);
s(l, d, x, "℘", "\\wp", true);
s(l, d, x, "♯", "\\sharp", true);
s(l, d, x, "♢", "\\diamondsuit", true);
s(l, d, x, "ℜ", "\\Re", true);
s(l, d, x, "♡", "\\heartsuit", true);
s(l, d, x, "ℑ", "\\Im", true);
s(l, d, x, "♠", "\\spadesuit", true);
s(l, d, x, "§", "\\S", true);
s(R, d, x, "§", "\\S");
s(l, d, x, "¶", "\\P", true);
s(R, d, x, "¶", "\\P");
s(l, d, x, "†", "\\dag");
s(R, d, x, "†", "\\dag");
s(R, d, x, "†", "\\textdagger");
s(l, d, x, "‡", "\\ddag");
s(R, d, x, "‡", "\\ddag");
s(R, d, x, "‡", "\\textdaggerdbl");
s(l, d, ze, "⎱", "\\rmoustache", true);
s(l, d, Be, "⎰", "\\lmoustache", true);
s(l, d, ze, "⟯", "\\rgroup", true);
s(l, d, Be, "⟮", "\\lgroup", true);
s(l, d, q, "∓", "\\mp", true);
s(l, d, q, "⊖", "\\ominus", true);
s(l, d, q, "⊎", "\\uplus", true);
s(l, d, q, "⊓", "\\sqcap", true);
s(l, d, q, "∗", "\\ast");
s(l, d, q, "⊔", "\\sqcup", true);
s(l, d, q, "◯", "\\bigcirc", true);
s(l, d, q, "∙", "\\bullet", true);
s(l, d, q, "‡", "\\ddagger");
s(l, d, q, "≀", "\\wr", true);
s(l, d, q, "⨿", "\\amalg");
s(l, d, q, "&", "\\And");
s(l, d, g, "⟵", "\\longleftarrow", true);
s(l, d, g, "⇐", "\\Leftarrow", true);
s(l, d, g, "⟸", "\\Longleftarrow", true);
s(l, d, g, "⟶", "\\longrightarrow", true);
s(l, d, g, "⇒", "\\Rightarrow", true);
s(l, d, g, "⟹", "\\Longrightarrow", true);
s(l, d, g, "↔", "\\leftrightarrow", true);
s(l, d, g, "⟷", "\\longleftrightarrow", true);
s(l, d, g, "⇔", "\\Leftrightarrow", true);
s(l, d, g, "⟺", "\\Longleftrightarrow", true);
s(l, d, g, "↦", "\\mapsto", true);
s(l, d, g, "⟼", "\\longmapsto", true);
s(l, d, g, "↗", "\\nearrow", true);
s(l, d, g, "↩", "\\hookleftarrow", true);
s(l, d, g, "↪", "\\hookrightarrow", true);
s(l, d, g, "↘", "\\searrow", true);
s(l, d, g, "↼", "\\leftharpoonup", true);
s(l, d, g, "⇀", "\\rightharpoonup", true);
s(l, d, g, "↙", "\\swarrow", true);
s(l, d, g, "↽", "\\leftharpoondown", true);
s(l, d, g, "⇁", "\\rightharpoondown", true);
s(l, d, g, "↖", "\\nwarrow", true);
s(l, d, g, "⇌", "\\rightleftharpoons", true);
s(l, f, g, "≮", "\\nless", true);
s(l, f, g, "", "\\@nleqslant");
s(l, f, g, "", "\\@nleqq");
s(l, f, g, "⪇", "\\lneq", true);
s(l, f, g, "≨", "\\lneqq", true);
s(l, f, g, "", "\\@lvertneqq");
s(l, f, g, "⋦", "\\lnsim", true);
s(l, f, g, "⪉", "\\lnapprox", true);
s(l, f, g, "⊀", "\\nprec", true);
s(l, f, g, "⋠", "\\npreceq", true);
s(l, f, g, "⋨", "\\precnsim", true);
s(l, f, g, "⪹", "\\precnapprox", true);
s(l, f, g, "≁", "\\nsim", true);
s(l, f, g, "", "\\@nshortmid");
s(l, f, g, "∤", "\\nmid", true);
s(l, f, g, "⊬", "\\nvdash", true);
s(l, f, g, "⊭", "\\nvDash", true);
s(l, f, g, "⋪", "\\ntriangleleft");
s(l, f, g, "⋬", "\\ntrianglelefteq", true);
s(l, f, g, "⊊", "\\subsetneq", true);
s(l, f, g, "", "\\@varsubsetneq");
s(l, f, g, "⫋", "\\subsetneqq", true);
s(l, f, g, "", "\\@varsubsetneqq");
s(l, f, g, "≯", "\\ngtr", true);
s(l, f, g, "", "\\@ngeqslant");
s(l, f, g, "", "\\@ngeqq");
s(l, f, g, "⪈", "\\gneq", true);
s(l, f, g, "≩", "\\gneqq", true);
s(l, f, g, "", "\\@gvertneqq");
s(l, f, g, "⋧", "\\gnsim", true);
s(l, f, g, "⪊", "\\gnapprox", true);
s(l, f, g, "⊁", "\\nsucc", true);
s(l, f, g, "⋡", "\\nsucceq", true);
s(l, f, g, "⋩", "\\succnsim", true);
s(l, f, g, "⪺", "\\succnapprox", true);
s(l, f, g, "≆", "\\ncong", true);
s(l, f, g, "", "\\@nshortparallel");
s(l, f, g, "∦", "\\nparallel", true);
s(l, f, g, "⊯", "\\nVDash", true);
s(l, f, g, "⋫", "\\ntriangleright");
s(l, f, g, "⋭", "\\ntrianglerighteq", true);
s(l, f, g, "", "\\@nsupseteqq");
s(l, f, g, "⊋", "\\supsetneq", true);
s(l, f, g, "", "\\@varsupsetneq");
s(l, f, g, "⫌", "\\supsetneqq", true);
s(l, f, g, "", "\\@varsupsetneqq");
s(l, f, g, "⊮", "\\nVdash", true);
s(l, f, g, "⪵", "\\precneqq", true);
s(l, f, g, "⪶", "\\succneqq", true);
s(l, f, g, "", "\\@nsubseteqq");
s(l, f, q, "⊴", "\\unlhd");
s(l, f, q, "⊵", "\\unrhd");
s(l, f, g, "↚", "\\nleftarrow", true);
s(l, f, g, "↛", "\\nrightarrow", true);
s(l, f, g, "⇍", "\\nLeftarrow", true);
s(l, f, g, "⇏", "\\nRightarrow", true);
s(l, f, g, "↮", "\\nleftrightarrow", true);
s(l, f, g, "⇎", "\\nLeftrightarrow", true);
s(l, f, g, "△", "\\vartriangle");
s(l, f, x, "ℏ", "\\hslash");
s(l, f, x, "▽", "\\triangledown");
s(l, f, x, "◊", "\\lozenge");
s(l, f, x, "Ⓢ", "\\circledS");
s(l, f, x, "®", "\\circledR");
s(R, f, x, "®", "\\circledR");
s(l, f, x, "∡", "\\measuredangle", true);
s(l, f, x, "∄", "\\nexists");
s(l, f, x, "℧", "\\mho");
s(l, f, x, "Ⅎ", "\\Finv", true);
s(l, f, x, "⅁", "\\Game", true);
s(l, f, x, "‵", "\\backprime");
s(l, f, x, "▲", "\\blacktriangle");
s(l, f, x, "▼", "\\blacktriangledown");
s(l, f, x, "■", "\\blacksquare");
s(l, f, x, "⧫", "\\blacklozenge");
s(l, f, x, "★", "\\bigstar");
s(l, f, x, "∢", "\\sphericalangle", true);
s(l, f, x, "∁", "\\complement", true);
s(l, f, x, "ð", "\\eth", true);
s(R, d, x, "ð", "ð");
s(l, f, x, "╱", "\\diagup");
s(l, f, x, "╲", "\\diagdown");
s(l, f, x, "□", "\\square");
s(l, f, x, "□", "\\Box");
s(l, f, x, "◊", "\\Diamond");
s(l, f, x, "¥", "\\yen", true);
s(R, f, x, "¥", "\\yen", true);
s(l, f, x, "✓", "\\checkmark", true);
s(R, f, x, "✓", "\\checkmark");
s(l, f, x, "ℶ", "\\beth", true);
s(l, f, x, "ℸ", "\\daleth", true);
s(l, f, x, "ℷ", "\\gimel", true);
s(l, f, x, "ϝ", "\\digamma", true);
s(l, f, x, "ϰ", "\\varkappa");
s(l, f, Be, "┌", "\\@ulcorner", true);
s(l, f, ze, "┐", "\\@urcorner", true);
s(l, f, Be, "└", "\\@llcorner", true);
s(l, f, ze, "┘", "\\@lrcorner", true);
s(l, f, g, "≦", "\\leqq", true);
s(l, f, g, "⩽", "\\leqslant", true);
s(l, f, g, "⪕", "\\eqslantless", true);
s(l, f, g, "≲", "\\lesssim", true);
s(l, f, g, "⪅", "\\lessapprox", true);
s(l, f, g, "≊", "\\approxeq", true);
s(l, f, q, "⋖", "\\lessdot");
s(l, f, g, "⋘", "\\lll", true);
s(l, f, g, "≶", "\\lessgtr", true);
s(l, f, g, "⋚", "\\lesseqgtr", true);
s(l, f, g, "⪋", "\\lesseqqgtr", true);
s(l, f, g, "≑", "\\doteqdot");
s(l, f, g, "≓", "\\risingdotseq", true);
s(l, f, g, "≒", "\\fallingdotseq", true);
s(l, f, g, "∽", "\\backsim", true);
s(l, f, g, "⋍", "\\backsimeq", true);
s(l, f, g, "⫅", "\\subseteqq", true);
s(l, f, g, "⋐", "\\Subset", true);
s(l, f, g, "⊏", "\\sqsubset", true);
s(l, f, g, "≼", "\\preccurlyeq", true);
s(l, f, g, "⋞", "\\curlyeqprec", true);
s(l, f, g, "≾", "\\precsim", true);
s(l, f, g, "⪷", "\\precapprox", true);
s(l, f, g, "⊲", "\\vartriangleleft");
s(l, f, g, "⊴", "\\trianglelefteq");
s(l, f, g, "⊨", "\\vDash", true);
s(l, f, g, "⊪", "\\Vvdash", true);
s(l, f, g, "⌣", "\\smallsmile");
s(l, f, g, "⌢", "\\smallfrown");
s(l, f, g, "≏", "\\bumpeq", true);
s(l, f, g, "≎", "\\Bumpeq", true);
s(l, f, g, "≧", "\\geqq", true);
s(l, f, g, "⩾", "\\geqslant", true);
s(l, f, g, "⪖", "\\eqslantgtr", true);
s(l, f, g, "≳", "\\gtrsim", true);
s(l, f, g, "⪆", "\\gtrapprox", true);
s(l, f, q, "⋗", "\\gtrdot");
s(l, f, g, "⋙", "\\ggg", true);
s(l, f, g, "≷", "\\gtrless", true);
s(l, f, g, "⋛", "\\gtreqless", true);
s(l, f, g, "⪌", "\\gtreqqless", true);
s(l, f, g, "≖", "\\eqcirc", true);
s(l, f, g, "≗", "\\circeq", true);
s(l, f, g, "≜", "\\triangleq", true);
s(l, f, g, "∼", "\\thicksim");
s(l, f, g, "≈", "\\thickapprox");
s(l, f, g, "⫆", "\\supseteqq", true);
s(l, f, g, "⋑", "\\Supset", true);
s(l, f, g, "⊐", "\\sqsupset", true);
s(l, f, g, "≽", "\\succcurlyeq", true);
s(l, f, g, "⋟", "\\curlyeqsucc", true);
s(l, f, g, "≿", "\\succsim", true);
s(l, f, g, "⪸", "\\succapprox", true);
s(l, f, g, "⊳", "\\vartriangleright");
s(l, f, g, "⊵", "\\trianglerighteq");
s(l, f, g, "⊩", "\\Vdash", true);
s(l, f, g, "∣", "\\shortmid");
s(l, f, g, "∥", "\\shortparallel");
s(l, f, g, "≬", "\\between", true);
s(l, f, g, "⋔", "\\pitchfork", true);
s(l, f, g, "∝", "\\varpropto");
s(l, f, g, "◀", "\\blacktriangleleft");
s(l, f, g, "∴", "\\therefore", true);
s(l, f, g, "∍", "\\backepsilon");
s(l, f, g, "▶", "\\blacktriangleright");
s(l, f, g, "∵", "\\because", true);
s(l, f, g, "⋘", "\\llless");
s(l, f, g, "⋙", "\\gggtr");
s(l, f, q, "⊲", "\\lhd");
s(l, f, q, "⊳", "\\rhd");
s(l, f, g, "≂", "\\eqsim", true);
s(l, d, g, "⋈", "\\Join");
s(l, f, g, "≑", "\\Doteq", true);
s(l, f, q, "∔", "\\dotplus", true);
s(l, f, q, "∖", "\\smallsetminus");
s(l, f, q, "⋒", "\\Cap", true);
s(l, f, q, "⋓", "\\Cup", true);
s(l, f, q, "⩞", "\\doublebarwedge", true);
s(l, f, q, "⊟", "\\boxminus", true);
s(l, f, q, "⊞", "\\boxplus", true);
s(l, f, q, "⋇", "\\divideontimes", true);
s(l, f, q, "⋉", "\\ltimes", true);
s(l, f, q, "⋊", "\\rtimes", true);
s(l, f, q, "⋋", "\\leftthreetimes", true);
s(l, f, q, "⋌", "\\rightthreetimes", true);
s(l, f, q, "⋏", "\\curlywedge", true);
s(l, f, q, "⋎", "\\curlyvee", true);
s(l, f, q, "⊝", "\\circleddash", true);
s(l, f, q, "⊛", "\\circledast", true);
s(l, f, q, "⋅", "\\centerdot");
s(l, f, q, "⊺", "\\intercal", true);
s(l, f, q, "⋒", "\\doublecap");
s(l, f, q, "⋓", "\\doublecup");
s(l, f, q, "⊠", "\\boxtimes", true);
s(l, f, g, "⇢", "\\dashrightarrow", true);
s(l, f, g, "⇠", "\\dashleftarrow", true);
s(l, f, g, "⇇", "\\leftleftarrows", true);
s(l, f, g, "⇆", "\\leftrightarrows", true);
s(l, f, g, "⇚", "\\Lleftarrow", true);
s(l, f, g, "↞", "\\twoheadleftarrow", true);
s(l, f, g, "↢", "\\leftarrowtail", true);
s(l, f, g, "↫", "\\looparrowleft", true);
s(l, f, g, "⇋", "\\leftrightharpoons", true);
s(l, f, g, "↶", "\\curvearrowleft", true);
s(l, f, g, "↺", "\\circlearrowleft", true);
s(l, f, g, "↰", "\\Lsh", true);
s(l, f, g, "⇈", "\\upuparrows", true);
s(l, f, g, "↿", "\\upharpoonleft", true);
s(l, f, g, "⇃", "\\downharpoonleft", true);
s(l, d, g, "⊶", "\\origof", true);
s(l, d, g, "⊷", "\\imageof", true);
s(l, f, g, "⊸", "\\multimap", true);
s(l, f, g, "↭", "\\leftrightsquigarrow", true);
s(l, f, g, "⇉", "\\rightrightarrows", true);
s(l, f, g, "⇄", "\\rightleftarrows", true);
s(l, f, g, "↠", "\\twoheadrightarrow", true);
s(l, f, g, "↣", "\\rightarrowtail", true);
s(l, f, g, "↬", "\\looparrowright", true);
s(l, f, g, "↷", "\\curvearrowright", true);
s(l, f, g, "↻", "\\circlearrowright", true);
s(l, f, g, "↱", "\\Rsh", true);
s(l, f, g, "⇊", "\\downdownarrows", true);
s(l, f, g, "↾", "\\upharpoonright", true);
s(l, f, g, "⇂", "\\downharpoonright", true);
s(l, f, g, "⇝", "\\rightsquigarrow", true);
s(l, f, g, "⇝", "\\leadsto");
s(l, f, g, "⇛", "\\Rrightarrow", true);
s(l, f, g, "↾", "\\restriction");
s(l, d, x, "‘", "`");
s(l, d, x, "$", "\\$");
s(R, d, x, "$", "\\$");
s(R, d, x, "$", "\\textdollar");
s(l, d, x, "%", "\\%");
s(R, d, x, "%", "\\%");
s(l, d, x, "_", "\\_");
s(R, d, x, "_", "\\_");
s(R, d, x, "_", "\\textunderscore");
s(l, d, x, "∠", "\\angle", true);
s(l, d, x, "∞", "\\infty", true);
s(l, d, x, "′", "\\prime");
s(l, d, x, "△", "\\triangle");
s(l, d, x, "Γ", "\\Gamma", true);
s(l, d, x, "Δ", "\\Delta", true);
s(l, d, x, "Θ", "\\Theta", true);
s(l, d, x, "Λ", "\\Lambda", true);
s(l, d, x, "Ξ", "\\Xi", true);
s(l, d, x, "Π", "\\Pi", true);
s(l, d, x, "Σ", "\\Sigma", true);
s(l, d, x, "Υ", "\\Upsilon", true);
s(l, d, x, "Φ", "\\Phi", true);
s(l, d, x, "Ψ", "\\Psi", true);
s(l, d, x, "Ω", "\\Omega", true);
s(l, d, x, "A", "Α");
s(l, d, x, "B", "Β");
s(l, d, x, "E", "Ε");
s(l, d, x, "Z", "Ζ");
s(l, d, x, "H", "Η");
s(l, d, x, "I", "Ι");
s(l, d, x, "K", "Κ");
s(l, d, x, "M", "Μ");
s(l, d, x, "N", "Ν");
s(l, d, x, "O", "Ο");
s(l, d, x, "P", "Ρ");
s(l, d, x, "T", "Τ");
s(l, d, x, "X", "Χ");
s(l, d, x, "¬", "\\neg", true);
s(l, d, x, "¬", "\\lnot");
s(l, d, x, "⊤", "\\top");
s(l, d, x, "⊥", "\\bot");
s(l, d, x, "∅", "\\emptyset");
s(l, f, x, "∅", "\\varnothing");
s(l, d, j, "α", "\\alpha", true);
s(l, d, j, "β", "\\beta", true);
s(l, d, j, "γ", "\\gamma", true);
s(l, d, j, "δ", "\\delta", true);
s(l, d, j, "ϵ", "\\epsilon", true);
s(l, d, j, "ζ", "\\zeta", true);
s(l, d, j, "η", "\\eta", true);
s(l, d, j, "θ", "\\theta", true);
s(l, d, j, "ι", "\\iota", true);
s(l, d, j, "κ", "\\kappa", true);
s(l, d, j, "λ", "\\lambda", true);
s(l, d, j, "μ", "\\mu", true);
s(l, d, j, "ν", "\\nu", true);
s(l, d, j, "ξ", "\\xi", true);
s(l, d, j, "ο", "\\omicron", true);
s(l, d, j, "π", "\\pi", true);
s(l, d, j, "ρ", "\\rho", true);
s(l, d, j, "σ", "\\sigma", true);
s(l, d, j, "τ", "\\tau", true);
s(l, d, j, "υ", "\\upsilon", true);
s(l, d, j, "ϕ", "\\phi", true);
s(l, d, j, "χ", "\\chi", true);
s(l, d, j, "ψ", "\\psi", true);
s(l, d, j, "ω", "\\omega", true);
s(l, d, j, "ε", "\\varepsilon", true);
s(l, d, j, "ϑ", "\\vartheta", true);
s(l, d, j, "ϖ", "\\varpi", true);
s(l, d, j, "ϱ", "\\varrho", true);
s(l, d, j, "ς", "\\varsigma", true);
s(l, d, j, "φ", "\\varphi", true);
s(l, d, q, "∗", "*", true);
s(l, d, q, "+", "+");
s(l, d, q, "−", "-", true);
s(l, d, q, "⋅", "\\cdot", true);
s(l, d, q, "∘", "\\circ", true);
s(l, d, q, "÷", "\\div", true);
s(l, d, q, "±", "\\pm", true);
s(l, d, q, "×", "\\times", true);
s(l, d, q, "∩", "\\cap", true);
s(l, d, q, "∪", "\\cup", true);
s(l, d, q, "∖", "\\setminus", true);
s(l, d, q, "∧", "\\land");
s(l, d, q, "∨", "\\lor");
s(l, d, q, "∧", "\\wedge", true);
s(l, d, q, "∨", "\\vee", true);
s(l, d, x, "√", "\\surd");
s(l, d, Be, "⟨", "\\langle", true);
s(l, d, Be, "∣", "\\lvert");
s(l, d, Be, "∥", "\\lVert");
s(l, d, ze, "?", "?");
s(l, d, ze, "!", "!");
s(l, d, ze, "⟩", "\\rangle", true);
s(l, d, ze, "∣", "\\rvert");
s(l, d, ze, "∥", "\\rVert");
s(l, d, g, "=", "=");
s(l, d, g, ":", ":");
s(l, d, g, "≈", "\\approx", true);
s(l, d, g, "≅", "\\cong", true);
s(l, d, g, "≥", "\\ge");
s(l, d, g, "≥", "\\geq", true);
s(l, d, g, "←", "\\gets");
s(l, d, g, ">", "\\gt", true);
s(l, d, g, "∈", "\\in", true);
s(l, d, g, "", "\\@not");
s(l, d, g, "⊂", "\\subset", true);
s(l, d, g, "⊃", "\\supset", true);
s(l, d, g, "⊆", "\\subseteq", true);
s(l, d, g, "⊇", "\\supseteq", true);
s(l, f, g, "⊈", "\\nsubseteq", true);
s(l, f, g, "⊉", "\\nsupseteq", true);
s(l, d, g, "⊨", "\\models");
s(l, d, g, "←", "\\leftarrow", true);
s(l, d, g, "≤", "\\le");
s(l, d, g, "≤", "\\leq", true);
s(l, d, g, "<", "\\lt", true);
s(l, d, g, "→", "\\rightarrow", true);
s(l, d, g, "→", "\\to");
s(l, f, g, "≱", "\\ngeq", true);
s(l, f, g, "≰", "\\nleq", true);
s(l, d, l0, " ", "\\ ");
s(l, d, l0, " ", "\\space");
s(l, d, l0, " ", "\\nobreakspace");
s(R, d, l0, " ", "\\ ");
s(R, d, l0, " ", " ");
s(R, d, l0, " ", "\\space");
s(R, d, l0, " ", "\\nobreakspace");
s(l, d, l0, null, "\\nobreak");
s(l, d, l0, null, "\\allowbreak");
s(l, d, ct, ",", ",");
s(l, d, ct, ";", ";");
s(l, f, q, "⊼", "\\barwedge", true);
s(l, f, q, "⊻", "\\veebar", true);
s(l, d, q, "⊙", "\\odot", true);
s(l, d, q, "⊕", "\\oplus", true);
s(l, d, q, "⊗", "\\otimes", true);
s(l, d, x, "∂", "\\partial", true);
s(l, d, q, "⊘", "\\oslash", true);
s(l, f, q, "⊚", "\\circledcirc", true);
s(l, f, q, "⊡", "\\boxdot", true);
s(l, d, q, "△", "\\bigtriangleup");
s(l, d, q, "▽", "\\bigtriangledown");
s(l, d, q, "†", "\\dagger");
s(l, d, q, "⋄", "\\diamond");
s(l, d, q, "⋆", "\\star");
s(l, d, q, "◃", "\\triangleleft");
s(l, d, q, "▹", "\\triangleright");
s(l, d, Be, "{", "\\{");
s(R, d, x, "{", "\\{");
s(R, d, x, "{", "\\textbraceleft");
s(l, d, ze, "}", "\\}");
s(R, d, x, "}", "\\}");
s(R, d, x, "}", "\\textbraceright");
s(l, d, Be, "{", "\\lbrace");
s(l, d, ze, "}", "\\rbrace");
s(l, d, Be, "[", "\\lbrack", true);
s(R, d, x, "[", "\\lbrack", true);
s(l, d, ze, "]", "\\rbrack", true);
s(R, d, x, "]", "\\rbrack", true);
s(l, d, Be, "(", "\\lparen", true);
s(l, d, ze, ")", "\\rparen", true);
s(R, d, x, "<", "\\textless", true);
s(R, d, x, ">", "\\textgreater", true);
s(l, d, Be, "⌊", "\\lfloor", true);
s(l, d, ze, "⌋", "\\rfloor", true);
s(l, d, Be, "⌈", "\\lceil", true);
s(l, d, ze, "⌉", "\\rceil", true);
s(l, d, x, "\\", "\\backslash");
s(l, d, x, "∣", "|");
s(l, d, x, "∣", "\\vert");
s(R, d, x, "|", "\\textbar", true);
s(l, d, x, "∥", "\\|");
s(l, d, x, "∥", "\\Vert");
s(R, d, x, "∥", "\\textbardbl");
s(R, d, x, "~", "\\textasciitilde");
s(R, d, x, "\\", "\\textbackslash");
s(R, d, x, "^", "\\textasciicircum");
s(l, d, g, "↑", "\\uparrow", true);
s(l, d, g, "⇑", "\\Uparrow", true);
s(l, d, g, "↓", "\\downarrow", true);
s(l, d, g, "⇓", "\\Downarrow", true);
s(l, d, g, "↕", "\\updownarrow", true);
s(l, d, g, "⇕", "\\Updownarrow", true);
s(l, d, be, "∐", "\\coprod");
s(l, d, be, "⋁", "\\bigvee");
s(l, d, be, "⋀", "\\bigwedge");
s(l, d, be, "⨄", "\\biguplus");
s(l, d, be, "⋂", "\\bigcap");
s(l, d, be, "⋃", "\\bigcup");
s(l, d, be, "∫", "\\int");
s(l, d, be, "∫", "\\intop");
s(l, d, be, "∬", "\\iint");
s(l, d, be, "∭", "\\iiint");
s(l, d, be, "∏", "\\prod");
s(l, d, be, "∑", "\\sum");
s(l, d, be, "⨂", "\\bigotimes");
s(l, d, be, "⨁", "\\bigoplus");
s(l, d, be, "⨀", "\\bigodot");
s(l, d, be, "∮", "\\oint");
s(l, d, be, "∯", "\\oiint");
s(l, d, be, "∰", "\\oiiint");
s(l, d, be, "⨆", "\\bigsqcup");
s(l, d, be, "∫", "\\smallint");
s(R, d, M0, "…", "\\textellipsis");
s(l, d, M0, "…", "\\mathellipsis");
s(R, d, M0, "…", "\\ldots", true);
s(l, d, M0, "…", "\\ldots", true);
s(l, d, M0, "⋯", "\\@cdots", true);
s(l, d, M0, "⋱", "\\ddots", true);
s(l, d, x, "⋮", "\\varvdots");
s(l, d, de, "ˊ", "\\acute");
s(l, d, de, "ˋ", "\\grave");
s(l, d, de, "¨", "\\ddot");
s(l, d, de, "~", "\\tilde");
s(l, d, de, "ˉ", "\\bar");
s(l, d, de, "˘", "\\breve");
s(l, d, de, "ˇ", "\\check");
s(l, d, de, "^", "\\hat");
s(l, d, de, "⃗", "\\vec");
s(l, d, de, "˙", "\\dot");
s(l, d, de, "˚", "\\mathring");
s(l, d, j, "", "\\@imath");
s(l, d, j, "", "\\@jmath");
s(l, d, x, "ı", "ı");
s(l, d, x, "ȷ", "ȷ");
s(R, d, x, "ı", "\\i", true);
s(R, d, x, "ȷ", "\\j", true);
s(R, d, x, "ß", "\\ss", true);
s(R, d, x, "æ", "\\ae", true);
s(R, d, x, "œ", "\\oe", true);
s(R, d, x, "ø", "\\o", true);
s(R, d, x, "Æ", "\\AE", true);
s(R, d, x, "Œ", "\\OE", true);
s(R, d, x, "Ø", "\\O", true);
s(R, d, de, "ˊ", "\\'");
s(R, d, de, "ˋ", "\\`");
s(R, d, de, "ˆ", "\\^");
s(R, d, de, "˜", "\\~");
s(R, d, de, "ˉ", "\\=");
s(R, d, de, "˘", "\\u");
s(R, d, de, "˙", "\\.");
s(R, d, de, "¸", "\\c");
s(R, d, de, "˚", "\\r");
s(R, d, de, "ˇ", "\\v");
s(R, d, de, "¨", '\\"');
s(R, d, de, "˝", "\\H");
s(R, d, de, "◯", "\\textcircled");
var va = {
  "--": true,
  "---": true,
  "``": true,
  "''": true
};
s(R, d, x, "–", "--", true);
s(R, d, x, "–", "\\textendash");
s(R, d, x, "—", "---", true);
s(R, d, x, "—", "\\textemdash");
s(R, d, x, "‘", "`", true);
s(R, d, x, "‘", "\\textquoteleft");
s(R, d, x, "’", "'", true);
s(R, d, x, "’", "\\textquoteright");
s(R, d, x, "“", "``", true);
s(R, d, x, "“", "\\textquotedblleft");
s(R, d, x, "”", "''", true);
s(R, d, x, "”", "\\textquotedblright");
s(l, d, x, "°", "\\degree", true);
s(R, d, x, "°", "\\degree");
s(R, d, x, "°", "\\textdegree", true);
s(l, d, x, "£", "\\pounds");
s(l, d, x, "£", "\\mathsterling", true);
s(R, d, x, "£", "\\pounds");
s(R, d, x, "£", "\\textsterling", true);
s(l, f, x, "✠", "\\maltese");
s(R, f, x, "✠", "\\maltese");
var Sr = '0123456789/@."';
for (var wt = 0; wt < Sr.length; wt++) {
  var Ar = Sr.charAt(wt);
  s(l, d, x, Ar, Ar);
}
var Tr = '0123456789!@*()-=+";:?/.,';
for (var xt = 0; xt < Tr.length; xt++) {
  var _r = Tr.charAt(xt);
  s(R, d, x, _r, _r);
}
var nt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
for (var kt = 0; kt < nt.length; kt++) {
  var V0 = nt.charAt(kt);
  s(l, d, j, V0, V0), s(R, d, x, V0, V0);
}
s(l, f, x, "C", "ℂ");
s(R, f, x, "C", "ℂ");
s(l, f, x, "H", "ℍ");
s(R, f, x, "H", "ℍ");
s(l, f, x, "N", "ℕ");
s(R, f, x, "N", "ℕ");
s(l, f, x, "P", "ℙ");
s(R, f, x, "P", "ℙ");
s(l, f, x, "Q", "ℚ");
s(R, f, x, "Q", "ℚ");
s(l, f, x, "R", "ℝ");
s(R, f, x, "R", "ℝ");
s(l, f, x, "Z", "ℤ");
s(R, f, x, "Z", "ℤ");
s(l, d, j, "h", "ℎ");
s(R, d, j, "h", "ℎ");
var X = "";
for (var Ne = 0; Ne < nt.length; Ne++) {
  var ge = nt.charAt(Ne);
  X = String.fromCharCode(55349, 56320 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56372 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56424 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56580 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56736 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56788 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56840 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56944 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), Ne < 26 && (X = String.fromCharCode(55349, 56632 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X), X = String.fromCharCode(55349, 56476 + Ne), s(l, d, j, ge, X), s(R, d, x, ge, X));
}
X = String.fromCharCode(55349, 56668);
s(l, d, j, "k", X);
s(R, d, x, "k", X);
for (var b0 = 0; b0 < 10; b0++) {
  var c0 = b0.toString();
  X = String.fromCharCode(55349, 57294 + b0), s(l, d, j, c0, X), s(R, d, x, c0, X), X = String.fromCharCode(55349, 57314 + b0), s(l, d, j, c0, X), s(R, d, x, c0, X), X = String.fromCharCode(55349, 57324 + b0), s(l, d, j, c0, X), s(R, d, x, c0, X), X = String.fromCharCode(55349, 57334 + b0), s(l, d, j, c0, X), s(R, d, x, c0, X);
}
var Ft = "ÐÞþ";
for (var St = 0; St < Ft.length; St++) {
  var j0 = Ft.charAt(St);
  s(l, d, j, j0, j0), s(R, d, x, j0, j0);
}
var Y0 = [
  ["mathbf", "textbf", "Main-Bold"],
  // A-Z bold upright
  ["mathbf", "textbf", "Main-Bold"],
  // a-z bold upright
  ["mathnormal", "textit", "Math-Italic"],
  // A-Z italic
  ["mathnormal", "textit", "Math-Italic"],
  // a-z italic
  ["boldsymbol", "boldsymbol", "Main-BoldItalic"],
  // A-Z bold italic
  ["boldsymbol", "boldsymbol", "Main-BoldItalic"],
  // a-z bold italic
  // Map fancy A-Z letters to script, not calligraphic.
  // This aligns with unicode-math and math fonts (except Cambria Math).
  ["mathscr", "textscr", "Script-Regular"],
  // A-Z script
  ["", "", ""],
  // a-z script.  No font
  ["", "", ""],
  // A-Z bold script. No font
  ["", "", ""],
  // a-z bold script. No font
  ["mathfrak", "textfrak", "Fraktur-Regular"],
  // A-Z Fraktur
  ["mathfrak", "textfrak", "Fraktur-Regular"],
  // a-z Fraktur
  ["mathbb", "textbb", "AMS-Regular"],
  // A-Z double-struck
  ["mathbb", "textbb", "AMS-Regular"],
  // k double-struck
  ["", "", ""],
  // A-Z bold Fraktur No font metrics
  ["", "", ""],
  // a-z bold Fraktur.   No font.
  ["mathsf", "textsf", "SansSerif-Regular"],
  // A-Z sans-serif
  ["mathsf", "textsf", "SansSerif-Regular"],
  // a-z sans-serif
  ["mathboldsf", "textboldsf", "SansSerif-Bold"],
  // A-Z bold sans-serif
  ["mathboldsf", "textboldsf", "SansSerif-Bold"],
  // a-z bold sans-serif
  ["mathitsf", "textitsf", "SansSerif-Italic"],
  // A-Z italic sans-serif
  ["mathitsf", "textitsf", "SansSerif-Italic"],
  // a-z italic sans-serif
  ["", "", ""],
  // A-Z bold italic sans. No font
  ["", "", ""],
  // a-z bold italic sans. No font
  ["mathtt", "texttt", "Typewriter-Regular"],
  // A-Z monospace
  ["mathtt", "texttt", "Typewriter-Regular"]
  // a-z monospace
], Er = [
  ["mathbf", "textbf", "Main-Bold"],
  // 0-9 bold
  ["", "", ""],
  // 0-9 double-struck. No KaTeX font.
  ["mathsf", "textsf", "SansSerif-Regular"],
  // 0-9 sans-serif
  ["mathboldsf", "textboldsf", "SansSerif-Bold"],
  // 0-9 bold sans-serif
  ["mathtt", "texttt", "Typewriter-Regular"]
  // 0-9 monospace
], ni = function(e, t) {
  var a = e.charCodeAt(0), n = e.charCodeAt(1), i = (a - 55296) * 1024 + (n - 56320) + 65536, o = t === "math" ? 0 : 1;
  if (119808 <= i && i < 120484) {
    var u = Math.floor((i - 119808) / 26);
    return [Y0[u][2], Y0[u][o]];
  } else if (120782 <= i && i <= 120831) {
    var c = Math.floor((i - 120782) / 10);
    return [Er[c][2], Er[c][o]];
  } else {
    if (i === 120485 || i === 120486)
      return [Y0[0][2], Y0[0][o]];
    if (120486 < i && i < 120782)
      return ["", ""];
    throw new L("Unsupported character: " + e);
  }
}, dt = function(e, t, a) {
  return se[a][e] && se[a][e].replace && (e = se[a][e].replace), {
    value: e,
    metrics: Xt(e, t, a)
  };
}, je = function(e, t, a, n, i) {
  var o = dt(e, t, a), u = o.metrics;
  e = o.value;
  var c;
  if (u) {
    var m = u.italic;
    (a === "text" || n && n.font === "mathit") && (m = 0), c = new Ge(e, u.height, u.depth, m, u.skew, u.width, i);
  } else
    typeof console < "u" && console.warn("No character metrics " + ("for '" + e + "' in style '" + t + "' and mode '" + a + "'")), c = new Ge(e, 0, 0, 0, 0, 0, i);
  if (n) {
    c.maxFontSize = n.sizeMultiplier, n.style.isTight() && c.classes.push("mtight");
    var p = n.getColor();
    p && (c.style.color = p);
  }
  return c;
}, ii = function(e, t, a, n) {
  return n === void 0 && (n = []), a.font === "boldsymbol" && dt(e, "Main-Bold", t).metrics ? je(e, "Main-Bold", t, a, n.concat(["mathbf"])) : e === "\\" || se[t][e].font === "main" ? je(e, "Main-Regular", t, a, n) : je(e, "AMS-Regular", t, a, n.concat(["amsrm"]));
}, si = function(e, t, a, n, i) {
  return i !== "textord" && dt(e, "Math-BoldItalic", t).metrics ? {
    fontName: "Math-BoldItalic",
    fontClass: "boldsymbol"
  } : {
    fontName: "Main-Bold",
    fontClass: "mathbf"
  };
}, li = function(e, t, a) {
  var n = e.mode, i = e.text, o = ["mord"], u = n === "math" || n === "text" && t.font, c = u ? t.font : t.fontFamily;
  if (i.charCodeAt(0) === 55349) {
    var [m, p] = ni(i, n);
    return je(i, m, n, t, o.concat(p));
  } else if (c) {
    var v, k;
    if (c === "boldsymbol") {
      var S = si(i, n, t, o, a);
      v = S.fontName, k = [S.fontClass];
    } else
      u ? (v = wa[c].fontName, k = [c]) : (v = W0(c, t.fontWeight, t.fontShape), k = [c, t.fontWeight, t.fontShape]);
    if (dt(i, v, n).metrics)
      return je(i, v, n, t, o.concat(k));
    if (va.hasOwnProperty(i) && v.substr(0, 10) === "Typewriter") {
      for (var z = [], T = 0; T < i.length; T++)
        z.push(je(i[T], v, n, t, o.concat(k)));
      return ya(z);
    }
  }
  if (a === "mathord")
    return je(i, "Math-Italic", n, t, o.concat(["mathnormal"]));
  if (a === "textord") {
    var _ = se[n][i] && se[n][i].font;
    if (_ === "ams") {
      var M = W0("amsrm", t.fontWeight, t.fontShape);
      return je(i, M, n, t, o.concat("amsrm", t.fontWeight, t.fontShape));
    } else if (_ === "main" || !_) {
      var b = W0("textrm", t.fontWeight, t.fontShape);
      return je(i, b, n, t, o.concat(t.fontWeight, t.fontShape));
    } else {
      var y = W0(_, t.fontWeight, t.fontShape);
      return je(i, y, n, t, o.concat(y, t.fontWeight, t.fontShape));
    }
  } else
    throw new Error("unexpected type: " + a + " in makeOrd");
}, oi = (r4, e) => {
  if (h0(r4.classes) !== h0(e.classes) || r4.skew !== e.skew || r4.maxFontSize !== e.maxFontSize)
    return false;
  if (r4.classes.length === 1) {
    var t = r4.classes[0];
    if (t === "mbin" || t === "mord")
      return false;
  }
  for (var a in r4.style)
    if (r4.style.hasOwnProperty(a) && r4.style[a] !== e.style[a])
      return false;
  for (var n in e.style)
    if (e.style.hasOwnProperty(n) && r4.style[n] !== e.style[n])
      return false;
  return true;
}, ui = (r4) => {
  for (var e = 0; e < r4.length - 1; e++) {
    var t = r4[e], a = r4[e + 1];
    t instanceof Ge && a instanceof Ge && oi(t, a) && (t.text += a.text, t.height = Math.max(t.height, a.height), t.depth = Math.max(t.depth, a.depth), t.italic = a.italic, r4.splice(e + 1, 1), e--);
  }
  return r4;
}, Kt = function(e) {
  for (var t = 0, a = 0, n = 0, i = 0; i < e.children.length; i++) {
    var o = e.children[i];
    o.height > t && (t = o.height), o.depth > a && (a = o.depth), o.maxFontSize > n && (n = o.maxFontSize);
  }
  e.height = t, e.depth = a, e.maxFontSize = n;
}, Ce = function(e, t, a, n) {
  var i = new F0(e, t, a, n);
  return Kt(i), i;
}, ba = (r4, e, t, a) => new F0(r4, e, t, a), ci = function(e, t, a) {
  var n = Ce([e], [], t);
  return n.height = Math.max(a || t.fontMetrics().defaultRuleThickness, t.minRuleThickness), n.style.borderBottomWidth = $(n.height), n.maxFontSize = 1, n;
}, di = function(e, t, a, n) {
  var i = new Zt(e, t, a, n);
  return Kt(i), i;
}, ya = function(e) {
  var t = new $0(e);
  return Kt(t), t;
}, hi = function(e, t) {
  return e instanceof $0 ? Ce([], [e], t) : e;
}, mi = function(e) {
  if (e.positionType === "individualShift") {
    for (var t = e.children, a = [t[0]], n = -t[0].shift - t[0].elem.depth, i = n, o = 1; o < t.length; o++) {
      var u = -t[o].shift - i - t[o].elem.depth, c = u - (t[o - 1].elem.height + t[o - 1].elem.depth);
      i = i + u, a.push({
        type: "kern",
        size: c
      }), a.push(t[o]);
    }
    return {
      children: a,
      depth: n
    };
  }
  var m;
  if (e.positionType === "top") {
    for (var p = e.positionData, v = 0; v < e.children.length; v++) {
      var k = e.children[v];
      p -= k.type === "kern" ? k.size : k.elem.height + k.elem.depth;
    }
    m = p;
  } else if (e.positionType === "bottom")
    m = -e.positionData;
  else {
    var S = e.children[0];
    if (S.type !== "elem")
      throw new Error('First child must have type "elem".');
    if (e.positionType === "shift")
      m = -S.elem.depth - e.positionData;
    else if (e.positionType === "firstBaseline")
      m = -S.elem.depth;
    else
      throw new Error("Invalid positionType " + e.positionType + ".");
  }
  return {
    children: e.children,
    depth: m
  };
}, pi = function(e, t) {
  for (var {
    children: a,
    depth: n
  } = mi(e), i = 0, o = 0; o < a.length; o++) {
    var u = a[o];
    if (u.type === "elem") {
      var c = u.elem;
      i = Math.max(i, c.maxFontSize, c.height);
    }
  }
  i += 2;
  var m = Ce(["pstrut"], []);
  m.style.height = $(i);
  for (var p = [], v = n, k = n, S = n, z = 0; z < a.length; z++) {
    var T = a[z];
    if (T.type === "kern")
      S += T.size;
    else {
      var _ = T.elem, M = T.wrapperClasses || [], b = T.wrapperStyle || {}, y = Ce(M, [m, _], void 0, b);
      y.style.top = $(-i - S - _.depth), T.marginLeft && (y.style.marginLeft = T.marginLeft), T.marginRight && (y.style.marginRight = T.marginRight), p.push(y), S += _.height + _.depth;
    }
    v = Math.min(v, S), k = Math.max(k, S);
  }
  var E = Ce(["vlist"], p);
  E.style.height = $(k);
  var N;
  if (v < 0) {
    var C = Ce([], []), I = Ce(["vlist"], [C]);
    I.style.height = $(-v);
    var F = Ce(["vlist-s"], [new Ge("​")]);
    N = [Ce(["vlist-r"], [E, F]), Ce(["vlist-r"], [I])];
  } else
    N = [Ce(["vlist-r"], [E])];
  var O = Ce(["vlist-t"], N);
  return N.length === 2 && O.classes.push("vlist-t2"), O.height = k, O.depth = -v, O;
}, fi = (r4, e) => {
  var t = Ce(["mspace"], [], e), a = pe(r4, e);
  return t.style.marginRight = $(a), t;
}, W0 = function(e, t, a) {
  var n = "";
  switch (e) {
    case "amsrm":
      n = "AMS";
      break;
    case "textrm":
      n = "Main";
      break;
    case "textsf":
      n = "SansSerif";
      break;
    case "texttt":
      n = "Typewriter";
      break;
    default:
      n = e;
  }
  var i;
  return t === "textbf" && a === "textit" ? i = "BoldItalic" : t === "textbf" ? i = "Bold" : t === "textit" ? i = "Italic" : i = "Regular", n + "-" + i;
}, wa = {
  // styles
  mathbf: {
    variant: "bold",
    fontName: "Main-Bold"
  },
  mathrm: {
    variant: "normal",
    fontName: "Main-Regular"
  },
  textit: {
    variant: "italic",
    fontName: "Main-Italic"
  },
  mathit: {
    variant: "italic",
    fontName: "Main-Italic"
  },
  mathnormal: {
    variant: "italic",
    fontName: "Math-Italic"
  },
  // "boldsymbol" is missing because they require the use of multiple fonts:
  // Math-BoldItalic and Main-Bold.  This is handled by a special case in
  // makeOrd which ends up calling boldsymbol.
  // families
  mathbb: {
    variant: "double-struck",
    fontName: "AMS-Regular"
  },
  mathcal: {
    variant: "script",
    fontName: "Caligraphic-Regular"
  },
  mathfrak: {
    variant: "fraktur",
    fontName: "Fraktur-Regular"
  },
  mathscr: {
    variant: "script",
    fontName: "Script-Regular"
  },
  mathsf: {
    variant: "sans-serif",
    fontName: "SansSerif-Regular"
  },
  mathtt: {
    variant: "monospace",
    fontName: "Typewriter-Regular"
  }
}, xa = {
  //   path, width, height
  vec: ["vec", 0.471, 0.714],
  // values from the font glyph
  oiintSize1: ["oiintSize1", 0.957, 0.499],
  // oval to overlay the integrand
  oiintSize2: ["oiintSize2", 1.472, 0.659],
  oiiintSize1: ["oiiintSize1", 1.304, 0.499],
  oiiintSize2: ["oiiintSize2", 1.98, 0.659]
}, gi = function(e, t) {
  var [a, n, i] = xa[e], o = new w0(a), u = new m0([o], {
    width: $(n),
    height: $(i),
    // Override CSS rule `.katex svg { width: 100% }`
    style: "width:" + $(n),
    viewBox: "0 0 " + 1e3 * n + " " + 1e3 * i,
    preserveAspectRatio: "xMinYMin"
  }), c = ba(["overlay"], [u], t);
  return c.height = i, c.style.height = $(i), c.style.width = $(n), c;
}, A = {
  fontMap: wa,
  makeSymbol: je,
  mathsym: ii,
  makeSpan: Ce,
  makeSvgSpan: ba,
  makeLineSpan: ci,
  makeAnchor: di,
  makeFragment: ya,
  wrapFragment: hi,
  makeVList: pi,
  makeOrd: li,
  makeGlue: fi,
  staticSvg: gi,
  svgData: xa,
  tryCombineChars: ui
}, me = {
  number: 3,
  unit: "mu"
}, y0 = {
  number: 4,
  unit: "mu"
}, t0 = {
  number: 5,
  unit: "mu"
}, vi = {
  mord: {
    mop: me,
    mbin: y0,
    mrel: t0,
    minner: me
  },
  mop: {
    mord: me,
    mop: me,
    mrel: t0,
    minner: me
  },
  mbin: {
    mord: y0,
    mop: y0,
    mopen: y0,
    minner: y0
  },
  mrel: {
    mord: t0,
    mop: t0,
    mopen: t0,
    minner: t0
  },
  mopen: {},
  mclose: {
    mop: me,
    mbin: y0,
    mrel: t0,
    minner: me
  },
  mpunct: {
    mord: me,
    mop: me,
    mrel: t0,
    mopen: me,
    mclose: me,
    mpunct: me,
    minner: me
  },
  minner: {
    mord: me,
    mop: me,
    mbin: y0,
    mrel: t0,
    mopen: me,
    mpunct: me,
    minner: me
  }
}, bi = {
  mord: {
    mop: me
  },
  mop: {
    mord: me,
    mop: me
  },
  mbin: {},
  mrel: {},
  mopen: {},
  mclose: {
    mop: me
  },
  mpunct: {},
  minner: {
    mop: me
  }
}, ka = {}, it = {}, st = {};
function P(r4) {
  for (var {
    type: e,
    names: t,
    props: a,
    handler: n,
    htmlBuilder: i,
    mathmlBuilder: o
  } = r4, u = {
    type: e,
    numArgs: a.numArgs,
    argTypes: a.argTypes,
    allowedInArgument: !!a.allowedInArgument,
    allowedInText: !!a.allowedInText,
    allowedInMath: a.allowedInMath === void 0 ? true : a.allowedInMath,
    numOptionalArgs: a.numOptionalArgs || 0,
    infix: !!a.infix,
    primitive: !!a.primitive,
    handler: n
  }, c = 0; c < t.length; ++c)
    ka[t[c]] = u;
  e && (i && (it[e] = i), o && (st[e] = o));
}
function k0(r4) {
  var {
    type: e,
    htmlBuilder: t,
    mathmlBuilder: a
  } = r4;
  P({
    type: e,
    names: [],
    props: {
      numArgs: 0
    },
    handler() {
      throw new Error("Should never be called.");
    },
    htmlBuilder: t,
    mathmlBuilder: a
  });
}
var lt = function(e) {
  return e.type === "ordgroup" && e.body.length === 1 ? e.body[0] : e;
}, ve = function(e) {
  return e.type === "ordgroup" ? e.body : [e];
}, i0 = A.makeSpan, yi = ["leftmost", "mbin", "mopen", "mrel", "mop", "mpunct"], wi = ["rightmost", "mrel", "mclose", "mpunct"], xi = {
  display: U.DISPLAY,
  text: U.TEXT,
  script: U.SCRIPT,
  scriptscript: U.SCRIPTSCRIPT
}, ki = {
  mord: "mord",
  mop: "mop",
  mbin: "mbin",
  mrel: "mrel",
  mopen: "mopen",
  mclose: "mclose",
  mpunct: "mpunct",
  minner: "minner"
}, Ae = function(e, t, a, n) {
  n === void 0 && (n = [null, null]);
  for (var i = [], o = 0; o < e.length; o++) {
    var u = te(e[o], t);
    if (u instanceof $0) {
      var c = u.children;
      i.push(...c);
    } else
      i.push(u);
  }
  if (A.tryCombineChars(i), !a)
    return i;
  var m = t;
  if (e.length === 1) {
    var p = e[0];
    p.type === "sizing" ? m = t.havingSize(p.size) : p.type === "styling" && (m = t.havingStyle(xi[p.style]));
  }
  var v = i0([n[0] || "leftmost"], [], t), k = i0([n[1] || "rightmost"], [], t), S = a === "root";
  return Mr(i, (z, T) => {
    var _ = T.classes[0], M = z.classes[0];
    _ === "mbin" && W.contains(wi, M) ? T.classes[0] = "mord" : M === "mbin" && W.contains(yi, _) && (z.classes[0] = "mord");
  }, {
    node: v
  }, k, S), Mr(i, (z, T) => {
    var _ = Pt(T), M = Pt(z), b = _ && M ? z.hasClass("mtight") ? bi[_][M] : vi[_][M] : null;
    if (b)
      return A.makeGlue(b, m);
  }, {
    node: v
  }, k, S), i;
}, Mr = function r2(e, t, a, n, i) {
  n && e.push(n);
  for (var o = 0; o < e.length; o++) {
    var u = e[o], c = Sa(u);
    if (c) {
      r2(c.children, t, a, null, i);
      continue;
    }
    var m = !u.hasClass("mspace");
    if (m) {
      var p = t(u, a.node);
      p && (a.insertAfter ? a.insertAfter(p) : (e.unshift(p), o++));
    }
    m ? a.node = u : i && u.hasClass("newline") && (a.node = i0(["leftmost"])), a.insertAfter = /* @__PURE__ */ ((v) => (k) => {
      e.splice(v + 1, 0, k), o++;
    })(o);
  }
  n && e.pop();
}, Sa = function(e) {
  return e instanceof $0 || e instanceof Zt || e instanceof F0 && e.hasClass("enclosing") ? e : null;
}, Si = function r3(e, t) {
  var a = Sa(e);
  if (a) {
    var n = a.children;
    if (n.length) {
      if (t === "right")
        return r3(n[n.length - 1], "right");
      if (t === "left")
        return r3(n[0], "left");
    }
  }
  return e;
}, Pt = function(e, t) {
  return e ? (t && (e = Si(e, t)), ki[e.classes[0]] || null) : null;
}, B0 = function(e, t) {
  var a = ["nulldelimiter"].concat(e.baseSizingClasses());
  return i0(t.concat(a));
}, te = function(e, t, a) {
  if (!e)
    return i0();
  if (it[e.type]) {
    var n = it[e.type](e, t);
    if (a && t.size !== a.size) {
      n = i0(t.sizingClasses(a), [n], t);
      var i = t.sizeMultiplier / a.sizeMultiplier;
      n.height *= i, n.depth *= i;
    }
    return n;
  } else
    throw new L("Got group of unknown type: '" + e.type + "'");
};
function X0(r4, e) {
  var t = i0(["base"], r4, e), a = i0(["strut"]);
  return a.style.height = $(t.height + t.depth), t.depth && (a.style.verticalAlign = $(-t.depth)), t.children.unshift(a), t;
}
function qt(r4, e) {
  var t = null;
  r4.length === 1 && r4[0].type === "tag" && (t = r4[0].tag, r4 = r4[0].body);
  var a = Ae(r4, e, "root"), n;
  a.length === 2 && a[1].hasClass("tag") && (n = a.pop());
  for (var i = [], o = [], u = 0; u < a.length; u++)
    if (o.push(a[u]), a[u].hasClass("mbin") || a[u].hasClass("mrel") || a[u].hasClass("allowbreak")) {
      for (var c = false; u < a.length - 1 && a[u + 1].hasClass("mspace") && !a[u + 1].hasClass("newline"); )
        u++, o.push(a[u]), a[u].hasClass("nobreak") && (c = true);
      c || (i.push(X0(o, e)), o = []);
    } else
      a[u].hasClass("newline") && (o.pop(), o.length > 0 && (i.push(X0(o, e)), o = []), i.push(a[u]));
  o.length > 0 && i.push(X0(o, e));
  var m;
  t ? (m = X0(Ae(t, e, true)), m.classes = ["tag"], i.push(m)) : n && i.push(n);
  var p = i0(["katex-html"], i);
  if (p.setAttribute("aria-hidden", "true"), m) {
    var v = m.children[0];
    v.style.height = $(p.height + p.depth), p.depth && (v.style.verticalAlign = $(-p.depth));
  }
  return p;
}
function Aa(r4) {
  return new $0(r4);
}
class Fe {
  constructor(e, t, a) {
    this.type = void 0, this.attributes = void 0, this.children = void 0, this.classes = void 0, this.type = e, this.attributes = {}, this.children = t || [], this.classes = a || [];
  }
  /**
   * Sets an attribute on a MathML node. MathML depends on attributes to convey a
   * semantic content, so this is used heavily.
   */
  setAttribute(e, t) {
    this.attributes[e] = t;
  }
  /**
   * Gets an attribute on a MathML node.
   */
  getAttribute(e) {
    return this.attributes[e];
  }
  /**
   * Converts the math node into a MathML-namespaced DOM element.
   */
  toNode() {
    var e = (void 0).createElementNS("http://www.w3.org/1998/Math/MathML", this.type);
    for (var t in this.attributes)
      Object.prototype.hasOwnProperty.call(this.attributes, t) && e.setAttribute(t, this.attributes[t]);
    this.classes.length > 0 && (e.className = h0(this.classes));
    for (var a = 0; a < this.children.length; a++)
      e.appendChild(this.children[a].toNode());
    return e;
  }
  /**
   * Converts the math node into an HTML markup string.
   */
  toMarkup() {
    var e = "<" + this.type;
    for (var t in this.attributes)
      Object.prototype.hasOwnProperty.call(this.attributes, t) && (e += " " + t + '="', e += W.escape(this.attributes[t]), e += '"');
    this.classes.length > 0 && (e += ' class ="' + W.escape(h0(this.classes)) + '"'), e += ">";
    for (var a = 0; a < this.children.length; a++)
      e += this.children[a].toMarkup();
    return e += "</" + this.type + ">", e;
  }
  /**
   * Converts the math node into a string, similar to innerText, but escaped.
   */
  toText() {
    return this.children.map((e) => e.toText()).join("");
  }
}
class D0 {
  constructor(e) {
    this.text = void 0, this.text = e;
  }
  /**
   * Converts the text node into a DOM text node.
   */
  toNode() {
    return (void 0).createTextNode(this.text);
  }
  /**
   * Converts the text node into escaped HTML markup
   * (representing the text itself).
   */
  toMarkup() {
    return W.escape(this.toText());
  }
  /**
   * Converts the text node into a string
   * (representing the text iteself).
   */
  toText() {
    return this.text;
  }
}
class Ai {
  /**
   * Create a Space node with width given in CSS ems.
   */
  constructor(e) {
    this.width = void 0, this.character = void 0, this.width = e, e >= 0.05555 && e <= 0.05556 ? this.character = " " : e >= 0.1666 && e <= 0.1667 ? this.character = " " : e >= 0.2222 && e <= 0.2223 ? this.character = " " : e >= 0.2777 && e <= 0.2778 ? this.character = "  " : e >= -0.05556 && e <= -0.05555 ? this.character = " ⁣" : e >= -0.1667 && e <= -0.1666 ? this.character = " ⁣" : e >= -0.2223 && e <= -0.2222 ? this.character = " ⁣" : e >= -0.2778 && e <= -0.2777 ? this.character = " ⁣" : this.character = null;
  }
  /**
   * Converts the math node into a MathML-namespaced DOM element.
   */
  toNode() {
    if (this.character)
      return (void 0).createTextNode(this.character);
    var e = (void 0).createElementNS("http://www.w3.org/1998/Math/MathML", "mspace");
    return e.setAttribute("width", $(this.width)), e;
  }
  /**
   * Converts the math node into an HTML markup string.
   */
  toMarkup() {
    return this.character ? "<mtext>" + this.character + "</mtext>" : '<mspace width="' + $(this.width) + '"/>';
  }
  /**
   * Converts the math node into a string, similar to innerText.
   */
  toText() {
    return this.character ? this.character : " ";
  }
}
var B = {
  MathNode: Fe,
  TextNode: D0,
  SpaceNode: Ai,
  newDocumentFragment: Aa
}, Ue = function(e, t, a) {
  return se[t][e] && se[t][e].replace && e.charCodeAt(0) !== 55349 && !(va.hasOwnProperty(e) && a && (a.fontFamily && a.fontFamily.substr(4, 2) === "tt" || a.font && a.font.substr(4, 2) === "tt")) && (e = se[t][e].replace), new B.TextNode(e);
}, Jt = function(e) {
  return e.length === 1 ? e[0] : new B.MathNode("mrow", e);
}, Qt = function(e, t) {
  if (t.fontFamily === "texttt")
    return "monospace";
  if (t.fontFamily === "textsf")
    return t.fontShape === "textit" && t.fontWeight === "textbf" ? "sans-serif-bold-italic" : t.fontShape === "textit" ? "sans-serif-italic" : t.fontWeight === "textbf" ? "bold-sans-serif" : "sans-serif";
  if (t.fontShape === "textit" && t.fontWeight === "textbf")
    return "bold-italic";
  if (t.fontShape === "textit")
    return "italic";
  if (t.fontWeight === "textbf")
    return "bold";
  var a = t.font;
  if (!a || a === "mathnormal")
    return null;
  var n = e.mode;
  if (a === "mathit")
    return "italic";
  if (a === "boldsymbol")
    return e.type === "textord" ? "bold" : "bold-italic";
  if (a === "mathbf")
    return "bold";
  if (a === "mathbb")
    return "double-struck";
  if (a === "mathfrak")
    return "fraktur";
  if (a === "mathscr" || a === "mathcal")
    return "script";
  if (a === "mathsf")
    return "sans-serif";
  if (a === "mathtt")
    return "monospace";
  var i = e.text;
  if (W.contains(["\\imath", "\\jmath"], i))
    return null;
  se[n][i] && se[n][i].replace && (i = se[n][i].replace);
  var o = A.fontMap[a].fontName;
  return Xt(i, o, n) ? A.fontMap[a].variant : null;
}, Oe = function(e, t, a) {
  if (e.length === 1) {
    var n = ne(e[0], t);
    return a && n instanceof Fe && n.type === "mo" && (n.setAttribute("lspace", "0em"), n.setAttribute("rspace", "0em")), [n];
  }
  for (var i = [], o, u = 0; u < e.length; u++) {
    var c = ne(e[u], t);
    if (c instanceof Fe && o instanceof Fe) {
      if (c.type === "mtext" && o.type === "mtext" && c.getAttribute("mathvariant") === o.getAttribute("mathvariant")) {
        o.children.push(...c.children);
        continue;
      } else if (c.type === "mn" && o.type === "mn") {
        o.children.push(...c.children);
        continue;
      } else if (c.type === "mi" && c.children.length === 1 && o.type === "mn") {
        var m = c.children[0];
        if (m instanceof D0 && m.text === ".") {
          o.children.push(...c.children);
          continue;
        }
      } else if (o.type === "mi" && o.children.length === 1) {
        var p = o.children[0];
        if (p instanceof D0 && p.text === "̸" && (c.type === "mo" || c.type === "mi" || c.type === "mn")) {
          var v = c.children[0];
          v instanceof D0 && v.text.length > 0 && (v.text = v.text.slice(0, 1) + "̸" + v.text.slice(1), i.pop());
        }
      }
    }
    i.push(c), o = c;
  }
  return i;
}, p0 = function(e, t, a) {
  return Jt(Oe(e, t, a));
}, ne = function(e, t) {
  if (!e)
    return new B.MathNode("mrow");
  if (st[e.type]) {
    var a = st[e.type](e, t);
    return a;
  } else
    throw new L("Got group of unknown type: '" + e.type + "'");
};
function zr(r4, e, t, a, n) {
  var i = Oe(r4, t), o;
  i.length === 1 && i[0] instanceof Fe && W.contains(["mrow", "mtable"], i[0].type) ? o = i[0] : o = new B.MathNode("mrow", i);
  var u = new B.MathNode("annotation", [new B.TextNode(e)]);
  u.setAttribute("encoding", "application/x-tex");
  var c = new B.MathNode("semantics", [o, u]), m = new B.MathNode("math", [c]);
  m.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML"), a && m.setAttribute("display", "block");
  var p = n ? "katex" : "katex-mathml";
  return A.makeSpan([p], [m]);
}
var Ta = function(e) {
  return new r0({
    style: e.displayMode ? U.DISPLAY : U.TEXT,
    maxSize: e.maxSize,
    minRuleThickness: e.minRuleThickness
  });
}, _a = function(e, t) {
  if (t.displayMode) {
    var a = ["katex-display"];
    t.leqno && a.push("leqno"), t.fleqn && a.push("fleqn"), e = A.makeSpan(a, [e]);
  }
  return e;
}, Ti = function(e, t, a) {
  var n = Ta(a), i;
  if (a.output === "mathml")
    return zr(e, t, n, a.displayMode, true);
  if (a.output === "html") {
    var o = qt(e, n);
    i = A.makeSpan(["katex"], [o]);
  } else {
    var u = zr(e, t, n, a.displayMode, false), c = qt(e, n);
    i = A.makeSpan(["katex"], [u, c]);
  }
  return _a(i, a);
}, _i = function(e, t, a) {
  var n = Ta(a), i = qt(e, n), o = A.makeSpan(["katex"], [i]);
  return _a(o, a);
}, Ei = {
  widehat: "^",
  widecheck: "ˇ",
  widetilde: "~",
  utilde: "~",
  overleftarrow: "←",
  underleftarrow: "←",
  xleftarrow: "←",
  overrightarrow: "→",
  underrightarrow: "→",
  xrightarrow: "→",
  underbrace: "⏟",
  overbrace: "⏞",
  overgroup: "⏠",
  undergroup: "⏡",
  overleftrightarrow: "↔",
  underleftrightarrow: "↔",
  xleftrightarrow: "↔",
  Overrightarrow: "⇒",
  xRightarrow: "⇒",
  overleftharpoon: "↼",
  xleftharpoonup: "↼",
  overrightharpoon: "⇀",
  xrightharpoonup: "⇀",
  xLeftarrow: "⇐",
  xLeftrightarrow: "⇔",
  xhookleftarrow: "↩",
  xhookrightarrow: "↪",
  xmapsto: "↦",
  xrightharpoondown: "⇁",
  xleftharpoondown: "↽",
  xrightleftharpoons: "⇌",
  xleftrightharpoons: "⇋",
  xtwoheadleftarrow: "↞",
  xtwoheadrightarrow: "↠",
  xlongequal: "=",
  xtofrom: "⇄",
  xrightleftarrows: "⇄",
  xrightequilibrium: "⇌",
  // Not a perfect match.
  xleftequilibrium: "⇋",
  // None better available.
  "\\cdrightarrow": "→",
  "\\cdleftarrow": "←",
  "\\cdlongequal": "="
}, Mi = function(e) {
  var t = new B.MathNode("mo", [new B.TextNode(Ei[e.replace(/^\\/, "")])]);
  return t.setAttribute("stretchy", "true"), t;
}, zi = {
  //   path(s), minWidth, height, align
  overrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
  overleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
  underrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
  underleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
  xrightarrow: [["rightarrow"], 1.469, 522, "xMaxYMin"],
  "\\cdrightarrow": [["rightarrow"], 3, 522, "xMaxYMin"],
  // CD minwwidth2.5pc
  xleftarrow: [["leftarrow"], 1.469, 522, "xMinYMin"],
  "\\cdleftarrow": [["leftarrow"], 3, 522, "xMinYMin"],
  Overrightarrow: [["doublerightarrow"], 0.888, 560, "xMaxYMin"],
  xRightarrow: [["doublerightarrow"], 1.526, 560, "xMaxYMin"],
  xLeftarrow: [["doubleleftarrow"], 1.526, 560, "xMinYMin"],
  overleftharpoon: [["leftharpoon"], 0.888, 522, "xMinYMin"],
  xleftharpoonup: [["leftharpoon"], 0.888, 522, "xMinYMin"],
  xleftharpoondown: [["leftharpoondown"], 0.888, 522, "xMinYMin"],
  overrightharpoon: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
  xrightharpoonup: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
  xrightharpoondown: [["rightharpoondown"], 0.888, 522, "xMaxYMin"],
  xlongequal: [["longequal"], 0.888, 334, "xMinYMin"],
  "\\cdlongequal": [["longequal"], 3, 334, "xMinYMin"],
  xtwoheadleftarrow: [["twoheadleftarrow"], 0.888, 334, "xMinYMin"],
  xtwoheadrightarrow: [["twoheadrightarrow"], 0.888, 334, "xMaxYMin"],
  overleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
  overbrace: [["leftbrace", "midbrace", "rightbrace"], 1.6, 548],
  underbrace: [["leftbraceunder", "midbraceunder", "rightbraceunder"], 1.6, 548],
  underleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
  xleftrightarrow: [["leftarrow", "rightarrow"], 1.75, 522],
  xLeftrightarrow: [["doubleleftarrow", "doublerightarrow"], 1.75, 560],
  xrightleftharpoons: [["leftharpoondownplus", "rightharpoonplus"], 1.75, 716],
  xleftrightharpoons: [["leftharpoonplus", "rightharpoondownplus"], 1.75, 716],
  xhookleftarrow: [["leftarrow", "righthook"], 1.08, 522],
  xhookrightarrow: [["lefthook", "rightarrow"], 1.08, 522],
  overlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
  underlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
  overgroup: [["leftgroup", "rightgroup"], 0.888, 342],
  undergroup: [["leftgroupunder", "rightgroupunder"], 0.888, 342],
  xmapsto: [["leftmapsto", "rightarrow"], 1.5, 522],
  xtofrom: [["leftToFrom", "rightToFrom"], 1.75, 528],
  // The next three arrows are from the mhchem package.
  // In mhchem.sty, min-length is 2.0em. But these arrows might appear in the
  // document as \xrightarrow or \xrightleftharpoons. Those have
  // min-length = 1.75em, so we set min-length on these next three to match.
  xrightleftarrows: [["baraboveleftarrow", "rightarrowabovebar"], 1.75, 901],
  xrightequilibrium: [["baraboveshortleftharpoon", "rightharpoonaboveshortbar"], 1.75, 716],
  xleftequilibrium: [["shortbaraboveleftharpoon", "shortrightharpoonabovebar"], 1.75, 716]
}, Ni = function(e) {
  return e.type === "ordgroup" ? e.body.length : 1;
}, Ci = function(e, t) {
  function a() {
    var u = 4e5, c = e.label.substr(1);
    if (W.contains(["widehat", "widecheck", "widetilde", "utilde"], c)) {
      var m = e, p = Ni(m.base), v, k, S;
      if (p > 5)
        c === "widehat" || c === "widecheck" ? (v = 420, u = 2364, S = 0.42, k = c + "4") : (v = 312, u = 2340, S = 0.34, k = "tilde4");
      else {
        var z = [1, 1, 2, 2, 3, 3][p];
        c === "widehat" || c === "widecheck" ? (u = [0, 1062, 2364, 2364, 2364][z], v = [0, 239, 300, 360, 420][z], S = [0, 0.24, 0.3, 0.3, 0.36, 0.42][z], k = c + z) : (u = [0, 600, 1033, 2339, 2340][z], v = [0, 260, 286, 306, 312][z], S = [0, 0.26, 0.286, 0.3, 0.306, 0.34][z], k = "tilde" + z);
      }
      var T = new w0(k), _ = new m0([T], {
        width: "100%",
        height: $(S),
        viewBox: "0 0 " + u + " " + v,
        preserveAspectRatio: "none"
      });
      return {
        span: A.makeSvgSpan([], [_], t),
        minWidth: 0,
        height: S
      };
    } else {
      var M = [], b = zi[c], [y, E, N] = b, C = N / 1e3, I = y.length, F, O;
      if (I === 1) {
        var Y = b[3];
        F = ["hide-tail"], O = [Y];
      } else if (I === 2)
        F = ["halfarrow-left", "halfarrow-right"], O = ["xMinYMin", "xMaxYMin"];
      else if (I === 3)
        F = ["brace-left", "brace-center", "brace-right"], O = ["xMinYMin", "xMidYMin", "xMaxYMin"];
      else
        throw new Error(`Correct katexImagesData or update code here to support
                    ` + I + " children.");
      for (var J = 0; J < I; J++) {
        var ce = new w0(y[J]), xe = new m0([ce], {
          width: "400em",
          height: $(C),
          viewBox: "0 0 " + u + " " + N,
          preserveAspectRatio: O[J] + " slice"
        }), fe = A.makeSvgSpan([F[J]], [xe], t);
        if (I === 1)
          return {
            span: fe,
            minWidth: E,
            height: C
          };
        fe.style.height = $(C), M.push(fe);
      }
      return {
        span: A.makeSpan(["stretchy"], M, t),
        minWidth: E,
        height: C
      };
    }
  }
  var {
    span: n,
    minWidth: i,
    height: o
  } = a();
  return n.height = o, n.style.height = $(o), i > 0 && (n.style.minWidth = $(i)), n;
}, Di = function(e, t, a, n, i) {
  var o, u = e.height + e.depth + a + n;
  if (/fbox|color|angl/.test(t)) {
    if (o = A.makeSpan(["stretchy", t], [], i), t === "fbox") {
      var c = i.color && i.getColor();
      c && (o.style.borderColor = c);
    }
  } else {
    var m = [];
    /^[bx]cancel$/.test(t) && m.push(new $t({
      x1: "0",
      y1: "0",
      x2: "100%",
      y2: "100%",
      "stroke-width": "0.046em"
    })), /^x?cancel$/.test(t) && m.push(new $t({
      x1: "0",
      y1: "100%",
      x2: "100%",
      y2: "0",
      "stroke-width": "0.046em"
    }));
    var p = new m0(m, {
      width: "100%",
      height: $(u)
    });
    o = A.makeSvgSpan([], [p], i);
  }
  return o.height = u, o.style.height = $(u), o;
}, s0 = {
  encloseSpan: Di,
  mathMLnode: Mi,
  svgSpan: Ci
};
function K(r4, e) {
  if (!r4 || r4.type !== e)
    throw new Error("Expected node of type " + e + ", but got " + (r4 ? "node of type " + r4.type : String(r4)));
  return r4;
}
function er(r4) {
  var e = ht(r4);
  if (!e)
    throw new Error("Expected node of symbol group type, but got " + (r4 ? "node of type " + r4.type : String(r4)));
  return e;
}
function ht(r4) {
  return r4 && (r4.type === "atom" || ai.hasOwnProperty(r4.type)) ? r4 : null;
}
var tr = (r4, e) => {
  var t, a, n;
  r4 && r4.type === "supsub" ? (a = K(r4.base, "accent"), t = a.base, r4.base = t, n = ti(te(r4, e)), r4.base = a) : (a = K(r4, "accent"), t = a.base);
  var i = te(t, e.havingCrampedStyle()), o = a.isShifty && W.isCharacterBox(t), u = 0;
  if (o) {
    var c = W.getBaseElem(t), m = te(c, e.havingCrampedStyle());
    u = kr(m).skew;
  }
  var p = a.label === "\\c", v = p ? i.height + i.depth : Math.min(i.height, e.fontMetrics().xHeight), k;
  if (a.isStretchy)
    k = s0.svgSpan(a, e), k = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: i
      }, {
        type: "elem",
        elem: k,
        wrapperClasses: ["svg-align"],
        wrapperStyle: u > 0 ? {
          width: "calc(100% - " + $(2 * u) + ")",
          marginLeft: $(2 * u)
        } : void 0
      }]
    }, e);
  else {
    var S, z;
    a.label === "\\vec" ? (S = A.staticSvg("vec", e), z = A.svgData.vec[1]) : (S = A.makeOrd({
      mode: a.mode,
      text: a.label
    }, e, "textord"), S = kr(S), S.italic = 0, z = S.width, p && (v += S.depth)), k = A.makeSpan(["accent-body"], [S]);
    var T = a.label === "\\textcircled";
    T && (k.classes.push("accent-full"), v = i.height);
    var _ = u;
    T || (_ -= z / 2), k.style.left = $(_), a.label === "\\textcircled" && (k.style.top = ".2em"), k = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: i
      }, {
        type: "kern",
        size: -v
      }, {
        type: "elem",
        elem: k
      }]
    }, e);
  }
  var M = A.makeSpan(["mord", "accent"], [k], e);
  return n ? (n.children[0] = M, n.height = Math.max(M.height, n.height), n.classes[0] = "mord", n) : M;
}, Ea = (r4, e) => {
  var t = r4.isStretchy ? s0.mathMLnode(r4.label) : new B.MathNode("mo", [Ue(r4.label, r4.mode)]), a = new B.MathNode("mover", [ne(r4.base, e), t]);
  return a.setAttribute("accent", "true"), a;
}, Ri = new RegExp(["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\mathring"].map((r4) => "\\" + r4).join("|"));
P({
  type: "accent",
  names: ["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\mathring", "\\widecheck", "\\widehat", "\\widetilde", "\\overrightarrow", "\\overleftarrow", "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup", "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon"],
  props: {
    numArgs: 1
  },
  handler: (r4, e) => {
    var t = lt(e[0]), a = !Ri.test(r4.funcName), n = !a || r4.funcName === "\\widehat" || r4.funcName === "\\widetilde" || r4.funcName === "\\widecheck";
    return {
      type: "accent",
      mode: r4.parser.mode,
      label: r4.funcName,
      isStretchy: a,
      isShifty: n,
      base: t
    };
  },
  htmlBuilder: tr,
  mathmlBuilder: Ea
});
P({
  type: "accent",
  names: ["\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", '\\"', "\\c", "\\r", "\\H", "\\v", "\\textcircled"],
  props: {
    numArgs: 1,
    allowedInText: true,
    allowedInMath: true,
    // unless in strict mode
    argTypes: ["primitive"]
  },
  handler: (r4, e) => {
    var t = e[0], a = r4.parser.mode;
    return a === "math" && (r4.parser.settings.reportNonstrict("mathVsTextAccents", "LaTeX's accent " + r4.funcName + " works only in text mode"), a = "text"), {
      type: "accent",
      mode: a,
      label: r4.funcName,
      isStretchy: false,
      isShifty: true,
      base: t
    };
  },
  htmlBuilder: tr,
  mathmlBuilder: Ea
});
P({
  type: "accentUnder",
  names: ["\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow", "\\undergroup", "\\underlinesegment", "\\utilde"],
  props: {
    numArgs: 1
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    return {
      type: "accentUnder",
      mode: t.mode,
      label: a,
      base: n
    };
  },
  htmlBuilder: (r4, e) => {
    var t = te(r4.base, e), a = s0.svgSpan(r4, e), n = r4.label === "\\utilde" ? 0.12 : 0, i = A.makeVList({
      positionType: "top",
      positionData: t.height,
      children: [{
        type: "elem",
        elem: a,
        wrapperClasses: ["svg-align"]
      }, {
        type: "kern",
        size: n
      }, {
        type: "elem",
        elem: t
      }]
    }, e);
    return A.makeSpan(["mord", "accentunder"], [i], e);
  },
  mathmlBuilder: (r4, e) => {
    var t = s0.mathMLnode(r4.label), a = new B.MathNode("munder", [ne(r4.base, e), t]);
    return a.setAttribute("accentunder", "true"), a;
  }
});
var Z0 = (r4) => {
  var e = new B.MathNode("mpadded", r4 ? [r4] : []);
  return e.setAttribute("width", "+0.6em"), e.setAttribute("lspace", "0.3em"), e;
};
P({
  type: "xArrow",
  names: [
    "\\xleftarrow",
    "\\xrightarrow",
    "\\xLeftarrow",
    "\\xRightarrow",
    "\\xleftrightarrow",
    "\\xLeftrightarrow",
    "\\xhookleftarrow",
    "\\xhookrightarrow",
    "\\xmapsto",
    "\\xrightharpoondown",
    "\\xrightharpoonup",
    "\\xleftharpoondown",
    "\\xleftharpoonup",
    "\\xrightleftharpoons",
    "\\xleftrightharpoons",
    "\\xlongequal",
    "\\xtwoheadrightarrow",
    "\\xtwoheadleftarrow",
    "\\xtofrom",
    // The next 3 functions are here to support the mhchem extension.
    // Direct use of these functions is discouraged and may break someday.
    "\\xrightleftarrows",
    "\\xrightequilibrium",
    "\\xleftequilibrium",
    // The next 3 functions are here only to support the {CD} environment.
    "\\\\cdrightarrow",
    "\\\\cdleftarrow",
    "\\\\cdlongequal"
  ],
  props: {
    numArgs: 1,
    numOptionalArgs: 1
  },
  handler(r4, e, t) {
    var {
      parser: a,
      funcName: n
    } = r4;
    return {
      type: "xArrow",
      mode: a.mode,
      label: n,
      body: e[0],
      below: t[0]
    };
  },
  // Flow is unable to correctly infer the type of `group`, even though it's
  // unamibiguously determined from the passed-in `type` above.
  htmlBuilder(r4, e) {
    var t = e.style, a = e.havingStyle(t.sup()), n = A.wrapFragment(te(r4.body, a, e), e), i = r4.label.slice(0, 2) === "\\x" ? "x" : "cd";
    n.classes.push(i + "-arrow-pad");
    var o;
    r4.below && (a = e.havingStyle(t.sub()), o = A.wrapFragment(te(r4.below, a, e), e), o.classes.push(i + "-arrow-pad"));
    var u = s0.svgSpan(r4, e), c = -e.fontMetrics().axisHeight + 0.5 * u.height, m = -e.fontMetrics().axisHeight - 0.5 * u.height - 0.111;
    (n.depth > 0.25 || r4.label === "\\xleftequilibrium") && (m -= n.depth);
    var p;
    if (o) {
      var v = -e.fontMetrics().axisHeight + o.height + 0.5 * u.height + 0.111;
      p = A.makeVList({
        positionType: "individualShift",
        children: [{
          type: "elem",
          elem: n,
          shift: m
        }, {
          type: "elem",
          elem: u,
          shift: c
        }, {
          type: "elem",
          elem: o,
          shift: v
        }]
      }, e);
    } else
      p = A.makeVList({
        positionType: "individualShift",
        children: [{
          type: "elem",
          elem: n,
          shift: m
        }, {
          type: "elem",
          elem: u,
          shift: c
        }]
      }, e);
    return p.children[0].children[0].children[1].classes.push("svg-align"), A.makeSpan(["mrel", "x-arrow"], [p], e);
  },
  mathmlBuilder(r4, e) {
    var t = s0.mathMLnode(r4.label);
    t.setAttribute("minsize", r4.label.charAt(0) === "x" ? "1.75em" : "3.0em");
    var a;
    if (r4.body) {
      var n = Z0(ne(r4.body, e));
      if (r4.below) {
        var i = Z0(ne(r4.below, e));
        a = new B.MathNode("munderover", [t, i, n]);
      } else
        a = new B.MathNode("mover", [t, n]);
    } else if (r4.below) {
      var o = Z0(ne(r4.below, e));
      a = new B.MathNode("munder", [t, o]);
    } else
      a = Z0(), a = new B.MathNode("mover", [t, a]);
    return a;
  }
});
var Ii = {
  ">": "\\\\cdrightarrow",
  "<": "\\\\cdleftarrow",
  "=": "\\\\cdlongequal",
  A: "\\uparrow",
  V: "\\downarrow",
  "|": "\\Vert",
  ".": "no arrow"
}, Nr = () => ({
  type: "styling",
  body: [],
  mode: "math",
  style: "display"
}), Cr = (r4) => r4.type === "textord" && r4.text === "@", Bi = (r4, e) => (r4.type === "mathord" || r4.type === "atom") && r4.text === e;
function Oi(r4, e, t) {
  var a = Ii[r4];
  switch (a) {
    case "\\\\cdrightarrow":
    case "\\\\cdleftarrow":
      return t.callFunction(a, [e[0]], [e[1]]);
    case "\\uparrow":
    case "\\downarrow": {
      var n = t.callFunction("\\\\cdleft", [e[0]], []), i = {
        type: "atom",
        text: a,
        mode: "math",
        family: "rel"
      }, o = t.callFunction("\\Big", [i], []), u = t.callFunction("\\\\cdright", [e[1]], []), c = {
        type: "ordgroup",
        mode: "math",
        body: [n, o, u]
      };
      return t.callFunction("\\\\cdparent", [c], []);
    }
    case "\\\\cdlongequal":
      return t.callFunction("\\\\cdlongequal", [], []);
    case "\\Vert": {
      var m = {
        type: "textord",
        text: "\\Vert",
        mode: "math"
      };
      return t.callFunction("\\Big", [m], []);
    }
    default:
      return {
        type: "textord",
        text: " ",
        mode: "math"
      };
  }
}
function Li(r4) {
  var e = [];
  for (r4.gullet.beginGroup(), r4.gullet.macros.set("\\cr", "\\\\\\relax"), r4.gullet.beginGroup(); ; ) {
    e.push(r4.parseExpression(false, "\\\\")), r4.gullet.endGroup(), r4.gullet.beginGroup();
    var t = r4.fetch().text;
    if (t === "&" || t === "\\\\")
      r4.consume();
    else if (t === "\\end") {
      e[e.length - 1].length === 0 && e.pop();
      break;
    } else
      throw new L("Expected \\\\ or \\cr or \\end", r4.nextToken);
  }
  for (var a = [], n = [a], i = 0; i < e.length; i++) {
    for (var o = e[i], u = Nr(), c = 0; c < o.length; c++)
      if (!Cr(o[c]))
        u.body.push(o[c]);
      else {
        a.push(u), c += 1;
        var m = er(o[c]).text, p = new Array(2);
        if (p[0] = {
          type: "ordgroup",
          mode: "math",
          body: []
        }, p[1] = {
          type: "ordgroup",
          mode: "math",
          body: []
        }, !("=|.".indexOf(m) > -1))
          if ("<>AV".indexOf(m) > -1)
            for (var v = 0; v < 2; v++) {
              for (var k = true, S = c + 1; S < o.length; S++) {
                if (Bi(o[S], m)) {
                  k = false, c = S;
                  break;
                }
                if (Cr(o[S]))
                  throw new L("Missing a " + m + " character to complete a CD arrow.", o[S]);
                p[v].body.push(o[S]);
              }
              if (k)
                throw new L("Missing a " + m + " character to complete a CD arrow.", o[c]);
            }
          else
            throw new L('Expected one of "<>AV=|." after @', o[c]);
        var z = Oi(m, p, r4), T = {
          type: "styling",
          body: [z],
          mode: "math",
          style: "display"
          // CD is always displaystyle.
        };
        a.push(T), u = Nr();
      }
    i % 2 === 0 ? a.push(u) : a.shift(), a = [], n.push(a);
  }
  r4.gullet.endGroup(), r4.gullet.endGroup();
  var _ = new Array(n[0].length).fill({
    type: "align",
    align: "c",
    pregap: 0.25,
    // CD package sets \enskip between columns.
    postgap: 0.25
    // So pre and post each get half an \enskip, i.e. 0.25em.
  });
  return {
    type: "array",
    mode: "math",
    body: n,
    arraystretch: 1,
    addJot: true,
    rowGaps: [null],
    cols: _,
    colSeparationType: "CD",
    hLinesBeforeRow: new Array(n.length + 1).fill([])
  };
}
P({
  type: "cdlabel",
  names: ["\\\\cdleft", "\\\\cdright"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4;
    return {
      type: "cdlabel",
      mode: t.mode,
      side: a.slice(4),
      label: e[0]
    };
  },
  htmlBuilder(r4, e) {
    var t = e.havingStyle(e.style.sup()), a = A.wrapFragment(te(r4.label, t, e), e);
    return a.classes.push("cd-label-" + r4.side), a.style.bottom = $(0.8 - a.depth), a.height = 0, a.depth = 0, a;
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mrow", [ne(r4.label, e)]);
    return t = new B.MathNode("mpadded", [t]), t.setAttribute("width", "0"), r4.side === "left" && t.setAttribute("lspace", "-1width"), t.setAttribute("voffset", "0.7em"), t = new B.MathNode("mstyle", [t]), t.setAttribute("displaystyle", "false"), t.setAttribute("scriptlevel", "1"), t;
  }
});
P({
  type: "cdlabelparent",
  names: ["\\\\cdparent"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "cdlabelparent",
      mode: t.mode,
      fragment: e[0]
    };
  },
  htmlBuilder(r4, e) {
    var t = A.wrapFragment(te(r4.fragment, e), e);
    return t.classes.push("cd-vert-arrow"), t;
  },
  mathmlBuilder(r4, e) {
    return new B.MathNode("mrow", [ne(r4.fragment, e)]);
  }
});
P({
  type: "textord",
  names: ["\\@char"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler(r4, e) {
    for (var {
      parser: t
    } = r4, a = K(e[0], "ordgroup"), n = a.body, i = "", o = 0; o < n.length; o++) {
      var u = K(n[o], "textord");
      i += u.text;
    }
    var c = parseInt(i), m;
    if (isNaN(c))
      throw new L("\\@char has non-numeric argument " + i);
    if (c < 0 || c >= 1114111)
      throw new L("\\@char with invalid code point " + i);
    return c <= 65535 ? m = String.fromCharCode(c) : (c -= 65536, m = String.fromCharCode((c >> 10) + 55296, (c & 1023) + 56320)), {
      type: "textord",
      mode: t.mode,
      text: m
    };
  }
});
var Ma = (r4, e) => {
  var t = Ae(r4.body, e.withColor(r4.color), false);
  return A.makeFragment(t);
}, za = (r4, e) => {
  var t = Oe(r4.body, e.withColor(r4.color)), a = new B.MathNode("mstyle", t);
  return a.setAttribute("mathcolor", r4.color), a;
};
P({
  type: "color",
  names: ["\\textcolor"],
  props: {
    numArgs: 2,
    allowedInText: true,
    argTypes: ["color", "original"]
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4, a = K(e[0], "color-token").color, n = e[1];
    return {
      type: "color",
      mode: t.mode,
      color: a,
      body: ve(n)
    };
  },
  htmlBuilder: Ma,
  mathmlBuilder: za
});
P({
  type: "color",
  names: ["\\color"],
  props: {
    numArgs: 1,
    allowedInText: true,
    argTypes: ["color"]
  },
  handler(r4, e) {
    var {
      parser: t,
      breakOnTokenText: a
    } = r4, n = K(e[0], "color-token").color;
    t.gullet.macros.set("\\current@color", n);
    var i = t.parseExpression(true, a);
    return {
      type: "color",
      mode: t.mode,
      color: n,
      body: i
    };
  },
  htmlBuilder: Ma,
  mathmlBuilder: za
});
P({
  type: "cr",
  names: ["\\\\"],
  props: {
    numArgs: 0,
    numOptionalArgs: 1,
    argTypes: ["size"],
    allowedInText: true
  },
  handler(r4, e, t) {
    var {
      parser: a
    } = r4, n = t[0], i = !a.settings.displayMode || !a.settings.useStrictBehavior("newLineInDisplayMode", "In LaTeX, \\\\ or \\newline does nothing in display mode");
    return {
      type: "cr",
      mode: a.mode,
      newLine: i,
      size: n && K(n, "size").value
    };
  },
  // The following builders are called only at the top level,
  // not within tabular/array environments.
  htmlBuilder(r4, e) {
    var t = A.makeSpan(["mspace"], [], e);
    return r4.newLine && (t.classes.push("newline"), r4.size && (t.style.marginTop = $(pe(r4.size, e)))), t;
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mspace");
    return r4.newLine && (t.setAttribute("linebreak", "newline"), r4.size && t.setAttribute("height", $(pe(r4.size, e)))), t;
  }
});
var Ht = {
  "\\global": "\\global",
  "\\long": "\\\\globallong",
  "\\\\globallong": "\\\\globallong",
  "\\def": "\\gdef",
  "\\gdef": "\\gdef",
  "\\edef": "\\xdef",
  "\\xdef": "\\xdef",
  "\\let": "\\\\globallet",
  "\\futurelet": "\\\\globalfuture"
}, Na = (r4) => {
  var e = r4.text;
  if (/^(?:[\\{}$&#^_]|EOF)$/.test(e))
    throw new L("Expected a control sequence", r4);
  return e;
}, $i = (r4) => {
  var e = r4.gullet.popToken();
  return e.text === "=" && (e = r4.gullet.popToken(), e.text === " " && (e = r4.gullet.popToken())), e;
}, Ca = (r4, e, t, a) => {
  var n = r4.gullet.macros.get(t.text);
  n == null && (t.noexpand = true, n = {
    tokens: [t],
    numArgs: 0,
    // reproduce the same behavior in expansion
    unexpandable: !r4.gullet.isExpandable(t.text)
  }), r4.gullet.macros.set(e, n, a);
};
P({
  type: "internal",
  names: [
    "\\global",
    "\\long",
    "\\\\globallong"
    // can’t be entered directly
  ],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4;
    e.consumeSpaces();
    var a = e.fetch();
    if (Ht[a.text])
      return (t === "\\global" || t === "\\\\globallong") && (a.text = Ht[a.text]), K(e.parseFunction(), "internal");
    throw new L("Invalid token after macro prefix", a);
  }
});
P({
  type: "internal",
  names: ["\\def", "\\gdef", "\\edef", "\\xdef"],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4, a = e.gullet.popToken(), n = a.text;
    if (/^(?:[\\{}$&#^_]|EOF)$/.test(n))
      throw new L("Expected a control sequence", a);
    for (var i = 0, o, u = [[]]; e.gullet.future().text !== "{"; )
      if (a = e.gullet.popToken(), a.text === "#") {
        if (e.gullet.future().text === "{") {
          o = e.gullet.future(), u[i].push("{");
          break;
        }
        if (a = e.gullet.popToken(), !/^[1-9]$/.test(a.text))
          throw new L('Invalid argument number "' + a.text + '"');
        if (parseInt(a.text) !== i + 1)
          throw new L('Argument number "' + a.text + '" out of order');
        i++, u.push([]);
      } else {
        if (a.text === "EOF")
          throw new L("Expected a macro definition");
        u[i].push(a.text);
      }
    var {
      tokens: c
    } = e.gullet.consumeArg();
    return o && c.unshift(o), (t === "\\edef" || t === "\\xdef") && (c = e.gullet.expandTokens(c), c.reverse()), e.gullet.macros.set(n, {
      tokens: c,
      numArgs: i,
      delimiters: u
    }, t === Ht[t]), {
      type: "internal",
      mode: e.mode
    };
  }
});
P({
  type: "internal",
  names: [
    "\\let",
    "\\\\globallet"
    // can’t be entered directly
  ],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4, a = Na(e.gullet.popToken());
    e.gullet.consumeSpaces();
    var n = $i(e);
    return Ca(e, a, n, t === "\\\\globallet"), {
      type: "internal",
      mode: e.mode
    };
  }
});
P({
  type: "internal",
  names: [
    "\\futurelet",
    "\\\\globalfuture"
    // can’t be entered directly
  ],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4, a = Na(e.gullet.popToken()), n = e.gullet.popToken(), i = e.gullet.popToken();
    return Ca(e, a, i, t === "\\\\globalfuture"), e.gullet.pushToken(i), e.gullet.pushToken(n), {
      type: "internal",
      mode: e.mode
    };
  }
});
var C0 = function(e, t, a) {
  var n = se.math[e] && se.math[e].replace, i = Xt(n || e, t, a);
  if (!i)
    throw new Error("Unsupported symbol " + e + " and font size " + t + ".");
  return i;
}, rr = function(e, t, a, n) {
  var i = a.havingBaseStyle(t), o = A.makeSpan(n.concat(i.sizingClasses(a)), [e], a), u = i.sizeMultiplier / a.sizeMultiplier;
  return o.height *= u, o.depth *= u, o.maxFontSize = i.sizeMultiplier, o;
}, Da = function(e, t, a) {
  var n = t.havingBaseStyle(a), i = (1 - t.sizeMultiplier / n.sizeMultiplier) * t.fontMetrics().axisHeight;
  e.classes.push("delimcenter"), e.style.top = $(i), e.height -= i, e.depth += i;
}, Fi = function(e, t, a, n, i, o) {
  var u = A.makeSymbol(e, "Main-Regular", i, n), c = rr(u, t, n, o);
  return a && Da(c, n, t), c;
}, Pi = function(e, t, a, n) {
  return A.makeSymbol(e, "Size" + t + "-Regular", a, n);
}, Ra = function(e, t, a, n, i, o) {
  var u = Pi(e, t, i, n), c = rr(A.makeSpan(["delimsizing", "size" + t], [u], n), U.TEXT, n, o);
  return a && Da(c, n, U.TEXT), c;
}, At = function(e, t, a) {
  var n;
  t === "Size1-Regular" ? n = "delim-size1" : n = "delim-size4";
  var i = A.makeSpan(["delimsizinginner", n], [A.makeSpan([], [A.makeSymbol(e, t, a)])]);
  return {
    type: "elem",
    elem: i
  };
}, Tt = function(e, t, a) {
  var n = Ze["Size4-Regular"][e.charCodeAt(0)] ? Ze["Size4-Regular"][e.charCodeAt(0)][4] : Ze["Size1-Regular"][e.charCodeAt(0)][4], i = new w0("inner", Wn(e, Math.round(1e3 * t))), o = new m0([i], {
    width: $(n),
    height: $(t),
    // Override CSS rule `.katex svg { width: 100% }`
    style: "width:" + $(n),
    viewBox: "0 0 " + 1e3 * n + " " + Math.round(1e3 * t),
    preserveAspectRatio: "xMinYMin"
  }), u = A.makeSvgSpan([], [o], a);
  return u.height = t, u.style.height = $(t), u.style.width = $(n), {
    type: "elem",
    elem: u
  };
}, Gt = 8e-3, K0 = {
  type: "kern",
  size: -1 * Gt
}, qi = ["|", "\\lvert", "\\rvert", "\\vert"], Hi = ["\\|", "\\lVert", "\\rVert", "\\Vert"], Ia = function(e, t, a, n, i, o) {
  var u, c, m, p;
  u = m = p = e, c = null;
  var v = "Size1-Regular";
  e === "\\uparrow" ? m = p = "⏐" : e === "\\Uparrow" ? m = p = "‖" : e === "\\downarrow" ? u = m = "⏐" : e === "\\Downarrow" ? u = m = "‖" : e === "\\updownarrow" ? (u = "\\uparrow", m = "⏐", p = "\\downarrow") : e === "\\Updownarrow" ? (u = "\\Uparrow", m = "‖", p = "\\Downarrow") : W.contains(qi, e) ? m = "∣" : W.contains(Hi, e) ? m = "∥" : e === "[" || e === "\\lbrack" ? (u = "⎡", m = "⎢", p = "⎣", v = "Size4-Regular") : e === "]" || e === "\\rbrack" ? (u = "⎤", m = "⎥", p = "⎦", v = "Size4-Regular") : e === "\\lfloor" || e === "⌊" ? (m = u = "⎢", p = "⎣", v = "Size4-Regular") : e === "\\lceil" || e === "⌈" ? (u = "⎡", m = p = "⎢", v = "Size4-Regular") : e === "\\rfloor" || e === "⌋" ? (m = u = "⎥", p = "⎦", v = "Size4-Regular") : e === "\\rceil" || e === "⌉" ? (u = "⎤", m = p = "⎥", v = "Size4-Regular") : e === "(" || e === "\\lparen" ? (u = "⎛", m = "⎜", p = "⎝", v = "Size4-Regular") : e === ")" || e === "\\rparen" ? (u = "⎞", m = "⎟", p = "⎠", v = "Size4-Regular") : e === "\\{" || e === "\\lbrace" ? (u = "⎧", c = "⎨", p = "⎩", m = "⎪", v = "Size4-Regular") : e === "\\}" || e === "\\rbrace" ? (u = "⎫", c = "⎬", p = "⎭", m = "⎪", v = "Size4-Regular") : e === "\\lgroup" || e === "⟮" ? (u = "⎧", p = "⎩", m = "⎪", v = "Size4-Regular") : e === "\\rgroup" || e === "⟯" ? (u = "⎫", p = "⎭", m = "⎪", v = "Size4-Regular") : e === "\\lmoustache" || e === "⎰" ? (u = "⎧", p = "⎭", m = "⎪", v = "Size4-Regular") : (e === "\\rmoustache" || e === "⎱") && (u = "⎫", p = "⎩", m = "⎪", v = "Size4-Regular");
  var k = C0(u, v, i), S = k.height + k.depth, z = C0(m, v, i), T = z.height + z.depth, _ = C0(p, v, i), M = _.height + _.depth, b = 0, y = 1;
  if (c !== null) {
    var E = C0(c, v, i);
    b = E.height + E.depth, y = 2;
  }
  var N = S + M + b, C = Math.max(0, Math.ceil((t - N) / (y * T))), I = N + C * y * T, F = n.fontMetrics().axisHeight;
  a && (F *= n.sizeMultiplier);
  var O = I / 2 - F, Y = [];
  if (Y.push(At(p, v, i)), Y.push(K0), c === null) {
    var J = I - S - M + 2 * Gt;
    Y.push(Tt(m, J, n));
  } else {
    var ce = (I - S - M - b) / 2 + 2 * Gt;
    Y.push(Tt(m, ce, n)), Y.push(K0), Y.push(At(c, v, i)), Y.push(K0), Y.push(Tt(m, ce, n));
  }
  Y.push(K0), Y.push(At(u, v, i));
  var xe = n.havingBaseStyle(U.TEXT), fe = A.makeVList({
    positionType: "bottom",
    positionData: O,
    children: Y
  }, xe);
  return rr(A.makeSpan(["delimsizing", "mult"], [fe], xe), U.TEXT, n, o);
}, _t = 80, Et = 0.08, Mt = function(e, t, a, n, i) {
  var o = Yn(e, n, a), u = new w0(e, o), c = new m0([u], {
    // Note: 1000:1 ratio of viewBox to document em width.
    width: "400em",
    height: $(t),
    viewBox: "0 0 400000 " + a,
    preserveAspectRatio: "xMinYMin slice"
  });
  return A.makeSvgSpan(["hide-tail"], [c], i);
}, Gi = function(e, t) {
  var a = t.havingBaseSizing(), n = $a("\\surd", e * a.sizeMultiplier, La, a), i = a.sizeMultiplier, o = Math.max(0, t.minRuleThickness - t.fontMetrics().sqrtRuleThickness), u, c = 0, m = 0, p = 0, v;
  return n.type === "small" ? (p = 1e3 + 1e3 * o + _t, e < 1 ? i = 1 : e < 1.4 && (i = 0.7), c = (1 + o + Et) / i, m = (1 + o) / i, u = Mt("sqrtMain", c, p, o, t), u.style.minWidth = "0.853em", v = 0.833 / i) : n.type === "large" ? (p = (1e3 + _t) * R0[n.size], m = (R0[n.size] + o) / i, c = (R0[n.size] + o + Et) / i, u = Mt("sqrtSize" + n.size, c, p, o, t), u.style.minWidth = "1.02em", v = 1 / i) : (c = e + o + Et, m = e + o, p = Math.floor(1e3 * e + o) + _t, u = Mt("sqrtTall", c, p, o, t), u.style.minWidth = "0.742em", v = 1.056), u.height = m, u.style.height = $(c), {
    span: u,
    advanceWidth: v,
    // Calculate the actual line width.
    // This actually should depend on the chosen font -- e.g. \boldmath
    // should use the thicker surd symbols from e.g. KaTeX_Main-Bold, and
    // have thicker rules.
    ruleWidth: (t.fontMetrics().sqrtRuleThickness + o) * i
  };
}, Ba = ["(", "\\lparen", ")", "\\rparen", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "⌊", "⌋", "\\lceil", "\\rceil", "⌈", "⌉", "\\surd"], Ui = ["\\uparrow", "\\downarrow", "\\updownarrow", "\\Uparrow", "\\Downarrow", "\\Updownarrow", "|", "\\|", "\\vert", "\\Vert", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "⟮", "⟯", "\\lmoustache", "\\rmoustache", "⎰", "⎱"], Oa = ["<", ">", "\\langle", "\\rangle", "/", "\\backslash", "\\lt", "\\gt"], R0 = [0, 1.2, 1.8, 2.4, 3], Vi = function(e, t, a, n, i) {
  if (e === "<" || e === "\\lt" || e === "⟨" ? e = "\\langle" : (e === ">" || e === "\\gt" || e === "⟩") && (e = "\\rangle"), W.contains(Ba, e) || W.contains(Oa, e))
    return Ra(e, t, false, a, n, i);
  if (W.contains(Ui, e))
    return Ia(e, R0[t], false, a, n, i);
  throw new L("Illegal delimiter: '" + e + "'");
}, ji = [{
  type: "small",
  style: U.SCRIPTSCRIPT
}, {
  type: "small",
  style: U.SCRIPT
}, {
  type: "small",
  style: U.TEXT
}, {
  type: "large",
  size: 1
}, {
  type: "large",
  size: 2
}, {
  type: "large",
  size: 3
}, {
  type: "large",
  size: 4
}], Yi = [{
  type: "small",
  style: U.SCRIPTSCRIPT
}, {
  type: "small",
  style: U.SCRIPT
}, {
  type: "small",
  style: U.TEXT
}, {
  type: "stack"
}], La = [{
  type: "small",
  style: U.SCRIPTSCRIPT
}, {
  type: "small",
  style: U.SCRIPT
}, {
  type: "small",
  style: U.TEXT
}, {
  type: "large",
  size: 1
}, {
  type: "large",
  size: 2
}, {
  type: "large",
  size: 3
}, {
  type: "large",
  size: 4
}, {
  type: "stack"
}], Wi = function(e) {
  if (e.type === "small")
    return "Main-Regular";
  if (e.type === "large")
    return "Size" + e.size + "-Regular";
  if (e.type === "stack")
    return "Size4-Regular";
  throw new Error("Add support for delim type '" + e.type + "' here.");
}, $a = function(e, t, a, n) {
  for (var i = Math.min(2, 3 - n.style.size), o = i; o < a.length && a[o].type !== "stack"; o++) {
    var u = C0(e, Wi(a[o]), "math"), c = u.height + u.depth;
    if (a[o].type === "small") {
      var m = n.havingBaseStyle(a[o].style);
      c *= m.sizeMultiplier;
    }
    if (c > t)
      return a[o];
  }
  return a[a.length - 1];
}, Fa = function(e, t, a, n, i, o) {
  e === "<" || e === "\\lt" || e === "⟨" ? e = "\\langle" : (e === ">" || e === "\\gt" || e === "⟩") && (e = "\\rangle");
  var u;
  W.contains(Oa, e) ? u = ji : W.contains(Ba, e) ? u = La : u = Yi;
  var c = $a(e, t, u, n);
  return c.type === "small" ? Fi(e, c.style, a, n, i, o) : c.type === "large" ? Ra(e, c.size, a, n, i, o) : Ia(e, t, a, n, i, o);
}, Xi = function(e, t, a, n, i, o) {
  var u = n.fontMetrics().axisHeight * n.sizeMultiplier, c = 901, m = 5 / n.fontMetrics().ptPerEm, p = Math.max(t - u, a + u), v = Math.max(
    // In real TeX, calculations are done using integral values which are
    // 65536 per pt, or 655360 per em. So, the division here truncates in
    // TeX but doesn't here, producing different results. If we wanted to
    // exactly match TeX's calculation, we could do
    //   Math.floor(655360 * maxDistFromAxis / 500) *
    //    delimiterFactor / 655360
    // (To see the difference, compare
    //    x^{x^{\left(\rule{0.1em}{0.68em}\right)}}
    // in TeX and KaTeX)
    p / 500 * c,
    2 * p - m
  );
  return Fa(e, v, true, n, i, o);
}, n0 = {
  sqrtImage: Gi,
  sizedDelim: Vi,
  sizeToMaxHeight: R0,
  customSizedDelim: Fa,
  leftRightDelim: Xi
}, Dr = {
  "\\bigl": {
    mclass: "mopen",
    size: 1
  },
  "\\Bigl": {
    mclass: "mopen",
    size: 2
  },
  "\\biggl": {
    mclass: "mopen",
    size: 3
  },
  "\\Biggl": {
    mclass: "mopen",
    size: 4
  },
  "\\bigr": {
    mclass: "mclose",
    size: 1
  },
  "\\Bigr": {
    mclass: "mclose",
    size: 2
  },
  "\\biggr": {
    mclass: "mclose",
    size: 3
  },
  "\\Biggr": {
    mclass: "mclose",
    size: 4
  },
  "\\bigm": {
    mclass: "mrel",
    size: 1
  },
  "\\Bigm": {
    mclass: "mrel",
    size: 2
  },
  "\\biggm": {
    mclass: "mrel",
    size: 3
  },
  "\\Biggm": {
    mclass: "mrel",
    size: 4
  },
  "\\big": {
    mclass: "mord",
    size: 1
  },
  "\\Big": {
    mclass: "mord",
    size: 2
  },
  "\\bigg": {
    mclass: "mord",
    size: 3
  },
  "\\Bigg": {
    mclass: "mord",
    size: 4
  }
}, Zi = ["(", "\\lparen", ")", "\\rparen", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "⌊", "⌋", "\\lceil", "\\rceil", "⌈", "⌉", "<", ">", "\\langle", "⟨", "\\rangle", "⟩", "\\lt", "\\gt", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "⟮", "⟯", "\\lmoustache", "\\rmoustache", "⎰", "⎱", "/", "\\backslash", "|", "\\vert", "\\|", "\\Vert", "\\uparrow", "\\Uparrow", "\\downarrow", "\\Downarrow", "\\updownarrow", "\\Updownarrow", "."];
function mt(r4, e) {
  var t = ht(r4);
  if (t && W.contains(Zi, t.text))
    return t;
  throw t ? new L("Invalid delimiter '" + t.text + "' after '" + e.funcName + "'", r4) : new L("Invalid delimiter type '" + r4.type + "'", r4);
}
P({
  type: "delimsizing",
  names: ["\\bigl", "\\Bigl", "\\biggl", "\\Biggl", "\\bigr", "\\Bigr", "\\biggr", "\\Biggr", "\\bigm", "\\Bigm", "\\biggm", "\\Biggm", "\\big", "\\Big", "\\bigg", "\\Bigg"],
  props: {
    numArgs: 1,
    argTypes: ["primitive"]
  },
  handler: (r4, e) => {
    var t = mt(e[0], r4);
    return {
      type: "delimsizing",
      mode: r4.parser.mode,
      size: Dr[r4.funcName].size,
      mclass: Dr[r4.funcName].mclass,
      delim: t.text
    };
  },
  htmlBuilder: (r4, e) => r4.delim === "." ? A.makeSpan([r4.mclass]) : n0.sizedDelim(r4.delim, r4.size, e, r4.mode, [r4.mclass]),
  mathmlBuilder: (r4) => {
    var e = [];
    r4.delim !== "." && e.push(Ue(r4.delim, r4.mode));
    var t = new B.MathNode("mo", e);
    r4.mclass === "mopen" || r4.mclass === "mclose" ? t.setAttribute("fence", "true") : t.setAttribute("fence", "false"), t.setAttribute("stretchy", "true");
    var a = $(n0.sizeToMaxHeight[r4.size]);
    return t.setAttribute("minsize", a), t.setAttribute("maxsize", a), t;
  }
});
function Rr(r4) {
  if (!r4.body)
    throw new Error("Bug: The leftright ParseNode wasn't fully parsed.");
}
P({
  type: "leftright-right",
  names: ["\\right"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (r4, e) => {
    var t = r4.parser.gullet.macros.get("\\current@color");
    if (t && typeof t != "string")
      throw new L("\\current@color set to non-string in \\right");
    return {
      type: "leftright-right",
      mode: r4.parser.mode,
      delim: mt(e[0], r4).text,
      color: t
      // undefined if not set via \color
    };
  }
});
P({
  type: "leftright",
  names: ["\\left"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (r4, e) => {
    var t = mt(e[0], r4), a = r4.parser;
    ++a.leftrightDepth;
    var n = a.parseExpression(false);
    --a.leftrightDepth, a.expect("\\right", false);
    var i = K(a.parseFunction(), "leftright-right");
    return {
      type: "leftright",
      mode: a.mode,
      body: n,
      left: t.text,
      right: i.delim,
      rightColor: i.color
    };
  },
  htmlBuilder: (r4, e) => {
    Rr(r4);
    for (var t = Ae(r4.body, e, true, ["mopen", "mclose"]), a = 0, n = 0, i = false, o = 0; o < t.length; o++)
      t[o].isMiddle ? i = true : (a = Math.max(t[o].height, a), n = Math.max(t[o].depth, n));
    a *= e.sizeMultiplier, n *= e.sizeMultiplier;
    var u;
    if (r4.left === "." ? u = B0(e, ["mopen"]) : u = n0.leftRightDelim(r4.left, a, n, e, r4.mode, ["mopen"]), t.unshift(u), i)
      for (var c = 1; c < t.length; c++) {
        var m = t[c], p = m.isMiddle;
        p && (t[c] = n0.leftRightDelim(p.delim, a, n, p.options, r4.mode, []));
      }
    var v;
    if (r4.right === ".")
      v = B0(e, ["mclose"]);
    else {
      var k = r4.rightColor ? e.withColor(r4.rightColor) : e;
      v = n0.leftRightDelim(r4.right, a, n, k, r4.mode, ["mclose"]);
    }
    return t.push(v), A.makeSpan(["minner"], t, e);
  },
  mathmlBuilder: (r4, e) => {
    Rr(r4);
    var t = Oe(r4.body, e);
    if (r4.left !== ".") {
      var a = new B.MathNode("mo", [Ue(r4.left, r4.mode)]);
      a.setAttribute("fence", "true"), t.unshift(a);
    }
    if (r4.right !== ".") {
      var n = new B.MathNode("mo", [Ue(r4.right, r4.mode)]);
      n.setAttribute("fence", "true"), r4.rightColor && n.setAttribute("mathcolor", r4.rightColor), t.push(n);
    }
    return Jt(t);
  }
});
P({
  type: "middle",
  names: ["\\middle"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (r4, e) => {
    var t = mt(e[0], r4);
    if (!r4.parser.leftrightDepth)
      throw new L("\\middle without preceding \\left", t);
    return {
      type: "middle",
      mode: r4.parser.mode,
      delim: t.text
    };
  },
  htmlBuilder: (r4, e) => {
    var t;
    if (r4.delim === ".")
      t = B0(e, []);
    else {
      t = n0.sizedDelim(r4.delim, 1, e, r4.mode, []);
      var a = {
        delim: r4.delim,
        options: e
      };
      t.isMiddle = a;
    }
    return t;
  },
  mathmlBuilder: (r4, e) => {
    var t = r4.delim === "\\vert" || r4.delim === "|" ? Ue("|", "text") : Ue(r4.delim, r4.mode), a = new B.MathNode("mo", [t]);
    return a.setAttribute("fence", "true"), a.setAttribute("lspace", "0.05em"), a.setAttribute("rspace", "0.05em"), a;
  }
});
var ar = (r4, e) => {
  var t = A.wrapFragment(te(r4.body, e), e), a = r4.label.substr(1), n = e.sizeMultiplier, i, o = 0, u = W.isCharacterBox(r4.body);
  if (a === "sout")
    i = A.makeSpan(["stretchy", "sout"]), i.height = e.fontMetrics().defaultRuleThickness / n, o = -0.5 * e.fontMetrics().xHeight;
  else if (a === "phase") {
    var c = pe({
      number: 0.6,
      unit: "pt"
    }, e), m = pe({
      number: 0.35,
      unit: "ex"
    }, e), p = e.havingBaseSizing();
    n = n / p.sizeMultiplier;
    var v = t.height + t.depth + c + m;
    t.style.paddingLeft = $(v / 2 + c);
    var k = Math.floor(1e3 * v * n), S = Vn(k), z = new m0([new w0("phase", S)], {
      width: "400em",
      height: $(k / 1e3),
      viewBox: "0 0 400000 " + k,
      preserveAspectRatio: "xMinYMin slice"
    });
    i = A.makeSvgSpan(["hide-tail"], [z], e), i.style.height = $(v), o = t.depth + c + m;
  } else {
    /cancel/.test(a) ? u || t.classes.push("cancel-pad") : a === "angl" ? t.classes.push("anglpad") : t.classes.push("boxpad");
    var T = 0, _ = 0, M = 0;
    /box/.test(a) ? (M = Math.max(
      e.fontMetrics().fboxrule,
      // default
      e.minRuleThickness
      // User override.
    ), T = e.fontMetrics().fboxsep + (a === "colorbox" ? 0 : M), _ = T) : a === "angl" ? (M = Math.max(e.fontMetrics().defaultRuleThickness, e.minRuleThickness), T = 4 * M, _ = Math.max(0, 0.25 - t.depth)) : (T = u ? 0.2 : 0, _ = T), i = s0.encloseSpan(t, a, T, _, e), /fbox|boxed|fcolorbox/.test(a) ? (i.style.borderStyle = "solid", i.style.borderWidth = $(M)) : a === "angl" && M !== 0.049 && (i.style.borderTopWidth = $(M), i.style.borderRightWidth = $(M)), o = t.depth + _, r4.backgroundColor && (i.style.backgroundColor = r4.backgroundColor, r4.borderColor && (i.style.borderColor = r4.borderColor));
  }
  var b;
  if (r4.backgroundColor)
    b = A.makeVList({
      positionType: "individualShift",
      children: [
        // Put the color background behind inner;
        {
          type: "elem",
          elem: i,
          shift: o
        },
        {
          type: "elem",
          elem: t,
          shift: 0
        }
      ]
    }, e);
  else {
    var y = /cancel|phase/.test(a) ? ["svg-align"] : [];
    b = A.makeVList({
      positionType: "individualShift",
      children: [
        // Write the \cancel stroke on top of inner.
        {
          type: "elem",
          elem: t,
          shift: 0
        },
        {
          type: "elem",
          elem: i,
          shift: o,
          wrapperClasses: y
        }
      ]
    }, e);
  }
  return /cancel/.test(a) && (b.height = t.height, b.depth = t.depth), /cancel/.test(a) && !u ? A.makeSpan(["mord", "cancel-lap"], [b], e) : A.makeSpan(["mord"], [b], e);
}, nr = (r4, e) => {
  var t = 0, a = new B.MathNode(r4.label.indexOf("colorbox") > -1 ? "mpadded" : "menclose", [ne(r4.body, e)]);
  switch (r4.label) {
    case "\\cancel":
      a.setAttribute("notation", "updiagonalstrike");
      break;
    case "\\bcancel":
      a.setAttribute("notation", "downdiagonalstrike");
      break;
    case "\\phase":
      a.setAttribute("notation", "phasorangle");
      break;
    case "\\sout":
      a.setAttribute("notation", "horizontalstrike");
      break;
    case "\\fbox":
      a.setAttribute("notation", "box");
      break;
    case "\\angl":
      a.setAttribute("notation", "actuarial");
      break;
    case "\\fcolorbox":
    case "\\colorbox":
      if (t = e.fontMetrics().fboxsep * e.fontMetrics().ptPerEm, a.setAttribute("width", "+" + 2 * t + "pt"), a.setAttribute("height", "+" + 2 * t + "pt"), a.setAttribute("lspace", t + "pt"), a.setAttribute("voffset", t + "pt"), r4.label === "\\fcolorbox") {
        var n = Math.max(
          e.fontMetrics().fboxrule,
          // default
          e.minRuleThickness
          // user override
        );
        a.setAttribute("style", "border: " + n + "em solid " + String(r4.borderColor));
      }
      break;
    case "\\xcancel":
      a.setAttribute("notation", "updiagonalstrike downdiagonalstrike");
      break;
  }
  return r4.backgroundColor && a.setAttribute("mathbackground", r4.backgroundColor), a;
};
P({
  type: "enclose",
  names: ["\\colorbox"],
  props: {
    numArgs: 2,
    allowedInText: true,
    argTypes: ["color", "text"]
  },
  handler(r4, e, t) {
    var {
      parser: a,
      funcName: n
    } = r4, i = K(e[0], "color-token").color, o = e[1];
    return {
      type: "enclose",
      mode: a.mode,
      label: n,
      backgroundColor: i,
      body: o
    };
  },
  htmlBuilder: ar,
  mathmlBuilder: nr
});
P({
  type: "enclose",
  names: ["\\fcolorbox"],
  props: {
    numArgs: 3,
    allowedInText: true,
    argTypes: ["color", "color", "text"]
  },
  handler(r4, e, t) {
    var {
      parser: a,
      funcName: n
    } = r4, i = K(e[0], "color-token").color, o = K(e[1], "color-token").color, u = e[2];
    return {
      type: "enclose",
      mode: a.mode,
      label: n,
      backgroundColor: o,
      borderColor: i,
      body: u
    };
  },
  htmlBuilder: ar,
  mathmlBuilder: nr
});
P({
  type: "enclose",
  names: ["\\fbox"],
  props: {
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: true
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "enclose",
      mode: t.mode,
      label: "\\fbox",
      body: e[0]
    };
  }
});
P({
  type: "enclose",
  names: ["\\cancel", "\\bcancel", "\\xcancel", "\\sout", "\\phase"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    return {
      type: "enclose",
      mode: t.mode,
      label: a,
      body: n
    };
  },
  htmlBuilder: ar,
  mathmlBuilder: nr
});
P({
  type: "enclose",
  names: ["\\angl"],
  props: {
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: false
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "enclose",
      mode: t.mode,
      label: "\\angl",
      body: e[0]
    };
  }
});
var Pa = {};
function Je(r4) {
  for (var {
    type: e,
    names: t,
    props: a,
    handler: n,
    htmlBuilder: i,
    mathmlBuilder: o
  } = r4, u = {
    type: e,
    numArgs: a.numArgs || 0,
    allowedInText: false,
    numOptionalArgs: 0,
    handler: n
  }, c = 0; c < t.length; ++c)
    Pa[t[c]] = u;
  i && (it[e] = i), o && (st[e] = o);
}
var qa = {};
function h(r4, e) {
  qa[r4] = e;
}
function Ir(r4) {
  var e = [];
  r4.consumeSpaces();
  for (var t = r4.fetch().text; t === "\\hline" || t === "\\hdashline"; )
    r4.consume(), e.push(t === "\\hdashline"), r4.consumeSpaces(), t = r4.fetch().text;
  return e;
}
var pt = (r4) => {
  var e = r4.parser.settings;
  if (!e.displayMode)
    throw new L("{" + r4.envName + "} can be used only in display mode.");
};
function ir(r4) {
  if (r4.indexOf("ed") === -1)
    return r4.indexOf("*") === -1;
}
function f0(r4, e, t) {
  var {
    hskipBeforeAndAfter: a,
    addJot: n,
    cols: i,
    arraystretch: o,
    colSeparationType: u,
    autoTag: c,
    singleRow: m,
    emptySingleRow: p,
    maxNumCols: v,
    leqno: k
  } = e;
  if (r4.gullet.beginGroup(), m || r4.gullet.macros.set("\\cr", "\\\\\\relax"), !o) {
    var S = r4.gullet.expandMacroAsText("\\arraystretch");
    if (S == null)
      o = 1;
    else if (o = parseFloat(S), !o || o < 0)
      throw new L("Invalid \\arraystretch: " + S);
  }
  r4.gullet.beginGroup();
  var z = [], T = [z], _ = [], M = [], b = c != null ? [] : void 0;
  function y() {
    c && r4.gullet.macros.set("\\@eqnsw", "1", true);
  }
  function E() {
    b && (r4.gullet.macros.get("\\df@tag") ? (b.push(r4.subparse([new qe("\\df@tag")])), r4.gullet.macros.set("\\df@tag", void 0, true)) : b.push(!!c && r4.gullet.macros.get("\\@eqnsw") === "1"));
  }
  for (y(), M.push(Ir(r4)); ; ) {
    var N = r4.parseExpression(false, m ? "\\end" : "\\\\");
    r4.gullet.endGroup(), r4.gullet.beginGroup(), N = {
      type: "ordgroup",
      mode: r4.mode,
      body: N
    }, t && (N = {
      type: "styling",
      mode: r4.mode,
      style: t,
      body: [N]
    }), z.push(N);
    var C = r4.fetch().text;
    if (C === "&") {
      if (v && z.length === v) {
        if (m || u)
          throw new L("Too many tab characters: &", r4.nextToken);
        r4.settings.reportNonstrict("textEnv", "Too few columns specified in the {array} column argument.");
      }
      r4.consume();
    } else if (C === "\\end") {
      E(), z.length === 1 && N.type === "styling" && N.body[0].body.length === 0 && (T.length > 1 || !p) && T.pop(), M.length < T.length + 1 && M.push([]);
      break;
    } else if (C === "\\\\") {
      r4.consume();
      var I = void 0;
      r4.gullet.future().text !== " " && (I = r4.parseSizeGroup(true)), _.push(I ? I.value : null), E(), M.push(Ir(r4)), z = [], T.push(z), y();
    } else
      throw new L("Expected & or \\\\ or \\cr or \\end", r4.nextToken);
  }
  return r4.gullet.endGroup(), r4.gullet.endGroup(), {
    type: "array",
    mode: r4.mode,
    addJot: n,
    arraystretch: o,
    body: T,
    cols: i,
    rowGaps: _,
    hskipBeforeAndAfter: a,
    hLinesBeforeRow: M,
    colSeparationType: u,
    tags: b,
    leqno: k
  };
}
function sr(r4) {
  return r4.substr(0, 1) === "d" ? "display" : "text";
}
var Qe = function(e, t) {
  var a, n, i = e.body.length, o = e.hLinesBeforeRow, u = 0, c = new Array(i), m = [], p = Math.max(
    // From LaTeX \showthe\arrayrulewidth. Equals 0.04 em.
    t.fontMetrics().arrayRuleWidth,
    t.minRuleThickness
    // User override.
  ), v = 1 / t.fontMetrics().ptPerEm, k = 5 * v;
  if (e.colSeparationType && e.colSeparationType === "small") {
    var S = t.havingStyle(U.SCRIPT).sizeMultiplier;
    k = 0.2778 * (S / t.sizeMultiplier);
  }
  var z = e.colSeparationType === "CD" ? pe({
    number: 3,
    unit: "ex"
  }, t) : 12 * v, T = 3 * v, _ = e.arraystretch * z, M = 0.7 * _, b = 0.3 * _, y = 0;
  function E(H0) {
    for (var G0 = 0; G0 < H0.length; ++G0)
      G0 > 0 && (y += 0.25), m.push({
        pos: y,
        isDashed: H0[G0]
      });
  }
  for (E(o[0]), a = 0; a < e.body.length; ++a) {
    var N = e.body[a], C = M, I = b;
    u < N.length && (u = N.length);
    var F = new Array(N.length);
    for (n = 0; n < N.length; ++n) {
      var O = te(N[n], t);
      I < O.depth && (I = O.depth), C < O.height && (C = O.height), F[n] = O;
    }
    var Y = e.rowGaps[a], J = 0;
    Y && (J = pe(Y, t), J > 0 && (J += b, I < J && (I = J), J = 0)), e.addJot && (I += T), F.height = C, F.depth = I, y += C, F.pos = y, y += I + J, c[a] = F, E(o[a + 1]);
  }
  var ce = y / 2 + t.fontMetrics().axisHeight, xe = e.cols || [], fe = [], Te, ye, Le = [];
  if (e.tags && e.tags.some((H0) => H0))
    for (a = 0; a < i; ++a) {
      var ae = c[a], le = ae.pos - ce, ke = e.tags[a], _e = void 0;
      ke === true ? _e = A.makeSpan(["eqn-num"], [], t) : ke === false ? _e = A.makeSpan([], [], t) : _e = A.makeSpan([], Ae(ke, t, true), t), _e.depth = ae.depth, _e.height = ae.height, Le.push({
        type: "elem",
        elem: _e,
        shift: le
      });
    }
  for (
    n = 0, ye = 0;
    // Continue while either there are more columns or more column
    // descriptions, so trailing separators don't get lost.
    n < u || ye < xe.length;
    ++n, ++ye
  ) {
    for (var he = xe[ye] || {}, q0 = true; he.type === "separator"; ) {
      if (q0 || (Te = A.makeSpan(["arraycolsep"], []), Te.style.width = $(t.fontMetrics().doubleRuleSep), fe.push(Te)), he.separator === "|" || he.separator === ":") {
        var Ye = he.separator === "|" ? "solid" : "dashed", $e = A.makeSpan(["vertical-separator"], [], t);
        $e.style.height = $(y), $e.style.borderRightWidth = $(p), $e.style.borderRightStyle = Ye, $e.style.margin = "0 " + $(-p / 2);
        var g0 = y - ce;
        g0 && ($e.style.verticalAlign = $(-g0)), fe.push($e);
      } else
        throw new L("Invalid separator type: " + he.separator);
      ye++, he = xe[ye] || {}, q0 = false;
    }
    if (!(n >= u)) {
      var Ve = void 0;
      (n > 0 || e.hskipBeforeAndAfter) && (Ve = W.deflt(he.pregap, k), Ve !== 0 && (Te = A.makeSpan(["arraycolsep"], []), Te.style.width = $(Ve), fe.push(Te)));
      var We = [];
      for (a = 0; a < i; ++a) {
        var v0 = c[a], o0 = v0[n];
        if (o0) {
          var S0 = v0.pos - ce;
          o0.depth = v0.depth, o0.height = v0.height, We.push({
            type: "elem",
            elem: o0,
            shift: S0
          });
        }
      }
      We = A.makeVList({
        positionType: "individualShift",
        children: We
      }, t), We = A.makeSpan(["col-align-" + (he.align || "c")], [We]), fe.push(We), (n < u - 1 || e.hskipBeforeAndAfter) && (Ve = W.deflt(he.postgap, k), Ve !== 0 && (Te = A.makeSpan(["arraycolsep"], []), Te.style.width = $(Ve), fe.push(Te)));
    }
  }
  if (c = A.makeSpan(["mtable"], fe), m.length > 0) {
    for (var gt = A.makeLineSpan("hline", t, p), N0 = A.makeLineSpan("hdashline", t, p), vt = [{
      type: "elem",
      elem: c,
      shift: 0
    }]; m.length > 0; ) {
      var fr = m.pop(), gr = fr.pos - ce;
      fr.isDashed ? vt.push({
        type: "elem",
        elem: N0,
        shift: gr
      }) : vt.push({
        type: "elem",
        elem: gt,
        shift: gr
      });
    }
    c = A.makeVList({
      positionType: "individualShift",
      children: vt
    }, t);
  }
  if (Le.length === 0)
    return A.makeSpan(["mord"], [c], t);
  var bt = A.makeVList({
    positionType: "individualShift",
    children: Le
  }, t);
  return bt = A.makeSpan(["tag"], [bt], t), A.makeFragment([c, bt]);
}, Ki = {
  c: "center ",
  l: "left ",
  r: "right "
}, e0 = function(e, t) {
  for (var a = [], n = new B.MathNode("mtd", [], ["mtr-glue"]), i = new B.MathNode("mtd", [], ["mml-eqn-num"]), o = 0; o < e.body.length; o++) {
    for (var u = e.body[o], c = [], m = 0; m < u.length; m++)
      c.push(new B.MathNode("mtd", [ne(u[m], t)]));
    e.tags && e.tags[o] && (c.unshift(n), c.push(n), e.leqno ? c.unshift(i) : c.push(i)), a.push(new B.MathNode("mtr", c));
  }
  var p = new B.MathNode("mtable", a), v = e.arraystretch === 0.5 ? 0.1 : 0.16 + e.arraystretch - 1 + (e.addJot ? 0.09 : 0);
  p.setAttribute("rowspacing", $(v));
  var k = "", S = "";
  if (e.cols && e.cols.length > 0) {
    var z = e.cols, T = "", _ = false, M = 0, b = z.length;
    z[0].type === "separator" && (k += "top ", M = 1), z[z.length - 1].type === "separator" && (k += "bottom ", b -= 1);
    for (var y = M; y < b; y++)
      z[y].type === "align" ? (S += Ki[z[y].align], _ && (T += "none "), _ = true) : z[y].type === "separator" && _ && (T += z[y].separator === "|" ? "solid " : "dashed ", _ = false);
    p.setAttribute("columnalign", S.trim()), /[sd]/.test(T) && p.setAttribute("columnlines", T.trim());
  }
  if (e.colSeparationType === "align") {
    for (var E = e.cols || [], N = "", C = 1; C < E.length; C++)
      N += C % 2 ? "0em " : "1em ";
    p.setAttribute("columnspacing", N.trim());
  } else
    e.colSeparationType === "alignat" || e.colSeparationType === "gather" ? p.setAttribute("columnspacing", "0em") : e.colSeparationType === "small" ? p.setAttribute("columnspacing", "0.2778em") : e.colSeparationType === "CD" ? p.setAttribute("columnspacing", "0.5em") : p.setAttribute("columnspacing", "1em");
  var I = "", F = e.hLinesBeforeRow;
  k += F[0].length > 0 ? "left " : "", k += F[F.length - 1].length > 0 ? "right " : "";
  for (var O = 1; O < F.length - 1; O++)
    I += F[O].length === 0 ? "none " : F[O][0] ? "dashed " : "solid ";
  return /[sd]/.test(I) && p.setAttribute("rowlines", I.trim()), k !== "" && (p = new B.MathNode("menclose", [p]), p.setAttribute("notation", k.trim())), e.arraystretch && e.arraystretch < 1 && (p = new B.MathNode("mstyle", [p]), p.setAttribute("scriptlevel", "1")), p;
}, Ha = function(e, t) {
  e.envName.indexOf("ed") === -1 && pt(e);
  var a = [], n = e.envName.indexOf("at") > -1 ? "alignat" : "align", i = e.envName === "split", o = f0(e.parser, {
    cols: a,
    addJot: true,
    autoTag: i ? void 0 : ir(e.envName),
    emptySingleRow: true,
    colSeparationType: n,
    maxNumCols: i ? 2 : void 0,
    leqno: e.parser.settings.leqno
  }, "display"), u, c = 0, m = {
    type: "ordgroup",
    mode: e.mode,
    body: []
  };
  if (t[0] && t[0].type === "ordgroup") {
    for (var p = "", v = 0; v < t[0].body.length; v++) {
      var k = K(t[0].body[v], "textord");
      p += k.text;
    }
    u = Number(p), c = u * 2;
  }
  var S = !c;
  o.body.forEach(function(M) {
    for (var b = 1; b < M.length; b += 2) {
      var y = K(M[b], "styling"), E = K(y.body[0], "ordgroup");
      E.body.unshift(m);
    }
    if (S)
      c < M.length && (c = M.length);
    else {
      var N = M.length / 2;
      if (u < N)
        throw new L("Too many math in a row: " + ("expected " + u + ", but got " + N), M[0]);
    }
  });
  for (var z = 0; z < c; ++z) {
    var T = "r", _ = 0;
    z % 2 === 1 ? T = "l" : z > 0 && S && (_ = 1), a[z] = {
      type: "align",
      align: T,
      pregap: _,
      postgap: 0
    };
  }
  return o.colSeparationType = S ? "align" : "alignat", o;
};
Je({
  type: "array",
  names: ["array", "darray"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var t = ht(e[0]), a = t ? [e[0]] : K(e[0], "ordgroup").body, n = a.map(function(o) {
      var u = er(o), c = u.text;
      if ("lcr".indexOf(c) !== -1)
        return {
          type: "align",
          align: c
        };
      if (c === "|")
        return {
          type: "separator",
          separator: "|"
        };
      if (c === ":")
        return {
          type: "separator",
          separator: ":"
        };
      throw new L("Unknown column alignment: " + c, o);
    }), i = {
      cols: n,
      hskipBeforeAndAfter: true,
      // \@preamble in lttab.dtx
      maxNumCols: n.length
    };
    return f0(r4.parser, i, sr(r4.envName));
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["matrix", "pmatrix", "bmatrix", "Bmatrix", "vmatrix", "Vmatrix", "matrix*", "pmatrix*", "bmatrix*", "Bmatrix*", "vmatrix*", "Vmatrix*"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    var e = {
      matrix: null,
      pmatrix: ["(", ")"],
      bmatrix: ["[", "]"],
      Bmatrix: ["\\{", "\\}"],
      vmatrix: ["|", "|"],
      Vmatrix: ["\\Vert", "\\Vert"]
    }[r4.envName.replace("*", "")], t = "c", a = {
      hskipBeforeAndAfter: false,
      cols: [{
        type: "align",
        align: t
      }]
    };
    if (r4.envName.charAt(r4.envName.length - 1) === "*") {
      var n = r4.parser;
      if (n.consumeSpaces(), n.fetch().text === "[") {
        if (n.consume(), n.consumeSpaces(), t = n.fetch().text, "lcr".indexOf(t) === -1)
          throw new L("Expected l or c or r", n.nextToken);
        n.consume(), n.consumeSpaces(), n.expect("]"), n.consume(), a.cols = [{
          type: "align",
          align: t
        }];
      }
    }
    var i = f0(r4.parser, a, sr(r4.envName)), o = Math.max(0, ...i.body.map((u) => u.length));
    return i.cols = new Array(o).fill({
      type: "align",
      align: t
    }), e ? {
      type: "leftright",
      mode: r4.mode,
      body: [i],
      left: e[0],
      right: e[1],
      rightColor: void 0
      // \right uninfluenced by \color in array
    } : i;
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["smallmatrix"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    var e = {
      arraystretch: 0.5
    }, t = f0(r4.parser, e, "script");
    return t.colSeparationType = "small", t;
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["subarray"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var t = ht(e[0]), a = t ? [e[0]] : K(e[0], "ordgroup").body, n = a.map(function(o) {
      var u = er(o), c = u.text;
      if ("lc".indexOf(c) !== -1)
        return {
          type: "align",
          align: c
        };
      throw new L("Unknown column alignment: " + c, o);
    });
    if (n.length > 1)
      throw new L("{subarray} can contain only one column");
    var i = {
      cols: n,
      hskipBeforeAndAfter: false,
      arraystretch: 0.5
    };
    if (i = f0(r4.parser, i, "script"), i.body.length > 0 && i.body[0].length > 1)
      throw new L("{subarray} can contain only one column");
    return i;
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["cases", "dcases", "rcases", "drcases"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    var e = {
      arraystretch: 1.2,
      cols: [{
        type: "align",
        align: "l",
        pregap: 0,
        // TODO(kevinb) get the current style.
        // For now we use the metrics for TEXT style which is what we were
        // doing before.  Before attempting to get the current style we
        // should look at TeX's behavior especially for \over and matrices.
        postgap: 1
        /* 1em quad */
      }, {
        type: "align",
        align: "l",
        pregap: 0,
        postgap: 0
      }]
    }, t = f0(r4.parser, e, sr(r4.envName));
    return {
      type: "leftright",
      mode: r4.mode,
      body: [t],
      left: r4.envName.indexOf("r") > -1 ? "." : "\\{",
      right: r4.envName.indexOf("r") > -1 ? "\\}" : ".",
      rightColor: void 0
    };
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["align", "align*", "aligned", "split"],
  props: {
    numArgs: 0
  },
  handler: Ha,
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["gathered", "gather", "gather*"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    W.contains(["gather", "gather*"], r4.envName) && pt(r4);
    var e = {
      cols: [{
        type: "align",
        align: "c"
      }],
      addJot: true,
      colSeparationType: "gather",
      autoTag: ir(r4.envName),
      emptySingleRow: true,
      leqno: r4.parser.settings.leqno
    };
    return f0(r4.parser, e, "display");
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["alignat", "alignat*", "alignedat"],
  props: {
    numArgs: 1
  },
  handler: Ha,
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["equation", "equation*"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    pt(r4);
    var e = {
      autoTag: ir(r4.envName),
      emptySingleRow: true,
      singleRow: true,
      maxNumCols: 1,
      leqno: r4.parser.settings.leqno
    };
    return f0(r4.parser, e, "display");
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
Je({
  type: "array",
  names: ["CD"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    return pt(r4), Li(r4.parser);
  },
  htmlBuilder: Qe,
  mathmlBuilder: e0
});
h("\\nonumber", "\\gdef\\@eqnsw{0}");
h("\\notag", "\\nonumber");
P({
  type: "text",
  // Doesn't matter what this is.
  names: ["\\hline", "\\hdashline"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInMath: true
  },
  handler(r4, e) {
    throw new L(r4.funcName + " valid only within array environment");
  }
});
var Br = Pa;
P({
  type: "environment",
  names: ["\\begin", "\\end"],
  props: {
    numArgs: 1,
    argTypes: ["text"]
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    if (n.type !== "ordgroup")
      throw new L("Invalid environment name", n);
    for (var i = "", o = 0; o < n.body.length; ++o)
      i += K(n.body[o], "textord").text;
    if (a === "\\begin") {
      if (!Br.hasOwnProperty(i))
        throw new L("No such environment: " + i, n);
      var u = Br[i], {
        args: c,
        optArgs: m
      } = t.parseArguments("\\begin{" + i + "}", u), p = {
        mode: t.mode,
        envName: i,
        parser: t
      }, v = u.handler(p, c, m);
      t.expect("\\end", false);
      var k = t.nextToken, S = K(t.parseFunction(), "environment");
      if (S.name !== i)
        throw new L("Mismatch: \\begin{" + i + "} matched by \\end{" + S.name + "}", k);
      return v;
    }
    return {
      type: "environment",
      mode: t.mode,
      name: i,
      nameGroup: n
    };
  }
});
var Ji = A.makeSpan;
function Ga(r4, e) {
  var t = Ae(r4.body, e, true);
  return Ji([r4.mclass], t, e);
}
function Ua(r4, e) {
  var t, a = Oe(r4.body, e);
  return r4.mclass === "minner" ? t = new B.MathNode("mpadded", a) : r4.mclass === "mord" ? r4.isCharacterBox ? (t = a[0], t.type = "mi") : t = new B.MathNode("mi", a) : (r4.isCharacterBox ? (t = a[0], t.type = "mo") : t = new B.MathNode("mo", a), r4.mclass === "mbin" ? (t.attributes.lspace = "0.22em", t.attributes.rspace = "0.22em") : r4.mclass === "mpunct" ? (t.attributes.lspace = "0em", t.attributes.rspace = "0.17em") : r4.mclass === "mopen" || r4.mclass === "mclose" ? (t.attributes.lspace = "0em", t.attributes.rspace = "0em") : r4.mclass === "minner" && (t.attributes.lspace = "0.0556em", t.attributes.width = "+0.1111em")), t;
}
P({
  type: "mclass",
  names: ["\\mathord", "\\mathbin", "\\mathrel", "\\mathopen", "\\mathclose", "\\mathpunct", "\\mathinner"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    return {
      type: "mclass",
      mode: t.mode,
      mclass: "m" + a.substr(5),
      // TODO(kevinb): don't prefix with 'm'
      body: ve(n),
      isCharacterBox: W.isCharacterBox(n)
    };
  },
  htmlBuilder: Ga,
  mathmlBuilder: Ua
});
var lr = (r4) => {
  var e = r4.type === "ordgroup" && r4.body.length ? r4.body[0] : r4;
  return e.type === "atom" && (e.family === "bin" || e.family === "rel") ? "m" + e.family : "mord";
};
P({
  type: "mclass",
  names: ["\\@binrel"],
  props: {
    numArgs: 2
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "mclass",
      mode: t.mode,
      mclass: lr(e[0]),
      body: ve(e[1]),
      isCharacterBox: W.isCharacterBox(e[1])
    };
  }
});
P({
  type: "mclass",
  names: ["\\stackrel", "\\overset", "\\underset"],
  props: {
    numArgs: 2
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[1], i = e[0], o;
    a !== "\\stackrel" ? o = lr(n) : o = "mrel";
    var u = {
      type: "op",
      mode: n.mode,
      limits: true,
      alwaysHandleSupSub: true,
      parentIsSupSub: false,
      symbol: false,
      suppressBaseShift: a !== "\\stackrel",
      body: ve(n)
    }, c = {
      type: "supsub",
      mode: i.mode,
      base: u,
      sup: a === "\\underset" ? null : i,
      sub: a === "\\underset" ? i : null
    };
    return {
      type: "mclass",
      mode: t.mode,
      mclass: o,
      body: [c],
      isCharacterBox: W.isCharacterBox(c)
    };
  },
  htmlBuilder: Ga,
  mathmlBuilder: Ua
});
var Va = (r4, e) => {
  var t = r4.font, a = e.withFont(t);
  return te(r4.body, a);
}, ja = (r4, e) => {
  var t = r4.font, a = e.withFont(t);
  return ne(r4.body, a);
}, Or = {
  "\\Bbb": "\\mathbb",
  "\\bold": "\\mathbf",
  "\\frak": "\\mathfrak",
  "\\bm": "\\boldsymbol"
};
P({
  type: "font",
  names: [
    // styles, except \boldsymbol defined below
    "\\mathrm",
    "\\mathit",
    "\\mathbf",
    "\\mathnormal",
    // families
    "\\mathbb",
    "\\mathcal",
    "\\mathfrak",
    "\\mathscr",
    "\\mathsf",
    "\\mathtt",
    // aliases, except \bm defined below
    "\\Bbb",
    "\\bold",
    "\\frak"
  ],
  props: {
    numArgs: 1,
    allowedInArgument: true
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = lt(e[0]), i = a;
    return i in Or && (i = Or[i]), {
      type: "font",
      mode: t.mode,
      font: i.slice(1),
      body: n
    };
  },
  htmlBuilder: Va,
  mathmlBuilder: ja
});
P({
  type: "mclass",
  names: ["\\boldsymbol", "\\bm"],
  props: {
    numArgs: 1
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = e[0], n = W.isCharacterBox(a);
    return {
      type: "mclass",
      mode: t.mode,
      mclass: lr(a),
      body: [{
        type: "font",
        mode: t.mode,
        font: "boldsymbol",
        body: a
      }],
      isCharacterBox: n
    };
  }
});
P({
  type: "font",
  names: ["\\rm", "\\sf", "\\tt", "\\bf", "\\it", "\\cal"],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a,
      breakOnTokenText: n
    } = r4, {
      mode: i
    } = t, o = t.parseExpression(true, n), u = "math" + a.slice(1);
    return {
      type: "font",
      mode: i,
      font: u,
      body: {
        type: "ordgroup",
        mode: t.mode,
        body: o
      }
    };
  },
  htmlBuilder: Va,
  mathmlBuilder: ja
});
var Ya = (r4, e) => {
  var t = e;
  return r4 === "display" ? t = t.id >= U.SCRIPT.id ? t.text() : U.DISPLAY : r4 === "text" && t.size === U.DISPLAY.size ? t = U.TEXT : r4 === "script" ? t = U.SCRIPT : r4 === "scriptscript" && (t = U.SCRIPTSCRIPT), t;
}, or = (r4, e) => {
  var t = Ya(r4.size, e.style), a = t.fracNum(), n = t.fracDen(), i;
  i = e.havingStyle(a);
  var o = te(r4.numer, i, e);
  if (r4.continued) {
    var u = 8.5 / e.fontMetrics().ptPerEm, c = 3.5 / e.fontMetrics().ptPerEm;
    o.height = o.height < u ? u : o.height, o.depth = o.depth < c ? c : o.depth;
  }
  i = e.havingStyle(n);
  var m = te(r4.denom, i, e), p, v, k;
  r4.hasBarLine ? (r4.barSize ? (v = pe(r4.barSize, e), p = A.makeLineSpan("frac-line", e, v)) : p = A.makeLineSpan("frac-line", e), v = p.height, k = p.height) : (p = null, v = 0, k = e.fontMetrics().defaultRuleThickness);
  var S, z, T;
  t.size === U.DISPLAY.size || r4.size === "display" ? (S = e.fontMetrics().num1, v > 0 ? z = 3 * k : z = 7 * k, T = e.fontMetrics().denom1) : (v > 0 ? (S = e.fontMetrics().num2, z = k) : (S = e.fontMetrics().num3, z = 3 * k), T = e.fontMetrics().denom2);
  var _;
  if (p) {
    var b = e.fontMetrics().axisHeight;
    S - o.depth - (b + 0.5 * v) < z && (S += z - (S - o.depth - (b + 0.5 * v))), b - 0.5 * v - (m.height - T) < z && (T += z - (b - 0.5 * v - (m.height - T)));
    var y = -(b - 0.5 * v);
    _ = A.makeVList({
      positionType: "individualShift",
      children: [{
        type: "elem",
        elem: m,
        shift: T
      }, {
        type: "elem",
        elem: p,
        shift: y
      }, {
        type: "elem",
        elem: o,
        shift: -S
      }]
    }, e);
  } else {
    var M = S - o.depth - (m.height - T);
    M < z && (S += 0.5 * (z - M), T += 0.5 * (z - M)), _ = A.makeVList({
      positionType: "individualShift",
      children: [{
        type: "elem",
        elem: m,
        shift: T
      }, {
        type: "elem",
        elem: o,
        shift: -S
      }]
    }, e);
  }
  i = e.havingStyle(t), _.height *= i.sizeMultiplier / e.sizeMultiplier, _.depth *= i.sizeMultiplier / e.sizeMultiplier;
  var E;
  t.size === U.DISPLAY.size ? E = e.fontMetrics().delim1 : t.size === U.SCRIPTSCRIPT.size ? E = e.havingStyle(U.SCRIPT).fontMetrics().delim2 : E = e.fontMetrics().delim2;
  var N, C;
  return r4.leftDelim == null ? N = B0(e, ["mopen"]) : N = n0.customSizedDelim(r4.leftDelim, E, true, e.havingStyle(t), r4.mode, ["mopen"]), r4.continued ? C = A.makeSpan([]) : r4.rightDelim == null ? C = B0(e, ["mclose"]) : C = n0.customSizedDelim(r4.rightDelim, E, true, e.havingStyle(t), r4.mode, ["mclose"]), A.makeSpan(["mord"].concat(i.sizingClasses(e)), [N, A.makeSpan(["mfrac"], [_]), C], e);
}, ur = (r4, e) => {
  var t = new B.MathNode("mfrac", [ne(r4.numer, e), ne(r4.denom, e)]);
  if (!r4.hasBarLine)
    t.setAttribute("linethickness", "0px");
  else if (r4.barSize) {
    var a = pe(r4.barSize, e);
    t.setAttribute("linethickness", $(a));
  }
  var n = Ya(r4.size, e.style);
  if (n.size !== e.style.size) {
    t = new B.MathNode("mstyle", [t]);
    var i = n.size === U.DISPLAY.size ? "true" : "false";
    t.setAttribute("displaystyle", i), t.setAttribute("scriptlevel", "0");
  }
  if (r4.leftDelim != null || r4.rightDelim != null) {
    var o = [];
    if (r4.leftDelim != null) {
      var u = new B.MathNode("mo", [new B.TextNode(r4.leftDelim.replace("\\", ""))]);
      u.setAttribute("fence", "true"), o.push(u);
    }
    if (o.push(t), r4.rightDelim != null) {
      var c = new B.MathNode("mo", [new B.TextNode(r4.rightDelim.replace("\\", ""))]);
      c.setAttribute("fence", "true"), o.push(c);
    }
    return Jt(o);
  }
  return t;
};
P({
  type: "genfrac",
  names: [
    "\\dfrac",
    "\\frac",
    "\\tfrac",
    "\\dbinom",
    "\\binom",
    "\\tbinom",
    "\\\\atopfrac",
    // can’t be entered directly
    "\\\\bracefrac",
    "\\\\brackfrac"
    // ditto
  ],
  props: {
    numArgs: 2,
    allowedInArgument: true
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0], i = e[1], o, u = null, c = null, m = "auto";
    switch (a) {
      case "\\dfrac":
      case "\\frac":
      case "\\tfrac":
        o = true;
        break;
      case "\\\\atopfrac":
        o = false;
        break;
      case "\\dbinom":
      case "\\binom":
      case "\\tbinom":
        o = false, u = "(", c = ")";
        break;
      case "\\\\bracefrac":
        o = false, u = "\\{", c = "\\}";
        break;
      case "\\\\brackfrac":
        o = false, u = "[", c = "]";
        break;
      default:
        throw new Error("Unrecognized genfrac command");
    }
    switch (a) {
      case "\\dfrac":
      case "\\dbinom":
        m = "display";
        break;
      case "\\tfrac":
      case "\\tbinom":
        m = "text";
        break;
    }
    return {
      type: "genfrac",
      mode: t.mode,
      continued: false,
      numer: n,
      denom: i,
      hasBarLine: o,
      leftDelim: u,
      rightDelim: c,
      size: m,
      barSize: null
    };
  },
  htmlBuilder: or,
  mathmlBuilder: ur
});
P({
  type: "genfrac",
  names: ["\\cfrac"],
  props: {
    numArgs: 2
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0], i = e[1];
    return {
      type: "genfrac",
      mode: t.mode,
      continued: true,
      numer: n,
      denom: i,
      hasBarLine: true,
      leftDelim: null,
      rightDelim: null,
      size: "display",
      barSize: null
    };
  }
});
P({
  type: "infix",
  names: ["\\over", "\\choose", "\\atop", "\\brace", "\\brack"],
  props: {
    numArgs: 0,
    infix: true
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t,
      token: a
    } = r4, n;
    switch (t) {
      case "\\over":
        n = "\\frac";
        break;
      case "\\choose":
        n = "\\binom";
        break;
      case "\\atop":
        n = "\\\\atopfrac";
        break;
      case "\\brace":
        n = "\\\\bracefrac";
        break;
      case "\\brack":
        n = "\\\\brackfrac";
        break;
      default:
        throw new Error("Unrecognized infix genfrac command");
    }
    return {
      type: "infix",
      mode: e.mode,
      replaceWith: n,
      token: a
    };
  }
});
var Lr = ["display", "text", "script", "scriptscript"], $r = function(e) {
  var t = null;
  return e.length > 0 && (t = e, t = t === "." ? null : t), t;
};
P({
  type: "genfrac",
  names: ["\\genfrac"],
  props: {
    numArgs: 6,
    allowedInArgument: true,
    argTypes: ["math", "math", "size", "text", "math", "math"]
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4, a = e[4], n = e[5], i = lt(e[0]), o = i.type === "atom" && i.family === "open" ? $r(i.text) : null, u = lt(e[1]), c = u.type === "atom" && u.family === "close" ? $r(u.text) : null, m = K(e[2], "size"), p, v = null;
    m.isBlank ? p = true : (v = m.value, p = v.number > 0);
    var k = "auto", S = e[3];
    if (S.type === "ordgroup") {
      if (S.body.length > 0) {
        var z = K(S.body[0], "textord");
        k = Lr[Number(z.text)];
      }
    } else
      S = K(S, "textord"), k = Lr[Number(S.text)];
    return {
      type: "genfrac",
      mode: t.mode,
      numer: a,
      denom: n,
      continued: false,
      hasBarLine: p,
      barSize: v,
      leftDelim: o,
      rightDelim: c,
      size: k
    };
  },
  htmlBuilder: or,
  mathmlBuilder: ur
});
P({
  type: "infix",
  names: ["\\above"],
  props: {
    numArgs: 1,
    argTypes: ["size"],
    infix: true
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a,
      token: n
    } = r4;
    return {
      type: "infix",
      mode: t.mode,
      replaceWith: "\\\\abovefrac",
      size: K(e[0], "size").value,
      token: n
    };
  }
});
P({
  type: "genfrac",
  names: ["\\\\abovefrac"],
  props: {
    numArgs: 3,
    argTypes: ["math", "size", "math"]
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0], i = Nn(K(e[1], "infix").size), o = e[2], u = i.number > 0;
    return {
      type: "genfrac",
      mode: t.mode,
      numer: n,
      denom: o,
      continued: false,
      hasBarLine: u,
      barSize: i,
      leftDelim: null,
      rightDelim: null,
      size: "auto"
    };
  },
  htmlBuilder: or,
  mathmlBuilder: ur
});
var Wa = (r4, e) => {
  var t = e.style, a, n;
  r4.type === "supsub" ? (a = r4.sup ? te(r4.sup, e.havingStyle(t.sup()), e) : te(r4.sub, e.havingStyle(t.sub()), e), n = K(r4.base, "horizBrace")) : n = K(r4, "horizBrace");
  var i = te(n.base, e.havingBaseStyle(U.DISPLAY)), o = s0.svgSpan(n, e), u;
  if (n.isOver ? (u = A.makeVList({
    positionType: "firstBaseline",
    children: [{
      type: "elem",
      elem: i
    }, {
      type: "kern",
      size: 0.1
    }, {
      type: "elem",
      elem: o
    }]
  }, e), u.children[0].children[0].children[1].classes.push("svg-align")) : (u = A.makeVList({
    positionType: "bottom",
    positionData: i.depth + 0.1 + o.height,
    children: [{
      type: "elem",
      elem: o
    }, {
      type: "kern",
      size: 0.1
    }, {
      type: "elem",
      elem: i
    }]
  }, e), u.children[0].children[0].children[0].classes.push("svg-align")), a) {
    var c = A.makeSpan(["mord", n.isOver ? "mover" : "munder"], [u], e);
    n.isOver ? u = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: c
      }, {
        type: "kern",
        size: 0.2
      }, {
        type: "elem",
        elem: a
      }]
    }, e) : u = A.makeVList({
      positionType: "bottom",
      positionData: c.depth + 0.2 + a.height + a.depth,
      children: [{
        type: "elem",
        elem: a
      }, {
        type: "kern",
        size: 0.2
      }, {
        type: "elem",
        elem: c
      }]
    }, e);
  }
  return A.makeSpan(["mord", n.isOver ? "mover" : "munder"], [u], e);
}, Qi = (r4, e) => {
  var t = s0.mathMLnode(r4.label);
  return new B.MathNode(r4.isOver ? "mover" : "munder", [ne(r4.base, e), t]);
};
P({
  type: "horizBrace",
  names: ["\\overbrace", "\\underbrace"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4;
    return {
      type: "horizBrace",
      mode: t.mode,
      label: a,
      isOver: /^\\over/.test(a),
      base: e[0]
    };
  },
  htmlBuilder: Wa,
  mathmlBuilder: Qi
});
P({
  type: "href",
  names: ["\\href"],
  props: {
    numArgs: 2,
    argTypes: ["url", "original"],
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = e[1], n = K(e[0], "url").url;
    return t.settings.isTrusted({
      command: "\\href",
      url: n
    }) ? {
      type: "href",
      mode: t.mode,
      href: n,
      body: ve(a)
    } : t.formatUnsupportedCmd("\\href");
  },
  htmlBuilder: (r4, e) => {
    var t = Ae(r4.body, e, false);
    return A.makeAnchor(r4.href, [], t, e);
  },
  mathmlBuilder: (r4, e) => {
    var t = p0(r4.body, e);
    return t instanceof Fe || (t = new Fe("mrow", [t])), t.setAttribute("href", r4.href), t;
  }
});
P({
  type: "href",
  names: ["\\url"],
  props: {
    numArgs: 1,
    argTypes: ["url"],
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = K(e[0], "url").url;
    if (!t.settings.isTrusted({
      command: "\\url",
      url: a
    }))
      return t.formatUnsupportedCmd("\\url");
    for (var n = [], i = 0; i < a.length; i++) {
      var o = a[i];
      o === "~" && (o = "\\textasciitilde"), n.push({
        type: "textord",
        mode: "text",
        text: o
      });
    }
    var u = {
      type: "text",
      mode: t.mode,
      font: "\\texttt",
      body: n
    };
    return {
      type: "href",
      mode: t.mode,
      href: a,
      body: ve(u)
    };
  }
});
P({
  type: "hbox",
  names: ["\\hbox"],
  props: {
    numArgs: 1,
    argTypes: ["text"],
    allowedInText: true,
    primitive: true
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "hbox",
      mode: t.mode,
      body: ve(e[0])
    };
  },
  htmlBuilder(r4, e) {
    var t = Ae(r4.body, e, false);
    return A.makeFragment(t);
  },
  mathmlBuilder(r4, e) {
    return new B.MathNode("mrow", Oe(r4.body, e));
  }
});
P({
  type: "html",
  names: ["\\htmlClass", "\\htmlId", "\\htmlStyle", "\\htmlData"],
  props: {
    numArgs: 2,
    argTypes: ["raw", "original"],
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a,
      token: n
    } = r4, i = K(e[0], "raw").string, o = e[1];
    t.settings.strict && t.settings.reportNonstrict("htmlExtension", "HTML extension is disabled on strict mode");
    var u, c = {};
    switch (a) {
      case "\\htmlClass":
        c.class = i, u = {
          command: "\\htmlClass",
          class: i
        };
        break;
      case "\\htmlId":
        c.id = i, u = {
          command: "\\htmlId",
          id: i
        };
        break;
      case "\\htmlStyle":
        c.style = i, u = {
          command: "\\htmlStyle",
          style: i
        };
        break;
      case "\\htmlData": {
        for (var m = i.split(","), p = 0; p < m.length; p++) {
          var v = m[p].split("=");
          if (v.length !== 2)
            throw new L("Error parsing key-value for \\htmlData");
          c["data-" + v[0].trim()] = v[1].trim();
        }
        u = {
          command: "\\htmlData",
          attributes: c
        };
        break;
      }
      default:
        throw new Error("Unrecognized html command");
    }
    return t.settings.isTrusted(u) ? {
      type: "html",
      mode: t.mode,
      attributes: c,
      body: ve(o)
    } : t.formatUnsupportedCmd(a);
  },
  htmlBuilder: (r4, e) => {
    var t = Ae(r4.body, e, false), a = ["enclosing"];
    r4.attributes.class && a.push(...r4.attributes.class.trim().split(/\s+/));
    var n = A.makeSpan(a, t, e);
    for (var i in r4.attributes)
      i !== "class" && r4.attributes.hasOwnProperty(i) && n.setAttribute(i, r4.attributes[i]);
    return n;
  },
  mathmlBuilder: (r4, e) => p0(r4.body, e)
});
P({
  type: "htmlmathml",
  names: ["\\html@mathml"],
  props: {
    numArgs: 2,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4;
    return {
      type: "htmlmathml",
      mode: t.mode,
      html: ve(e[0]),
      mathml: ve(e[1])
    };
  },
  htmlBuilder: (r4, e) => {
    var t = Ae(r4.html, e, false);
    return A.makeFragment(t);
  },
  mathmlBuilder: (r4, e) => p0(r4.mathml, e)
});
var zt = function(e) {
  if (/^[-+]? *(\d+(\.\d*)?|\.\d+)$/.test(e))
    return {
      number: +e,
      unit: "bp"
    };
  var t = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(e);
  if (!t)
    throw new L("Invalid size: '" + e + "' in \\includegraphics");
  var a = {
    number: +(t[1] + t[2]),
    // sign + magnitude, cast to number
    unit: t[3]
  };
  if (!ma(a))
    throw new L("Invalid unit: '" + a.unit + "' in \\includegraphics.");
  return a;
};
P({
  type: "includegraphics",
  names: ["\\includegraphics"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1,
    argTypes: ["raw", "url"],
    allowedInText: false
  },
  handler: (r4, e, t) => {
    var {
      parser: a
    } = r4, n = {
      number: 0,
      unit: "em"
    }, i = {
      number: 0.9,
      unit: "em"
    }, o = {
      number: 0,
      unit: "em"
    }, u = "";
    if (t[0])
      for (var c = K(t[0], "raw").string, m = c.split(","), p = 0; p < m.length; p++) {
        var v = m[p].split("=");
        if (v.length === 2) {
          var k = v[1].trim();
          switch (v[0].trim()) {
            case "alt":
              u = k;
              break;
            case "width":
              n = zt(k);
              break;
            case "height":
              i = zt(k);
              break;
            case "totalheight":
              o = zt(k);
              break;
            default:
              throw new L("Invalid key: '" + v[0] + "' in \\includegraphics.");
          }
        }
      }
    var S = K(e[0], "url").url;
    return u === "" && (u = S, u = u.replace(/^.*[\\/]/, ""), u = u.substring(0, u.lastIndexOf("."))), a.settings.isTrusted({
      command: "\\includegraphics",
      url: S
    }) ? {
      type: "includegraphics",
      mode: a.mode,
      alt: u,
      width: n,
      height: i,
      totalheight: o,
      src: S
    } : a.formatUnsupportedCmd("\\includegraphics");
  },
  htmlBuilder: (r4, e) => {
    var t = pe(r4.height, e), a = 0;
    r4.totalheight.number > 0 && (a = pe(r4.totalheight, e) - t);
    var n = 0;
    r4.width.number > 0 && (n = pe(r4.width, e));
    var i = {
      height: $(t + a)
    };
    n > 0 && (i.width = $(n)), a > 0 && (i.verticalAlign = $(-a));
    var o = new Qn(r4.src, r4.alt, i);
    return o.height = t, o.depth = a, o;
  },
  mathmlBuilder: (r4, e) => {
    var t = new B.MathNode("mglyph", []);
    t.setAttribute("alt", r4.alt);
    var a = pe(r4.height, e), n = 0;
    if (r4.totalheight.number > 0 && (n = pe(r4.totalheight, e) - a, t.setAttribute("valign", $(-n))), t.setAttribute("height", $(a + n)), r4.width.number > 0) {
      var i = pe(r4.width, e);
      t.setAttribute("width", $(i));
    }
    return t.setAttribute("src", r4.src), t;
  }
});
P({
  type: "kern",
  names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
  props: {
    numArgs: 1,
    argTypes: ["size"],
    primitive: true,
    allowedInText: true
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4, n = K(e[0], "size");
    if (t.settings.strict) {
      var i = a[1] === "m", o = n.value.unit === "mu";
      i ? (o || t.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + a + " supports only mu units, " + ("not " + n.value.unit + " units")), t.mode !== "math" && t.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + a + " works only in math mode")) : o && t.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + a + " doesn't support mu units");
    }
    return {
      type: "kern",
      mode: t.mode,
      dimension: n.value
    };
  },
  htmlBuilder(r4, e) {
    return A.makeGlue(r4.dimension, e);
  },
  mathmlBuilder(r4, e) {
    var t = pe(r4.dimension, e);
    return new B.SpaceNode(t);
  }
});
P({
  type: "lap",
  names: ["\\mathllap", "\\mathrlap", "\\mathclap"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    return {
      type: "lap",
      mode: t.mode,
      alignment: a.slice(5),
      body: n
    };
  },
  htmlBuilder: (r4, e) => {
    var t;
    r4.alignment === "clap" ? (t = A.makeSpan([], [te(r4.body, e)]), t = A.makeSpan(["inner"], [t], e)) : t = A.makeSpan(["inner"], [te(r4.body, e)]);
    var a = A.makeSpan(["fix"], []), n = A.makeSpan([r4.alignment], [t, a], e), i = A.makeSpan(["strut"]);
    return i.style.height = $(n.height + n.depth), n.depth && (i.style.verticalAlign = $(-n.depth)), n.children.unshift(i), n = A.makeSpan(["thinbox"], [n], e), A.makeSpan(["mord", "vbox"], [n], e);
  },
  mathmlBuilder: (r4, e) => {
    var t = new B.MathNode("mpadded", [ne(r4.body, e)]);
    if (r4.alignment !== "rlap") {
      var a = r4.alignment === "llap" ? "-1" : "-0.5";
      t.setAttribute("lspace", a + "width");
    }
    return t.setAttribute("width", "0px"), t;
  }
});
P({
  type: "styling",
  names: ["\\(", "$"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInMath: false
  },
  handler(r4, e) {
    var {
      funcName: t,
      parser: a
    } = r4, n = a.mode;
    a.switchMode("math");
    var i = t === "\\(" ? "\\)" : "$", o = a.parseExpression(false, i);
    return a.expect(i), a.switchMode(n), {
      type: "styling",
      mode: a.mode,
      style: "text",
      body: o
    };
  }
});
P({
  type: "text",
  // Doesn't matter what this is.
  names: ["\\)", "\\]"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInMath: false
  },
  handler(r4, e) {
    throw new L("Mismatched " + r4.funcName);
  }
});
var Fr = (r4, e) => {
  switch (e.style.size) {
    case U.DISPLAY.size:
      return r4.display;
    case U.TEXT.size:
      return r4.text;
    case U.SCRIPT.size:
      return r4.script;
    case U.SCRIPTSCRIPT.size:
      return r4.scriptscript;
    default:
      return r4.text;
  }
};
P({
  type: "mathchoice",
  names: ["\\mathchoice"],
  props: {
    numArgs: 4,
    primitive: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4;
    return {
      type: "mathchoice",
      mode: t.mode,
      display: ve(e[0]),
      text: ve(e[1]),
      script: ve(e[2]),
      scriptscript: ve(e[3])
    };
  },
  htmlBuilder: (r4, e) => {
    var t = Fr(r4, e), a = Ae(t, e, false);
    return A.makeFragment(a);
  },
  mathmlBuilder: (r4, e) => {
    var t = Fr(r4, e);
    return p0(t, e);
  }
});
var Xa = (r4, e, t, a, n, i, o) => {
  r4 = A.makeSpan([], [r4]);
  var u = t && W.isCharacterBox(t), c, m;
  if (e) {
    var p = te(e, a.havingStyle(n.sup()), a);
    m = {
      elem: p,
      kern: Math.max(a.fontMetrics().bigOpSpacing1, a.fontMetrics().bigOpSpacing3 - p.depth)
    };
  }
  if (t) {
    var v = te(t, a.havingStyle(n.sub()), a);
    c = {
      elem: v,
      kern: Math.max(a.fontMetrics().bigOpSpacing2, a.fontMetrics().bigOpSpacing4 - v.height)
    };
  }
  var k;
  if (m && c) {
    var S = a.fontMetrics().bigOpSpacing5 + c.elem.height + c.elem.depth + c.kern + r4.depth + o;
    k = A.makeVList({
      positionType: "bottom",
      positionData: S,
      children: [{
        type: "kern",
        size: a.fontMetrics().bigOpSpacing5
      }, {
        type: "elem",
        elem: c.elem,
        marginLeft: $(-i)
      }, {
        type: "kern",
        size: c.kern
      }, {
        type: "elem",
        elem: r4
      }, {
        type: "kern",
        size: m.kern
      }, {
        type: "elem",
        elem: m.elem,
        marginLeft: $(i)
      }, {
        type: "kern",
        size: a.fontMetrics().bigOpSpacing5
      }]
    }, a);
  } else if (c) {
    var z = r4.height - o;
    k = A.makeVList({
      positionType: "top",
      positionData: z,
      children: [{
        type: "kern",
        size: a.fontMetrics().bigOpSpacing5
      }, {
        type: "elem",
        elem: c.elem,
        marginLeft: $(-i)
      }, {
        type: "kern",
        size: c.kern
      }, {
        type: "elem",
        elem: r4
      }]
    }, a);
  } else if (m) {
    var T = r4.depth + o;
    k = A.makeVList({
      positionType: "bottom",
      positionData: T,
      children: [{
        type: "elem",
        elem: r4
      }, {
        type: "kern",
        size: m.kern
      }, {
        type: "elem",
        elem: m.elem,
        marginLeft: $(i)
      }, {
        type: "kern",
        size: a.fontMetrics().bigOpSpacing5
      }]
    }, a);
  } else
    return r4;
  var _ = [k];
  if (c && i !== 0 && !u) {
    var M = A.makeSpan(["mspace"], [], a);
    M.style.marginRight = $(i), _.unshift(M);
  }
  return A.makeSpan(["mop", "op-limits"], _, a);
}, Za = ["\\smallint"], z0 = (r4, e) => {
  var t, a, n = false, i;
  r4.type === "supsub" ? (t = r4.sup, a = r4.sub, i = K(r4.base, "op"), n = true) : i = K(r4, "op");
  var o = e.style, u = false;
  o.size === U.DISPLAY.size && i.symbol && !W.contains(Za, i.name) && (u = true);
  var c;
  if (i.symbol) {
    var m = u ? "Size2-Regular" : "Size1-Regular", p = "";
    if ((i.name === "\\oiint" || i.name === "\\oiiint") && (p = i.name.substr(1), i.name = p === "oiint" ? "\\iint" : "\\iiint"), c = A.makeSymbol(i.name, m, "math", e, ["mop", "op-symbol", u ? "large-op" : "small-op"]), p.length > 0) {
      var v = c.italic, k = A.staticSvg(p + "Size" + (u ? "2" : "1"), e);
      c = A.makeVList({
        positionType: "individualShift",
        children: [{
          type: "elem",
          elem: c,
          shift: 0
        }, {
          type: "elem",
          elem: k,
          shift: u ? 0.08 : 0
        }]
      }, e), i.name = "\\" + p, c.classes.unshift("mop"), c.italic = v;
    }
  } else if (i.body) {
    var S = Ae(i.body, e, true);
    S.length === 1 && S[0] instanceof Ge ? (c = S[0], c.classes[0] = "mop") : c = A.makeSpan(["mop"], S, e);
  } else {
    for (var z = [], T = 1; T < i.name.length; T++)
      z.push(A.mathsym(i.name[T], i.mode, e));
    c = A.makeSpan(["mop"], z, e);
  }
  var _ = 0, M = 0;
  return (c instanceof Ge || i.name === "\\oiint" || i.name === "\\oiiint") && !i.suppressBaseShift && (_ = (c.height - c.depth) / 2 - e.fontMetrics().axisHeight, M = c.italic), n ? Xa(c, t, a, e, o, M, _) : (_ && (c.style.position = "relative", c.style.top = $(_)), c);
}, P0 = (r4, e) => {
  var t;
  if (r4.symbol)
    t = new Fe("mo", [Ue(r4.name, r4.mode)]), W.contains(Za, r4.name) && t.setAttribute("largeop", "false");
  else if (r4.body)
    t = new Fe("mo", Oe(r4.body, e));
  else {
    t = new Fe("mi", [new D0(r4.name.slice(1))]);
    var a = new Fe("mo", [Ue("⁡", "text")]);
    r4.parentIsSupSub ? t = new Fe("mrow", [t, a]) : t = Aa([t, a]);
  }
  return t;
}, es = {
  "∏": "\\prod",
  "∐": "\\coprod",
  "∑": "\\sum",
  "⋀": "\\bigwedge",
  "⋁": "\\bigvee",
  "⋂": "\\bigcap",
  "⋃": "\\bigcup",
  "⨀": "\\bigodot",
  "⨁": "\\bigoplus",
  "⨂": "\\bigotimes",
  "⨄": "\\biguplus",
  "⨆": "\\bigsqcup"
};
P({
  type: "op",
  names: ["\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap", "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes", "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint", "∏", "∐", "∑", "⋀", "⋁", "⋂", "⋃", "⨀", "⨁", "⨂", "⨄", "⨆"],
  props: {
    numArgs: 0
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = a;
    return n.length === 1 && (n = es[n]), {
      type: "op",
      mode: t.mode,
      limits: true,
      parentIsSupSub: false,
      symbol: true,
      name: n
    };
  },
  htmlBuilder: z0,
  mathmlBuilder: P0
});
P({
  type: "op",
  names: ["\\mathop"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = e[0];
    return {
      type: "op",
      mode: t.mode,
      limits: false,
      parentIsSupSub: false,
      symbol: false,
      body: ve(a)
    };
  },
  htmlBuilder: z0,
  mathmlBuilder: P0
});
var ts = {
  "∫": "\\int",
  "∬": "\\iint",
  "∭": "\\iiint",
  "∮": "\\oint",
  "∯": "\\oiint",
  "∰": "\\oiiint"
};
P({
  type: "op",
  names: ["\\arcsin", "\\arccos", "\\arctan", "\\arctg", "\\arcctg", "\\arg", "\\ch", "\\cos", "\\cosec", "\\cosh", "\\cot", "\\cotg", "\\coth", "\\csc", "\\ctg", "\\cth", "\\deg", "\\dim", "\\exp", "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh", "\\sh", "\\tan", "\\tanh", "\\tg", "\\th"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4;
    return {
      type: "op",
      mode: e.mode,
      limits: false,
      parentIsSupSub: false,
      symbol: false,
      name: t
    };
  },
  htmlBuilder: z0,
  mathmlBuilder: P0
});
P({
  type: "op",
  names: ["\\det", "\\gcd", "\\inf", "\\lim", "\\max", "\\min", "\\Pr", "\\sup"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4;
    return {
      type: "op",
      mode: e.mode,
      limits: true,
      parentIsSupSub: false,
      symbol: false,
      name: t
    };
  },
  htmlBuilder: z0,
  mathmlBuilder: P0
});
P({
  type: "op",
  names: ["\\int", "\\iint", "\\iiint", "\\oint", "\\oiint", "\\oiiint", "∫", "∬", "∭", "∮", "∯", "∰"],
  props: {
    numArgs: 0
  },
  handler(r4) {
    var {
      parser: e,
      funcName: t
    } = r4, a = t;
    return a.length === 1 && (a = ts[a]), {
      type: "op",
      mode: e.mode,
      limits: false,
      parentIsSupSub: false,
      symbol: true,
      name: a
    };
  },
  htmlBuilder: z0,
  mathmlBuilder: P0
});
var Ka = (r4, e) => {
  var t, a, n = false, i;
  r4.type === "supsub" ? (t = r4.sup, a = r4.sub, i = K(r4.base, "operatorname"), n = true) : i = K(r4, "operatorname");
  var o;
  if (i.body.length > 0) {
    for (var u = i.body.map((v) => {
      var k = v.text;
      return typeof k == "string" ? {
        type: "textord",
        mode: v.mode,
        text: k
      } : v;
    }), c = Ae(u, e.withFont("mathrm"), true), m = 0; m < c.length; m++) {
      var p = c[m];
      p instanceof Ge && (p.text = p.text.replace(/\u2212/, "-").replace(/\u2217/, "*"));
    }
    o = A.makeSpan(["mop"], c, e);
  } else
    o = A.makeSpan(["mop"], [], e);
  return n ? Xa(o, t, a, e, e.style, 0, 0) : o;
}, rs = (r4, e) => {
  for (var t = Oe(r4.body, e.withFont("mathrm")), a = true, n = 0; n < t.length; n++) {
    var i = t[n];
    if (!(i instanceof B.SpaceNode))
      if (i instanceof B.MathNode)
        switch (i.type) {
          case "mi":
          case "mn":
          case "ms":
          case "mspace":
          case "mtext":
            break;
          case "mo": {
            var o = i.children[0];
            i.children.length === 1 && o instanceof B.TextNode ? o.text = o.text.replace(/\u2212/, "-").replace(/\u2217/, "*") : a = false;
            break;
          }
          default:
            a = false;
        }
      else
        a = false;
  }
  if (a) {
    var u = t.map((p) => p.toText()).join("");
    t = [new B.TextNode(u)];
  }
  var c = new B.MathNode("mi", t);
  c.setAttribute("mathvariant", "normal");
  var m = new B.MathNode("mo", [Ue("⁡", "text")]);
  return r4.parentIsSupSub ? new B.MathNode("mrow", [c, m]) : B.newDocumentFragment([c, m]);
};
P({
  type: "operatorname",
  names: ["\\operatorname@", "\\operatornamewithlimits"],
  props: {
    numArgs: 1
  },
  handler: (r4, e) => {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    return {
      type: "operatorname",
      mode: t.mode,
      body: ve(n),
      alwaysHandleSupSub: a === "\\operatornamewithlimits",
      limits: false,
      parentIsSupSub: false
    };
  },
  htmlBuilder: Ka,
  mathmlBuilder: rs
});
h("\\operatorname", "\\@ifstar\\operatornamewithlimits\\operatorname@");
k0({
  type: "ordgroup",
  htmlBuilder(r4, e) {
    return r4.semisimple ? A.makeFragment(Ae(r4.body, e, false)) : A.makeSpan(["mord"], Ae(r4.body, e, true), e);
  },
  mathmlBuilder(r4, e) {
    return p0(r4.body, e, true);
  }
});
P({
  type: "overline",
  names: ["\\overline"],
  props: {
    numArgs: 1
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4, a = e[0];
    return {
      type: "overline",
      mode: t.mode,
      body: a
    };
  },
  htmlBuilder(r4, e) {
    var t = te(r4.body, e.havingCrampedStyle()), a = A.makeLineSpan("overline-line", e), n = e.fontMetrics().defaultRuleThickness, i = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: t
      }, {
        type: "kern",
        size: 3 * n
      }, {
        type: "elem",
        elem: a
      }, {
        type: "kern",
        size: n
      }]
    }, e);
    return A.makeSpan(["mord", "overline"], [i], e);
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mo", [new B.TextNode("‾")]);
    t.setAttribute("stretchy", "true");
    var a = new B.MathNode("mover", [ne(r4.body, e), t]);
    return a.setAttribute("accent", "true"), a;
  }
});
P({
  type: "phantom",
  names: ["\\phantom"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = e[0];
    return {
      type: "phantom",
      mode: t.mode,
      body: ve(a)
    };
  },
  htmlBuilder: (r4, e) => {
    var t = Ae(r4.body, e.withPhantom(), false);
    return A.makeFragment(t);
  },
  mathmlBuilder: (r4, e) => {
    var t = Oe(r4.body, e);
    return new B.MathNode("mphantom", t);
  }
});
P({
  type: "hphantom",
  names: ["\\hphantom"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = e[0];
    return {
      type: "hphantom",
      mode: t.mode,
      body: a
    };
  },
  htmlBuilder: (r4, e) => {
    var t = A.makeSpan([], [te(r4.body, e.withPhantom())]);
    if (t.height = 0, t.depth = 0, t.children)
      for (var a = 0; a < t.children.length; a++)
        t.children[a].height = 0, t.children[a].depth = 0;
    return t = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: t
      }]
    }, e), A.makeSpan(["mord"], [t], e);
  },
  mathmlBuilder: (r4, e) => {
    var t = Oe(ve(r4.body), e), a = new B.MathNode("mphantom", t), n = new B.MathNode("mpadded", [a]);
    return n.setAttribute("height", "0px"), n.setAttribute("depth", "0px"), n;
  }
});
P({
  type: "vphantom",
  names: ["\\vphantom"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      parser: t
    } = r4, a = e[0];
    return {
      type: "vphantom",
      mode: t.mode,
      body: a
    };
  },
  htmlBuilder: (r4, e) => {
    var t = A.makeSpan(["inner"], [te(r4.body, e.withPhantom())]), a = A.makeSpan(["fix"], []);
    return A.makeSpan(["mord", "rlap"], [t, a], e);
  },
  mathmlBuilder: (r4, e) => {
    var t = Oe(ve(r4.body), e), a = new B.MathNode("mphantom", t), n = new B.MathNode("mpadded", [a]);
    return n.setAttribute("width", "0px"), n;
  }
});
P({
  type: "raisebox",
  names: ["\\raisebox"],
  props: {
    numArgs: 2,
    argTypes: ["size", "hbox"],
    allowedInText: true
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4, a = K(e[0], "size").value, n = e[1];
    return {
      type: "raisebox",
      mode: t.mode,
      dy: a,
      body: n
    };
  },
  htmlBuilder(r4, e) {
    var t = te(r4.body, e), a = pe(r4.dy, e);
    return A.makeVList({
      positionType: "shift",
      positionData: -a,
      children: [{
        type: "elem",
        elem: t
      }]
    }, e);
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mpadded", [ne(r4.body, e)]), a = r4.dy.number + r4.dy.unit;
    return t.setAttribute("voffset", a), t;
  }
});
P({
  type: "internal",
  names: ["\\relax"],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler(r4) {
    var {
      parser: e
    } = r4;
    return {
      type: "internal",
      mode: e.mode
    };
  }
});
P({
  type: "rule",
  names: ["\\rule"],
  props: {
    numArgs: 2,
    numOptionalArgs: 1,
    argTypes: ["size", "size", "size"]
  },
  handler(r4, e, t) {
    var {
      parser: a
    } = r4, n = t[0], i = K(e[0], "size"), o = K(e[1], "size");
    return {
      type: "rule",
      mode: a.mode,
      shift: n && K(n, "size").value,
      width: i.value,
      height: o.value
    };
  },
  htmlBuilder(r4, e) {
    var t = A.makeSpan(["mord", "rule"], [], e), a = pe(r4.width, e), n = pe(r4.height, e), i = r4.shift ? pe(r4.shift, e) : 0;
    return t.style.borderRightWidth = $(a), t.style.borderTopWidth = $(n), t.style.bottom = $(i), t.width = a, t.height = n + i, t.depth = -i, t.maxFontSize = n * 1.125 * e.sizeMultiplier, t;
  },
  mathmlBuilder(r4, e) {
    var t = pe(r4.width, e), a = pe(r4.height, e), n = r4.shift ? pe(r4.shift, e) : 0, i = e.color && e.getColor() || "black", o = new B.MathNode("mspace");
    o.setAttribute("mathbackground", i), o.setAttribute("width", $(t)), o.setAttribute("height", $(a));
    var u = new B.MathNode("mpadded", [o]);
    return n >= 0 ? u.setAttribute("height", $(n)) : (u.setAttribute("height", $(n)), u.setAttribute("depth", $(-n))), u.setAttribute("voffset", $(n)), u;
  }
});
function Ja(r4, e, t) {
  for (var a = Ae(r4, e, false), n = e.sizeMultiplier / t.sizeMultiplier, i = 0; i < a.length; i++) {
    var o = a[i].classes.indexOf("sizing");
    o < 0 ? Array.prototype.push.apply(a[i].classes, e.sizingClasses(t)) : a[i].classes[o + 1] === "reset-size" + e.size && (a[i].classes[o + 1] = "reset-size" + t.size), a[i].height *= n, a[i].depth *= n;
  }
  return A.makeFragment(a);
}
var Pr = ["\\tiny", "\\sixptsize", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"], as = (r4, e) => {
  var t = e.havingSize(r4.size);
  return Ja(r4.body, t, e);
};
P({
  type: "sizing",
  names: Pr,
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler: (r4, e) => {
    var {
      breakOnTokenText: t,
      funcName: a,
      parser: n
    } = r4, i = n.parseExpression(false, t);
    return {
      type: "sizing",
      mode: n.mode,
      // Figure out what size to use based on the list of functions above
      size: Pr.indexOf(a) + 1,
      body: i
    };
  },
  htmlBuilder: as,
  mathmlBuilder: (r4, e) => {
    var t = e.havingSize(r4.size), a = Oe(r4.body, t), n = new B.MathNode("mstyle", a);
    return n.setAttribute("mathsize", $(t.sizeMultiplier)), n;
  }
});
P({
  type: "smash",
  names: ["\\smash"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1,
    allowedInText: true
  },
  handler: (r4, e, t) => {
    var {
      parser: a
    } = r4, n = false, i = false, o = t[0] && K(t[0], "ordgroup");
    if (o)
      for (var u = "", c = 0; c < o.body.length; ++c) {
        var m = o.body[c];
        if (u = m.text, u === "t")
          n = true;
        else if (u === "b")
          i = true;
        else {
          n = false, i = false;
          break;
        }
      }
    else
      n = true, i = true;
    var p = e[0];
    return {
      type: "smash",
      mode: a.mode,
      body: p,
      smashHeight: n,
      smashDepth: i
    };
  },
  htmlBuilder: (r4, e) => {
    var t = A.makeSpan([], [te(r4.body, e)]);
    if (!r4.smashHeight && !r4.smashDepth)
      return t;
    if (r4.smashHeight && (t.height = 0, t.children))
      for (var a = 0; a < t.children.length; a++)
        t.children[a].height = 0;
    if (r4.smashDepth && (t.depth = 0, t.children))
      for (var n = 0; n < t.children.length; n++)
        t.children[n].depth = 0;
    var i = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: t
      }]
    }, e);
    return A.makeSpan(["mord"], [i], e);
  },
  mathmlBuilder: (r4, e) => {
    var t = new B.MathNode("mpadded", [ne(r4.body, e)]);
    return r4.smashHeight && t.setAttribute("height", "0px"), r4.smashDepth && t.setAttribute("depth", "0px"), t;
  }
});
P({
  type: "sqrt",
  names: ["\\sqrt"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1
  },
  handler(r4, e, t) {
    var {
      parser: a
    } = r4, n = t[0], i = e[0];
    return {
      type: "sqrt",
      mode: a.mode,
      body: i,
      index: n
    };
  },
  htmlBuilder(r4, e) {
    var t = te(r4.body, e.havingCrampedStyle());
    t.height === 0 && (t.height = e.fontMetrics().xHeight), t = A.wrapFragment(t, e);
    var a = e.fontMetrics(), n = a.defaultRuleThickness, i = n;
    e.style.id < U.TEXT.id && (i = e.fontMetrics().xHeight);
    var o = n + i / 4, u = t.height + t.depth + o + n, {
      span: c,
      ruleWidth: m,
      advanceWidth: p
    } = n0.sqrtImage(u, e), v = c.height - m;
    v > t.height + t.depth + o && (o = (o + v - t.height - t.depth) / 2);
    var k = c.height - t.height - o - m;
    t.style.paddingLeft = $(p);
    var S = A.makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: t,
        wrapperClasses: ["svg-align"]
      }, {
        type: "kern",
        size: -(t.height + k)
      }, {
        type: "elem",
        elem: c
      }, {
        type: "kern",
        size: m
      }]
    }, e);
    if (r4.index) {
      var z = e.havingStyle(U.SCRIPTSCRIPT), T = te(r4.index, z, e), _ = 0.6 * (S.height - S.depth), M = A.makeVList({
        positionType: "shift",
        positionData: -_,
        children: [{
          type: "elem",
          elem: T
        }]
      }, e), b = A.makeSpan(["root"], [M]);
      return A.makeSpan(["mord", "sqrt"], [b, S], e);
    } else
      return A.makeSpan(["mord", "sqrt"], [S], e);
  },
  mathmlBuilder(r4, e) {
    var {
      body: t,
      index: a
    } = r4;
    return a ? new B.MathNode("mroot", [ne(t, e), ne(a, e)]) : new B.MathNode("msqrt", [ne(t, e)]);
  }
});
var qr = {
  display: U.DISPLAY,
  text: U.TEXT,
  script: U.SCRIPT,
  scriptscript: U.SCRIPTSCRIPT
};
P({
  type: "styling",
  names: ["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(r4, e) {
    var {
      breakOnTokenText: t,
      funcName: a,
      parser: n
    } = r4, i = n.parseExpression(true, t), o = a.slice(1, a.length - 5);
    return {
      type: "styling",
      mode: n.mode,
      // Figure out what style to use by pulling out the style from
      // the function name
      style: o,
      body: i
    };
  },
  htmlBuilder(r4, e) {
    var t = qr[r4.style], a = e.havingStyle(t).withFont("");
    return Ja(r4.body, a, e);
  },
  mathmlBuilder(r4, e) {
    var t = qr[r4.style], a = e.havingStyle(t), n = Oe(r4.body, a), i = new B.MathNode("mstyle", n), o = {
      display: ["0", "true"],
      text: ["0", "false"],
      script: ["1", "false"],
      scriptscript: ["2", "false"]
    }, u = o[r4.style];
    return i.setAttribute("scriptlevel", u[0]), i.setAttribute("displaystyle", u[1]), i;
  }
});
var ns = function(e, t) {
  var a = e.base;
  if (a)
    if (a.type === "op") {
      var n = a.limits && (t.style.size === U.DISPLAY.size || a.alwaysHandleSupSub);
      return n ? z0 : null;
    } else if (a.type === "operatorname") {
      var i = a.alwaysHandleSupSub && (t.style.size === U.DISPLAY.size || a.limits);
      return i ? Ka : null;
    } else {
      if (a.type === "accent")
        return W.isCharacterBox(a.base) ? tr : null;
      if (a.type === "horizBrace") {
        var o = !e.sub;
        return o === a.isOver ? Wa : null;
      } else
        return null;
    }
  else
    return null;
};
k0({
  type: "supsub",
  htmlBuilder(r4, e) {
    var t = ns(r4, e);
    if (t)
      return t(r4, e);
    var {
      base: a,
      sup: n,
      sub: i
    } = r4, o = te(a, e), u, c, m = e.fontMetrics(), p = 0, v = 0, k = a && W.isCharacterBox(a);
    if (n) {
      var S = e.havingStyle(e.style.sup());
      u = te(n, S, e), k || (p = o.height - S.fontMetrics().supDrop * S.sizeMultiplier / e.sizeMultiplier);
    }
    if (i) {
      var z = e.havingStyle(e.style.sub());
      c = te(i, z, e), k || (v = o.depth + z.fontMetrics().subDrop * z.sizeMultiplier / e.sizeMultiplier);
    }
    var T;
    e.style === U.DISPLAY ? T = m.sup1 : e.style.cramped ? T = m.sup3 : T = m.sup2;
    var _ = e.sizeMultiplier, M = $(0.5 / m.ptPerEm / _), b = null;
    if (c) {
      var y = r4.base && r4.base.type === "op" && r4.base.name && (r4.base.name === "\\oiint" || r4.base.name === "\\oiiint");
      (o instanceof Ge || y) && (b = $(-o.italic));
    }
    var E;
    if (u && c) {
      p = Math.max(p, T, u.depth + 0.25 * m.xHeight), v = Math.max(v, m.sub2);
      var N = m.defaultRuleThickness, C = 4 * N;
      if (p - u.depth - (c.height - v) < C) {
        v = C - (p - u.depth) + c.height;
        var I = 0.8 * m.xHeight - (p - u.depth);
        I > 0 && (p += I, v -= I);
      }
      var F = [{
        type: "elem",
        elem: c,
        shift: v,
        marginRight: M,
        marginLeft: b
      }, {
        type: "elem",
        elem: u,
        shift: -p,
        marginRight: M
      }];
      E = A.makeVList({
        positionType: "individualShift",
        children: F
      }, e);
    } else if (c) {
      v = Math.max(v, m.sub1, c.height - 0.8 * m.xHeight);
      var O = [{
        type: "elem",
        elem: c,
        marginLeft: b,
        marginRight: M
      }];
      E = A.makeVList({
        positionType: "shift",
        positionData: v,
        children: O
      }, e);
    } else if (u)
      p = Math.max(p, T, u.depth + 0.25 * m.xHeight), E = A.makeVList({
        positionType: "shift",
        positionData: -p,
        children: [{
          type: "elem",
          elem: u,
          marginRight: M
        }]
      }, e);
    else
      throw new Error("supsub must have either sup or sub.");
    var Y = Pt(o, "right") || "mord";
    return A.makeSpan([Y], [o, A.makeSpan(["msupsub"], [E])], e);
  },
  mathmlBuilder(r4, e) {
    var t = false, a, n;
    r4.base && r4.base.type === "horizBrace" && (n = !!r4.sup, n === r4.base.isOver && (t = true, a = r4.base.isOver)), r4.base && (r4.base.type === "op" || r4.base.type === "operatorname") && (r4.base.parentIsSupSub = true);
    var i = [ne(r4.base, e)];
    r4.sub && i.push(ne(r4.sub, e)), r4.sup && i.push(ne(r4.sup, e));
    var o;
    if (t)
      o = a ? "mover" : "munder";
    else if (r4.sub)
      if (r4.sup) {
        var m = r4.base;
        m && m.type === "op" && m.limits && e.style === U.DISPLAY || m && m.type === "operatorname" && m.alwaysHandleSupSub && (e.style === U.DISPLAY || m.limits) ? o = "munderover" : o = "msubsup";
      } else {
        var c = r4.base;
        c && c.type === "op" && c.limits && (e.style === U.DISPLAY || c.alwaysHandleSupSub) || c && c.type === "operatorname" && c.alwaysHandleSupSub && (c.limits || e.style === U.DISPLAY) ? o = "munder" : o = "msub";
      }
    else {
      var u = r4.base;
      u && u.type === "op" && u.limits && (e.style === U.DISPLAY || u.alwaysHandleSupSub) || u && u.type === "operatorname" && u.alwaysHandleSupSub && (u.limits || e.style === U.DISPLAY) ? o = "mover" : o = "msup";
    }
    return new B.MathNode(o, i);
  }
});
k0({
  type: "atom",
  htmlBuilder(r4, e) {
    return A.mathsym(r4.text, r4.mode, e, ["m" + r4.family]);
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mo", [Ue(r4.text, r4.mode)]);
    if (r4.family === "bin") {
      var a = Qt(r4, e);
      a === "bold-italic" && t.setAttribute("mathvariant", a);
    } else
      r4.family === "punct" ? t.setAttribute("separator", "true") : (r4.family === "open" || r4.family === "close") && t.setAttribute("stretchy", "false");
    return t;
  }
});
var Qa = {
  mi: "italic",
  mn: "normal",
  mtext: "normal"
};
k0({
  type: "mathord",
  htmlBuilder(r4, e) {
    return A.makeOrd(r4, e, "mathord");
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mi", [Ue(r4.text, r4.mode, e)]), a = Qt(r4, e) || "italic";
    return a !== Qa[t.type] && t.setAttribute("mathvariant", a), t;
  }
});
k0({
  type: "textord",
  htmlBuilder(r4, e) {
    return A.makeOrd(r4, e, "textord");
  },
  mathmlBuilder(r4, e) {
    var t = Ue(r4.text, r4.mode, e), a = Qt(r4, e) || "normal", n;
    return r4.mode === "text" ? n = new B.MathNode("mtext", [t]) : /[0-9]/.test(r4.text) ? n = new B.MathNode("mn", [t]) : r4.text === "\\prime" ? n = new B.MathNode("mo", [t]) : n = new B.MathNode("mi", [t]), a !== Qa[n.type] && n.setAttribute("mathvariant", a), n;
  }
});
var Nt = {
  "\\nobreak": "nobreak",
  "\\allowbreak": "allowbreak"
}, Ct = {
  " ": {},
  "\\ ": {},
  "~": {
    className: "nobreak"
  },
  "\\space": {},
  "\\nobreakspace": {
    className: "nobreak"
  }
};
k0({
  type: "spacing",
  htmlBuilder(r4, e) {
    if (Ct.hasOwnProperty(r4.text)) {
      var t = Ct[r4.text].className || "";
      if (r4.mode === "text") {
        var a = A.makeOrd(r4, e, "textord");
        return a.classes.push(t), a;
      } else
        return A.makeSpan(["mspace", t], [A.mathsym(r4.text, r4.mode, e)], e);
    } else {
      if (Nt.hasOwnProperty(r4.text))
        return A.makeSpan(["mspace", Nt[r4.text]], [], e);
      throw new L('Unknown type of space "' + r4.text + '"');
    }
  },
  mathmlBuilder(r4, e) {
    var t;
    if (Ct.hasOwnProperty(r4.text))
      t = new B.MathNode("mtext", [new B.TextNode(" ")]);
    else {
      if (Nt.hasOwnProperty(r4.text))
        return new B.MathNode("mspace");
      throw new L('Unknown type of space "' + r4.text + '"');
    }
    return t;
  }
});
var Hr = () => {
  var r4 = new B.MathNode("mtd", []);
  return r4.setAttribute("width", "50%"), r4;
};
k0({
  type: "tag",
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mtable", [new B.MathNode("mtr", [Hr(), new B.MathNode("mtd", [p0(r4.body, e)]), Hr(), new B.MathNode("mtd", [p0(r4.tag, e)])])]);
    return t.setAttribute("width", "100%"), t;
  }
});
var Gr = {
  "\\text": void 0,
  "\\textrm": "textrm",
  "\\textsf": "textsf",
  "\\texttt": "texttt",
  "\\textnormal": "textrm"
}, Ur = {
  "\\textbf": "textbf",
  "\\textmd": "textmd"
}, is = {
  "\\textit": "textit",
  "\\textup": "textup"
}, Vr = (r4, e) => {
  var t = r4.font;
  return t ? Gr[t] ? e.withTextFontFamily(Gr[t]) : Ur[t] ? e.withTextFontWeight(Ur[t]) : e.withTextFontShape(is[t]) : e;
};
P({
  type: "text",
  names: [
    // Font families
    "\\text",
    "\\textrm",
    "\\textsf",
    "\\texttt",
    "\\textnormal",
    // Font weights
    "\\textbf",
    "\\textmd",
    // Font Shapes
    "\\textit",
    "\\textup"
  ],
  props: {
    numArgs: 1,
    argTypes: ["text"],
    allowedInArgument: true,
    allowedInText: true
  },
  handler(r4, e) {
    var {
      parser: t,
      funcName: a
    } = r4, n = e[0];
    return {
      type: "text",
      mode: t.mode,
      body: ve(n),
      font: a
    };
  },
  htmlBuilder(r4, e) {
    var t = Vr(r4, e), a = Ae(r4.body, t, true);
    return A.makeSpan(["mord", "text"], a, t);
  },
  mathmlBuilder(r4, e) {
    var t = Vr(r4, e);
    return p0(r4.body, t);
  }
});
P({
  type: "underline",
  names: ["\\underline"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "underline",
      mode: t.mode,
      body: e[0]
    };
  },
  htmlBuilder(r4, e) {
    var t = te(r4.body, e), a = A.makeLineSpan("underline-line", e), n = e.fontMetrics().defaultRuleThickness, i = A.makeVList({
      positionType: "top",
      positionData: t.height,
      children: [{
        type: "kern",
        size: n
      }, {
        type: "elem",
        elem: a
      }, {
        type: "kern",
        size: 3 * n
      }, {
        type: "elem",
        elem: t
      }]
    }, e);
    return A.makeSpan(["mord", "underline"], [i], e);
  },
  mathmlBuilder(r4, e) {
    var t = new B.MathNode("mo", [new B.TextNode("‾")]);
    t.setAttribute("stretchy", "true");
    var a = new B.MathNode("munder", [ne(r4.body, e), t]);
    return a.setAttribute("accentunder", "true"), a;
  }
});
P({
  type: "vcenter",
  names: ["\\vcenter"],
  props: {
    numArgs: 1,
    argTypes: ["original"],
    // In LaTeX, \vcenter can act only on a box.
    allowedInText: false
  },
  handler(r4, e) {
    var {
      parser: t
    } = r4;
    return {
      type: "vcenter",
      mode: t.mode,
      body: e[0]
    };
  },
  htmlBuilder(r4, e) {
    var t = te(r4.body, e), a = e.fontMetrics().axisHeight, n = 0.5 * (t.height - a - (t.depth + a));
    return A.makeVList({
      positionType: "shift",
      positionData: n,
      children: [{
        type: "elem",
        elem: t
      }]
    }, e);
  },
  mathmlBuilder(r4, e) {
    return new B.MathNode("mpadded", [ne(r4.body, e)], ["vcenter"]);
  }
});
P({
  type: "verb",
  names: ["\\verb"],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler(r4, e, t) {
    throw new L("\\verb ended by end of line instead of matching delimiter");
  },
  htmlBuilder(r4, e) {
    for (var t = jr(r4), a = [], n = e.havingStyle(e.style.text()), i = 0; i < t.length; i++) {
      var o = t[i];
      o === "~" && (o = "\\textasciitilde"), a.push(A.makeSymbol(o, "Typewriter-Regular", r4.mode, n, ["mord", "texttt"]));
    }
    return A.makeSpan(["mord", "text"].concat(n.sizingClasses(e)), A.tryCombineChars(a), n);
  },
  mathmlBuilder(r4, e) {
    var t = new B.TextNode(jr(r4)), a = new B.MathNode("mtext", [t]);
    return a.setAttribute("mathvariant", "monospace"), a;
  }
});
var jr = (r4) => r4.body.replace(/ /g, r4.star ? "␣" : " "), d0 = ka, en = `[ \r
	]`, ss = "\\\\[a-zA-Z@]+", ls = "\\\\[^\uD800-\uDFFF]", os = "(" + ss + ")" + en + "*", us = `\\\\(
|[ \r	]+
?)[ \r	]*`, Ut = "[̀-ͯ]", cs = new RegExp(Ut + "+$"), ds = "(" + en + "+)|" + // whitespace
(us + "|") + // \whitespace
"([!-\\[\\]-‧‪-퟿豈-￿]" + // single codepoint
(Ut + "*") + // ...plus accents
"|[\uD800-\uDBFF][\uDC00-\uDFFF]" + // surrogate pair
(Ut + "*") + // ...plus accents
"|\\\\verb\\*([^]).*?\\4|\\\\verb([^*a-zA-Z]).*?\\5" + // \verb unstarred
("|" + os) + // \macroName + spaces
("|" + ls + ")");
class Yr {
  // Category codes. The lexer only supports comment characters (14) for now.
  // MacroExpander additionally distinguishes active (13).
  constructor(e, t) {
    this.input = void 0, this.settings = void 0, this.tokenRegex = void 0, this.catcodes = void 0, this.input = e, this.settings = t, this.tokenRegex = new RegExp(ds, "g"), this.catcodes = {
      "%": 14,
      // comment character
      "~": 13
      // active character
    };
  }
  setCatcode(e, t) {
    this.catcodes[e] = t;
  }
  /**
   * This function lexes a single token.
   */
  lex() {
    var e = this.input, t = this.tokenRegex.lastIndex;
    if (t === e.length)
      return new qe("EOF", new Ie(this, t, t));
    var a = this.tokenRegex.exec(e);
    if (a === null || a.index !== t)
      throw new L("Unexpected character: '" + e[t] + "'", new qe(e[t], new Ie(this, t, t + 1)));
    var n = a[6] || a[3] || (a[2] ? "\\ " : " ");
    if (this.catcodes[n] === 14) {
      var i = e.indexOf(`
`, this.tokenRegex.lastIndex);
      return i === -1 ? (this.tokenRegex.lastIndex = e.length, this.settings.reportNonstrict("commentAtEnd", "% comment has no terminating newline; LaTeX would fail because of commenting the end of math mode (e.g. $)")) : this.tokenRegex.lastIndex = i + 1, this.lex();
    }
    return new qe(n, new Ie(this, t, this.tokenRegex.lastIndex));
  }
}
class hs {
  /**
   * Both arguments are optional.  The first argument is an object of
   * built-in mappings which never change.  The second argument is an object
   * of initial (global-level) mappings, which will constantly change
   * according to any global/top-level `set`s done.
   */
  constructor(e, t) {
    e === void 0 && (e = {}), t === void 0 && (t = {}), this.current = void 0, this.builtins = void 0, this.undefStack = void 0, this.current = t, this.builtins = e, this.undefStack = [];
  }
  /**
   * Start a new nested group, affecting future local `set`s.
   */
  beginGroup() {
    this.undefStack.push({});
  }
  /**
   * End current nested group, restoring values before the group began.
   */
  endGroup() {
    if (this.undefStack.length === 0)
      throw new L("Unbalanced namespace destruction: attempt to pop global namespace; please report this as a bug");
    var e = this.undefStack.pop();
    for (var t in e)
      e.hasOwnProperty(t) && (e[t] == null ? delete this.current[t] : this.current[t] = e[t]);
  }
  /**
   * Ends all currently nested groups (if any), restoring values before the
   * groups began.  Useful in case of an error in the middle of parsing.
   */
  endGroups() {
    for (; this.undefStack.length > 0; )
      this.endGroup();
  }
  /**
   * Detect whether `name` has a definition.  Equivalent to
   * `get(name) != null`.
   */
  has(e) {
    return this.current.hasOwnProperty(e) || this.builtins.hasOwnProperty(e);
  }
  /**
   * Get the current value of a name, or `undefined` if there is no value.
   *
   * Note: Do not use `if (namespace.get(...))` to detect whether a macro
   * is defined, as the definition may be the empty string which evaluates
   * to `false` in JavaScript.  Use `if (namespace.get(...) != null)` or
   * `if (namespace.has(...))`.
   */
  get(e) {
    return this.current.hasOwnProperty(e) ? this.current[e] : this.builtins[e];
  }
  /**
   * Set the current value of a name, and optionally set it globally too.
   * Local set() sets the current value and (when appropriate) adds an undo
   * operation to the undo stack.  Global set() may change the undo
   * operation at every level, so takes time linear in their number.
   * A value of undefined means to delete existing definitions.
   */
  set(e, t, a) {
    if (a === void 0 && (a = false), a) {
      for (var n = 0; n < this.undefStack.length; n++)
        delete this.undefStack[n][e];
      this.undefStack.length > 0 && (this.undefStack[this.undefStack.length - 1][e] = t);
    } else {
      var i = this.undefStack[this.undefStack.length - 1];
      i && !i.hasOwnProperty(e) && (i[e] = this.current[e]);
    }
    t == null ? delete this.current[e] : this.current[e] = t;
  }
}
var ms = qa;
h("\\noexpand", function(r4) {
  var e = r4.popToken();
  return r4.isExpandable(e.text) && (e.noexpand = true, e.treatAsRelax = true), {
    tokens: [e],
    numArgs: 0
  };
});
h("\\expandafter", function(r4) {
  var e = r4.popToken();
  return r4.expandOnce(true), {
    tokens: [e],
    numArgs: 0
  };
});
h("\\@firstoftwo", function(r4) {
  var e = r4.consumeArgs(2);
  return {
    tokens: e[0],
    numArgs: 0
  };
});
h("\\@secondoftwo", function(r4) {
  var e = r4.consumeArgs(2);
  return {
    tokens: e[1],
    numArgs: 0
  };
});
h("\\@ifnextchar", function(r4) {
  var e = r4.consumeArgs(3);
  r4.consumeSpaces();
  var t = r4.future();
  return e[0].length === 1 && e[0][0].text === t.text ? {
    tokens: e[1],
    numArgs: 0
  } : {
    tokens: e[2],
    numArgs: 0
  };
});
h("\\@ifstar", "\\@ifnextchar *{\\@firstoftwo{#1}}");
h("\\TextOrMath", function(r4) {
  var e = r4.consumeArgs(2);
  return r4.mode === "text" ? {
    tokens: e[0],
    numArgs: 0
  } : {
    tokens: e[1],
    numArgs: 0
  };
});
var Wr = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
h("\\char", function(r4) {
  var e = r4.popToken(), t, a = "";
  if (e.text === "'")
    t = 8, e = r4.popToken();
  else if (e.text === '"')
    t = 16, e = r4.popToken();
  else if (e.text === "`")
    if (e = r4.popToken(), e.text[0] === "\\")
      a = e.text.charCodeAt(1);
    else {
      if (e.text === "EOF")
        throw new L("\\char` missing argument");
      a = e.text.charCodeAt(0);
    }
  else
    t = 10;
  if (t) {
    if (a = Wr[e.text], a == null || a >= t)
      throw new L("Invalid base-" + t + " digit " + e.text);
    for (var n; (n = Wr[r4.future().text]) != null && n < t; )
      a *= t, a += n, r4.popToken();
  }
  return "\\@char{" + a + "}";
});
var cr = (r4, e, t) => {
  var a = r4.consumeArg().tokens;
  if (a.length !== 1)
    throw new L("\\newcommand's first argument must be a macro name");
  var n = a[0].text, i = r4.isDefined(n);
  if (i && !e)
    throw new L("\\newcommand{" + n + "} attempting to redefine " + (n + "; use \\renewcommand"));
  if (!i && !t)
    throw new L("\\renewcommand{" + n + "} when command " + n + " does not yet exist; use \\newcommand");
  var o = 0;
  if (a = r4.consumeArg().tokens, a.length === 1 && a[0].text === "[") {
    for (var u = "", c = r4.expandNextToken(); c.text !== "]" && c.text !== "EOF"; )
      u += c.text, c = r4.expandNextToken();
    if (!u.match(/^\s*[0-9]+\s*$/))
      throw new L("Invalid number of arguments: " + u);
    o = parseInt(u), a = r4.consumeArg().tokens;
  }
  return r4.macros.set(n, {
    tokens: a,
    numArgs: o
  }), "";
};
h("\\newcommand", (r4) => cr(r4, false, true));
h("\\renewcommand", (r4) => cr(r4, true, false));
h("\\providecommand", (r4) => cr(r4, true, true));
h("\\message", (r4) => {
  var e = r4.consumeArgs(1)[0];
  return console.log(e.reverse().map((t) => t.text).join("")), "";
});
h("\\errmessage", (r4) => {
  var e = r4.consumeArgs(1)[0];
  return console.error(e.reverse().map((t) => t.text).join("")), "";
});
h("\\show", (r4) => {
  var e = r4.popToken(), t = e.text;
  return console.log(e, r4.macros.get(t), d0[t], se.math[t], se.text[t]), "";
});
h("\\bgroup", "{");
h("\\egroup", "}");
h("~", "\\nobreakspace");
h("\\lq", "`");
h("\\rq", "'");
h("\\aa", "\\r a");
h("\\AA", "\\r A");
h("\\textcopyright", "\\html@mathml{\\textcircled{c}}{\\char`©}");
h("\\copyright", "\\TextOrMath{\\textcopyright}{\\text{\\textcopyright}}");
h("\\textregistered", "\\html@mathml{\\textcircled{\\scriptsize R}}{\\char`®}");
h("ℬ", "\\mathscr{B}");
h("ℰ", "\\mathscr{E}");
h("ℱ", "\\mathscr{F}");
h("ℋ", "\\mathscr{H}");
h("ℐ", "\\mathscr{I}");
h("ℒ", "\\mathscr{L}");
h("ℳ", "\\mathscr{M}");
h("ℛ", "\\mathscr{R}");
h("ℭ", "\\mathfrak{C}");
h("ℌ", "\\mathfrak{H}");
h("ℨ", "\\mathfrak{Z}");
h("\\Bbbk", "\\Bbb{k}");
h("·", "\\cdotp");
h("\\llap", "\\mathllap{\\textrm{#1}}");
h("\\rlap", "\\mathrlap{\\textrm{#1}}");
h("\\clap", "\\mathclap{\\textrm{#1}}");
h("\\mathstrut", "\\vphantom{(}");
h("\\underbar", "\\underline{\\text{#1}}");
h("\\not", '\\html@mathml{\\mathrel{\\mathrlap\\@not}}{\\char"338}');
h("\\neq", "\\html@mathml{\\mathrel{\\not=}}{\\mathrel{\\char`≠}}");
h("\\ne", "\\neq");
h("≠", "\\neq");
h("\\notin", "\\html@mathml{\\mathrel{{\\in}\\mathllap{/\\mskip1mu}}}{\\mathrel{\\char`∉}}");
h("∉", "\\notin");
h("≘", "\\html@mathml{\\mathrel{=\\kern{-1em}\\raisebox{0.4em}{$\\scriptsize\\frown$}}}{\\mathrel{\\char`≘}}");
h("≙", "\\html@mathml{\\stackrel{\\tiny\\wedge}{=}}{\\mathrel{\\char`≘}}");
h("≚", "\\html@mathml{\\stackrel{\\tiny\\vee}{=}}{\\mathrel{\\char`≚}}");
h("≛", "\\html@mathml{\\stackrel{\\scriptsize\\star}{=}}{\\mathrel{\\char`≛}}");
h("≝", "\\html@mathml{\\stackrel{\\tiny\\mathrm{def}}{=}}{\\mathrel{\\char`≝}}");
h("≞", "\\html@mathml{\\stackrel{\\tiny\\mathrm{m}}{=}}{\\mathrel{\\char`≞}}");
h("≟", "\\html@mathml{\\stackrel{\\tiny?}{=}}{\\mathrel{\\char`≟}}");
h("⟂", "\\perp");
h("‼", "\\mathclose{!\\mkern-0.8mu!}");
h("∌", "\\notni");
h("⌜", "\\ulcorner");
h("⌝", "\\urcorner");
h("⌞", "\\llcorner");
h("⌟", "\\lrcorner");
h("©", "\\copyright");
h("®", "\\textregistered");
h("️", "\\textregistered");
h("\\ulcorner", '\\html@mathml{\\@ulcorner}{\\mathop{\\char"231c}}');
h("\\urcorner", '\\html@mathml{\\@urcorner}{\\mathop{\\char"231d}}');
h("\\llcorner", '\\html@mathml{\\@llcorner}{\\mathop{\\char"231e}}');
h("\\lrcorner", '\\html@mathml{\\@lrcorner}{\\mathop{\\char"231f}}');
h("\\vdots", "\\mathord{\\varvdots\\rule{0pt}{15pt}}");
h("⋮", "\\vdots");
h("\\varGamma", "\\mathit{\\Gamma}");
h("\\varDelta", "\\mathit{\\Delta}");
h("\\varTheta", "\\mathit{\\Theta}");
h("\\varLambda", "\\mathit{\\Lambda}");
h("\\varXi", "\\mathit{\\Xi}");
h("\\varPi", "\\mathit{\\Pi}");
h("\\varSigma", "\\mathit{\\Sigma}");
h("\\varUpsilon", "\\mathit{\\Upsilon}");
h("\\varPhi", "\\mathit{\\Phi}");
h("\\varPsi", "\\mathit{\\Psi}");
h("\\varOmega", "\\mathit{\\Omega}");
h("\\substack", "\\begin{subarray}{c}#1\\end{subarray}");
h("\\colon", "\\nobreak\\mskip2mu\\mathpunct{}\\mathchoice{\\mkern-3mu}{\\mkern-3mu}{}{}{:}\\mskip6mu\\relax");
h("\\boxed", "\\fbox{$\\displaystyle{#1}$}");
h("\\iff", "\\DOTSB\\;\\Longleftrightarrow\\;");
h("\\implies", "\\DOTSB\\;\\Longrightarrow\\;");
h("\\impliedby", "\\DOTSB\\;\\Longleftarrow\\;");
var Xr = {
  ",": "\\dotsc",
  "\\not": "\\dotsb",
  // \keybin@ checks for the following:
  "+": "\\dotsb",
  "=": "\\dotsb",
  "<": "\\dotsb",
  ">": "\\dotsb",
  "-": "\\dotsb",
  "*": "\\dotsb",
  ":": "\\dotsb",
  // Symbols whose definition starts with \DOTSB:
  "\\DOTSB": "\\dotsb",
  "\\coprod": "\\dotsb",
  "\\bigvee": "\\dotsb",
  "\\bigwedge": "\\dotsb",
  "\\biguplus": "\\dotsb",
  "\\bigcap": "\\dotsb",
  "\\bigcup": "\\dotsb",
  "\\prod": "\\dotsb",
  "\\sum": "\\dotsb",
  "\\bigotimes": "\\dotsb",
  "\\bigoplus": "\\dotsb",
  "\\bigodot": "\\dotsb",
  "\\bigsqcup": "\\dotsb",
  "\\And": "\\dotsb",
  "\\longrightarrow": "\\dotsb",
  "\\Longrightarrow": "\\dotsb",
  "\\longleftarrow": "\\dotsb",
  "\\Longleftarrow": "\\dotsb",
  "\\longleftrightarrow": "\\dotsb",
  "\\Longleftrightarrow": "\\dotsb",
  "\\mapsto": "\\dotsb",
  "\\longmapsto": "\\dotsb",
  "\\hookrightarrow": "\\dotsb",
  "\\doteq": "\\dotsb",
  // Symbols whose definition starts with \mathbin:
  "\\mathbin": "\\dotsb",
  // Symbols whose definition starts with \mathrel:
  "\\mathrel": "\\dotsb",
  "\\relbar": "\\dotsb",
  "\\Relbar": "\\dotsb",
  "\\xrightarrow": "\\dotsb",
  "\\xleftarrow": "\\dotsb",
  // Symbols whose definition starts with \DOTSI:
  "\\DOTSI": "\\dotsi",
  "\\int": "\\dotsi",
  "\\oint": "\\dotsi",
  "\\iint": "\\dotsi",
  "\\iiint": "\\dotsi",
  "\\iiiint": "\\dotsi",
  "\\idotsint": "\\dotsi",
  // Symbols whose definition starts with \DOTSX:
  "\\DOTSX": "\\dotsx"
};
h("\\dots", function(r4) {
  var e = "\\dotso", t = r4.expandAfterFuture().text;
  return t in Xr ? e = Xr[t] : (t.substr(0, 4) === "\\not" || t in se.math && W.contains(["bin", "rel"], se.math[t].group)) && (e = "\\dotsb"), e;
});
var dr = {
  // \rightdelim@ checks for the following:
  ")": true,
  "]": true,
  "\\rbrack": true,
  "\\}": true,
  "\\rbrace": true,
  "\\rangle": true,
  "\\rceil": true,
  "\\rfloor": true,
  "\\rgroup": true,
  "\\rmoustache": true,
  "\\right": true,
  "\\bigr": true,
  "\\biggr": true,
  "\\Bigr": true,
  "\\Biggr": true,
  // \extra@ also tests for the following:
  $: true,
  // \extrap@ checks for the following:
  ";": true,
  ".": true,
  ",": true
};
h("\\dotso", function(r4) {
  var e = r4.future().text;
  return e in dr ? "\\ldots\\," : "\\ldots";
});
h("\\dotsc", function(r4) {
  var e = r4.future().text;
  return e in dr && e !== "," ? "\\ldots\\," : "\\ldots";
});
h("\\cdots", function(r4) {
  var e = r4.future().text;
  return e in dr ? "\\@cdots\\," : "\\@cdots";
});
h("\\dotsb", "\\cdots");
h("\\dotsm", "\\cdots");
h("\\dotsi", "\\!\\cdots");
h("\\dotsx", "\\ldots\\,");
h("\\DOTSI", "\\relax");
h("\\DOTSB", "\\relax");
h("\\DOTSX", "\\relax");
h("\\tmspace", "\\TextOrMath{\\kern#1#3}{\\mskip#1#2}\\relax");
h("\\,", "\\tmspace+{3mu}{.1667em}");
h("\\thinspace", "\\,");
h("\\>", "\\mskip{4mu}");
h("\\:", "\\tmspace+{4mu}{.2222em}");
h("\\medspace", "\\:");
h("\\;", "\\tmspace+{5mu}{.2777em}");
h("\\thickspace", "\\;");
h("\\!", "\\tmspace-{3mu}{.1667em}");
h("\\negthinspace", "\\!");
h("\\negmedspace", "\\tmspace-{4mu}{.2222em}");
h("\\negthickspace", "\\tmspace-{5mu}{.277em}");
h("\\enspace", "\\kern.5em ");
h("\\enskip", "\\hskip.5em\\relax");
h("\\quad", "\\hskip1em\\relax");
h("\\qquad", "\\hskip2em\\relax");
h("\\tag", "\\@ifstar\\tag@literal\\tag@paren");
h("\\tag@paren", "\\tag@literal{({#1})}");
h("\\tag@literal", (r4) => {
  if (r4.macros.get("\\df@tag"))
    throw new L("Multiple \\tag");
  return "\\gdef\\df@tag{\\text{#1}}";
});
h("\\bmod", "\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}\\mathbin{\\rm mod}\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}");
h("\\pod", "\\allowbreak\\mathchoice{\\mkern18mu}{\\mkern8mu}{\\mkern8mu}{\\mkern8mu}(#1)");
h("\\pmod", "\\pod{{\\rm mod}\\mkern6mu#1}");
h("\\mod", "\\allowbreak\\mathchoice{\\mkern18mu}{\\mkern12mu}{\\mkern12mu}{\\mkern12mu}{\\rm mod}\\,\\,#1");
h("\\pmb", "\\html@mathml{\\@binrel{#1}{\\mathrlap{#1}\\kern0.5px#1}}{\\mathbf{#1}}");
h("\\newline", "\\\\\\relax");
h("\\TeX", "\\textrm{\\html@mathml{T\\kern-.1667em\\raisebox{-.5ex}{E}\\kern-.125emX}{TeX}}");
var tn = $(Ze["Main-Regular"]["T".charCodeAt(0)][1] - 0.7 * Ze["Main-Regular"]["A".charCodeAt(0)][1]);
h("\\LaTeX", "\\textrm{\\html@mathml{" + ("L\\kern-.36em\\raisebox{" + tn + "}{\\scriptstyle A}") + "\\kern-.15em\\TeX}{LaTeX}}");
h("\\KaTeX", "\\textrm{\\html@mathml{" + ("K\\kern-.17em\\raisebox{" + tn + "}{\\scriptstyle A}") + "\\kern-.15em\\TeX}{KaTeX}}");
h("\\hspace", "\\@ifstar\\@hspacer\\@hspace");
h("\\@hspace", "\\hskip #1\\relax");
h("\\@hspacer", "\\rule{0pt}{0pt}\\hskip #1\\relax");
h("\\ordinarycolon", ":");
h("\\vcentcolon", "\\mathrel{\\mathop\\ordinarycolon}");
h("\\dblcolon", '\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon}}{\\mathop{\\char"2237}}');
h("\\coloneqq", '\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}=}}{\\mathop{\\char"2254}}');
h("\\Coloneqq", '\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}=}}{\\mathop{\\char"2237\\char"3d}}');
h("\\coloneq", '\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}{\\mathop{\\char"3a\\char"2212}}');
h("\\Coloneq", '\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}{\\mathop{\\char"2237\\char"2212}}');
h("\\eqqcolon", '\\html@mathml{\\mathrel{=\\mathrel{\\mkern-1.2mu}\\vcentcolon}}{\\mathop{\\char"2255}}');
h("\\Eqqcolon", '\\html@mathml{\\mathrel{=\\mathrel{\\mkern-1.2mu}\\dblcolon}}{\\mathop{\\char"3d\\char"2237}}');
h("\\eqcolon", '\\html@mathml{\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon}}{\\mathop{\\char"2239}}');
h("\\Eqcolon", '\\html@mathml{\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon}}{\\mathop{\\char"2212\\char"2237}}');
h("\\colonapprox", '\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx}}{\\mathop{\\char"3a\\char"2248}}');
h("\\Colonapprox", '\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx}}{\\mathop{\\char"2237\\char"2248}}');
h("\\colonsim", '\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim}}{\\mathop{\\char"3a\\char"223c}}');
h("\\Colonsim", '\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim}}{\\mathop{\\char"2237\\char"223c}}');
h("∷", "\\dblcolon");
h("∹", "\\eqcolon");
h("≔", "\\coloneqq");
h("≕", "\\eqqcolon");
h("⩴", "\\Coloneqq");
h("\\ratio", "\\vcentcolon");
h("\\coloncolon", "\\dblcolon");
h("\\colonequals", "\\coloneqq");
h("\\coloncolonequals", "\\Coloneqq");
h("\\equalscolon", "\\eqqcolon");
h("\\equalscoloncolon", "\\Eqqcolon");
h("\\colonminus", "\\coloneq");
h("\\coloncolonminus", "\\Coloneq");
h("\\minuscolon", "\\eqcolon");
h("\\minuscoloncolon", "\\Eqcolon");
h("\\coloncolonapprox", "\\Colonapprox");
h("\\coloncolonsim", "\\Colonsim");
h("\\simcolon", "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
h("\\simcoloncolon", "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon}");
h("\\approxcolon", "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
h("\\approxcoloncolon", "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon}");
h("\\notni", "\\html@mathml{\\not\\ni}{\\mathrel{\\char`∌}}");
h("\\limsup", "\\DOTSB\\operatorname*{lim\\,sup}");
h("\\liminf", "\\DOTSB\\operatorname*{lim\\,inf}");
h("\\injlim", "\\DOTSB\\operatorname*{inj\\,lim}");
h("\\projlim", "\\DOTSB\\operatorname*{proj\\,lim}");
h("\\varlimsup", "\\DOTSB\\operatorname*{\\overline{lim}}");
h("\\varliminf", "\\DOTSB\\operatorname*{\\underline{lim}}");
h("\\varinjlim", "\\DOTSB\\operatorname*{\\underrightarrow{lim}}");
h("\\varprojlim", "\\DOTSB\\operatorname*{\\underleftarrow{lim}}");
h("\\gvertneqq", "\\html@mathml{\\@gvertneqq}{≩}");
h("\\lvertneqq", "\\html@mathml{\\@lvertneqq}{≨}");
h("\\ngeqq", "\\html@mathml{\\@ngeqq}{≱}");
h("\\ngeqslant", "\\html@mathml{\\@ngeqslant}{≱}");
h("\\nleqq", "\\html@mathml{\\@nleqq}{≰}");
h("\\nleqslant", "\\html@mathml{\\@nleqslant}{≰}");
h("\\nshortmid", "\\html@mathml{\\@nshortmid}{∤}");
h("\\nshortparallel", "\\html@mathml{\\@nshortparallel}{∦}");
h("\\nsubseteqq", "\\html@mathml{\\@nsubseteqq}{⊈}");
h("\\nsupseteqq", "\\html@mathml{\\@nsupseteqq}{⊉}");
h("\\varsubsetneq", "\\html@mathml{\\@varsubsetneq}{⊊}");
h("\\varsubsetneqq", "\\html@mathml{\\@varsubsetneqq}{⫋}");
h("\\varsupsetneq", "\\html@mathml{\\@varsupsetneq}{⊋}");
h("\\varsupsetneqq", "\\html@mathml{\\@varsupsetneqq}{⫌}");
h("\\imath", "\\html@mathml{\\@imath}{ı}");
h("\\jmath", "\\html@mathml{\\@jmath}{ȷ}");
h("\\llbracket", "\\html@mathml{\\mathopen{[\\mkern-3.2mu[}}{\\mathopen{\\char`⟦}}");
h("\\rrbracket", "\\html@mathml{\\mathclose{]\\mkern-3.2mu]}}{\\mathclose{\\char`⟧}}");
h("⟦", "\\llbracket");
h("⟧", "\\rrbracket");
h("\\lBrace", "\\html@mathml{\\mathopen{\\{\\mkern-3.2mu[}}{\\mathopen{\\char`⦃}}");
h("\\rBrace", "\\html@mathml{\\mathclose{]\\mkern-3.2mu\\}}}{\\mathclose{\\char`⦄}}");
h("⦃", "\\lBrace");
h("⦄", "\\rBrace");
h("\\minuso", "\\mathbin{\\html@mathml{{\\mathrlap{\\mathchoice{\\kern{0.145em}}{\\kern{0.145em}}{\\kern{0.1015em}}{\\kern{0.0725em}}\\circ}{-}}}{\\char`⦵}}");
h("⦵", "\\minuso");
h("\\darr", "\\downarrow");
h("\\dArr", "\\Downarrow");
h("\\Darr", "\\Downarrow");
h("\\lang", "\\langle");
h("\\rang", "\\rangle");
h("\\uarr", "\\uparrow");
h("\\uArr", "\\Uparrow");
h("\\Uarr", "\\Uparrow");
h("\\N", "\\mathbb{N}");
h("\\R", "\\mathbb{R}");
h("\\Z", "\\mathbb{Z}");
h("\\alef", "\\aleph");
h("\\alefsym", "\\aleph");
h("\\Alpha", "\\mathrm{A}");
h("\\Beta", "\\mathrm{B}");
h("\\bull", "\\bullet");
h("\\Chi", "\\mathrm{X}");
h("\\clubs", "\\clubsuit");
h("\\cnums", "\\mathbb{C}");
h("\\Complex", "\\mathbb{C}");
h("\\Dagger", "\\ddagger");
h("\\diamonds", "\\diamondsuit");
h("\\empty", "\\emptyset");
h("\\Epsilon", "\\mathrm{E}");
h("\\Eta", "\\mathrm{H}");
h("\\exist", "\\exists");
h("\\harr", "\\leftrightarrow");
h("\\hArr", "\\Leftrightarrow");
h("\\Harr", "\\Leftrightarrow");
h("\\hearts", "\\heartsuit");
h("\\image", "\\Im");
h("\\infin", "\\infty");
h("\\Iota", "\\mathrm{I}");
h("\\isin", "\\in");
h("\\Kappa", "\\mathrm{K}");
h("\\larr", "\\leftarrow");
h("\\lArr", "\\Leftarrow");
h("\\Larr", "\\Leftarrow");
h("\\lrarr", "\\leftrightarrow");
h("\\lrArr", "\\Leftrightarrow");
h("\\Lrarr", "\\Leftrightarrow");
h("\\Mu", "\\mathrm{M}");
h("\\natnums", "\\mathbb{N}");
h("\\Nu", "\\mathrm{N}");
h("\\Omicron", "\\mathrm{O}");
h("\\plusmn", "\\pm");
h("\\rarr", "\\rightarrow");
h("\\rArr", "\\Rightarrow");
h("\\Rarr", "\\Rightarrow");
h("\\real", "\\Re");
h("\\reals", "\\mathbb{R}");
h("\\Reals", "\\mathbb{R}");
h("\\Rho", "\\mathrm{P}");
h("\\sdot", "\\cdot");
h("\\sect", "\\S");
h("\\spades", "\\spadesuit");
h("\\sub", "\\subset");
h("\\sube", "\\subseteq");
h("\\supe", "\\supseteq");
h("\\Tau", "\\mathrm{T}");
h("\\thetasym", "\\vartheta");
h("\\weierp", "\\wp");
h("\\Zeta", "\\mathrm{Z}");
h("\\argmin", "\\DOTSB\\operatorname*{arg\\,min}");
h("\\argmax", "\\DOTSB\\operatorname*{arg\\,max}");
h("\\plim", "\\DOTSB\\mathop{\\operatorname{plim}}\\limits");
h("\\bra", "\\mathinner{\\langle{#1}|}");
h("\\ket", "\\mathinner{|{#1}\\rangle}");
h("\\braket", "\\mathinner{\\langle{#1}\\rangle}");
h("\\Bra", "\\left\\langle#1\\right|");
h("\\Ket", "\\left|#1\\right\\rangle");
var rn = (r4) => (e) => {
  var t = e.consumeArg().tokens, a = e.consumeArg().tokens, n = e.consumeArg().tokens, i = e.consumeArg().tokens, o = e.macros.get("|"), u = e.macros.get("\\|");
  e.macros.beginGroup();
  var c = (v) => (k) => {
    r4 && (k.macros.set("|", o), n.length && k.macros.set("\\|", u));
    var S = v;
    if (!v && n.length) {
      var z = k.future();
      z.text === "|" && (k.popToken(), S = true);
    }
    return {
      tokens: S ? n : a,
      numArgs: 0
    };
  };
  e.macros.set("|", c(false)), n.length && e.macros.set("\\|", c(true));
  var m = e.consumeArg().tokens, p = e.expandTokens([
    ...i,
    ...m,
    ...t
    // reversed
  ]);
  return e.macros.endGroup(), {
    tokens: p.reverse(),
    numArgs: 0
  };
};
h("\\bra@ket", rn(false));
h("\\bra@set", rn(true));
h("\\Braket", "\\bra@ket{\\left\\langle}{\\,\\middle\\vert\\,}{\\,\\middle\\vert\\,}{\\right\\rangle}");
h("\\Set", "\\bra@set{\\left\\{\\:}{\\;\\middle\\vert\\;}{\\;\\middle\\Vert\\;}{\\:\\right\\}}");
h("\\set", "\\bra@set{\\{\\,}{\\mid}{}{\\,\\}}");
h("\\angln", "{\\angl n}");
h("\\blue", "\\textcolor{##6495ed}{#1}");
h("\\orange", "\\textcolor{##ffa500}{#1}");
h("\\pink", "\\textcolor{##ff00af}{#1}");
h("\\red", "\\textcolor{##df0030}{#1}");
h("\\green", "\\textcolor{##28ae7b}{#1}");
h("\\gray", "\\textcolor{gray}{#1}");
h("\\purple", "\\textcolor{##9d38bd}{#1}");
h("\\blueA", "\\textcolor{##ccfaff}{#1}");
h("\\blueB", "\\textcolor{##80f6ff}{#1}");
h("\\blueC", "\\textcolor{##63d9ea}{#1}");
h("\\blueD", "\\textcolor{##11accd}{#1}");
h("\\blueE", "\\textcolor{##0c7f99}{#1}");
h("\\tealA", "\\textcolor{##94fff5}{#1}");
h("\\tealB", "\\textcolor{##26edd5}{#1}");
h("\\tealC", "\\textcolor{##01d1c1}{#1}");
h("\\tealD", "\\textcolor{##01a995}{#1}");
h("\\tealE", "\\textcolor{##208170}{#1}");
h("\\greenA", "\\textcolor{##b6ffb0}{#1}");
h("\\greenB", "\\textcolor{##8af281}{#1}");
h("\\greenC", "\\textcolor{##74cf70}{#1}");
h("\\greenD", "\\textcolor{##1fab54}{#1}");
h("\\greenE", "\\textcolor{##0d923f}{#1}");
h("\\goldA", "\\textcolor{##ffd0a9}{#1}");
h("\\goldB", "\\textcolor{##ffbb71}{#1}");
h("\\goldC", "\\textcolor{##ff9c39}{#1}");
h("\\goldD", "\\textcolor{##e07d10}{#1}");
h("\\goldE", "\\textcolor{##a75a05}{#1}");
h("\\redA", "\\textcolor{##fca9a9}{#1}");
h("\\redB", "\\textcolor{##ff8482}{#1}");
h("\\redC", "\\textcolor{##f9685d}{#1}");
h("\\redD", "\\textcolor{##e84d39}{#1}");
h("\\redE", "\\textcolor{##bc2612}{#1}");
h("\\maroonA", "\\textcolor{##ffbde0}{#1}");
h("\\maroonB", "\\textcolor{##ff92c6}{#1}");
h("\\maroonC", "\\textcolor{##ed5fa6}{#1}");
h("\\maroonD", "\\textcolor{##ca337c}{#1}");
h("\\maroonE", "\\textcolor{##9e034e}{#1}");
h("\\purpleA", "\\textcolor{##ddd7ff}{#1}");
h("\\purpleB", "\\textcolor{##c6b9fc}{#1}");
h("\\purpleC", "\\textcolor{##aa87ff}{#1}");
h("\\purpleD", "\\textcolor{##7854ab}{#1}");
h("\\purpleE", "\\textcolor{##543b78}{#1}");
h("\\mintA", "\\textcolor{##f5f9e8}{#1}");
h("\\mintB", "\\textcolor{##edf2df}{#1}");
h("\\mintC", "\\textcolor{##e0e5cc}{#1}");
h("\\grayA", "\\textcolor{##f6f7f7}{#1}");
h("\\grayB", "\\textcolor{##f0f1f2}{#1}");
h("\\grayC", "\\textcolor{##e3e5e6}{#1}");
h("\\grayD", "\\textcolor{##d6d8da}{#1}");
h("\\grayE", "\\textcolor{##babec2}{#1}");
h("\\grayF", "\\textcolor{##888d93}{#1}");
h("\\grayG", "\\textcolor{##626569}{#1}");
h("\\grayH", "\\textcolor{##3b3e40}{#1}");
h("\\grayI", "\\textcolor{##21242c}{#1}");
h("\\kaBlue", "\\textcolor{##314453}{#1}");
h("\\kaGreen", "\\textcolor{##71B307}{#1}");
var an = {
  "^": true,
  // Parser.js
  _: true,
  // Parser.js
  "\\limits": true,
  // Parser.js
  "\\nolimits": true
  // Parser.js
};
class ps {
  constructor(e, t, a) {
    this.settings = void 0, this.expansionCount = void 0, this.lexer = void 0, this.macros = void 0, this.stack = void 0, this.mode = void 0, this.settings = t, this.expansionCount = 0, this.feed(e), this.macros = new hs(ms, t.macros), this.mode = a, this.stack = [];
  }
  /**
   * Feed a new input string to the same MacroExpander
   * (with existing macros etc.).
   */
  feed(e) {
    this.lexer = new Yr(e, this.settings);
  }
  /**
   * Switches between "text" and "math" modes.
   */
  switchMode(e) {
    this.mode = e;
  }
  /**
   * Start a new group nesting within all namespaces.
   */
  beginGroup() {
    this.macros.beginGroup();
  }
  /**
   * End current group nesting within all namespaces.
   */
  endGroup() {
    this.macros.endGroup();
  }
  /**
   * Ends all currently nested groups (if any), restoring values before the
   * groups began.  Useful in case of an error in the middle of parsing.
   */
  endGroups() {
    this.macros.endGroups();
  }
  /**
   * Returns the topmost token on the stack, without expanding it.
   * Similar in behavior to TeX's `\futurelet`.
   */
  future() {
    return this.stack.length === 0 && this.pushToken(this.lexer.lex()), this.stack[this.stack.length - 1];
  }
  /**
   * Remove and return the next unexpanded token.
   */
  popToken() {
    return this.future(), this.stack.pop();
  }
  /**
   * Add a given token to the token stack.  In particular, this get be used
   * to put back a token returned from one of the other methods.
   */
  pushToken(e) {
    this.stack.push(e);
  }
  /**
   * Append an array of tokens to the token stack.
   */
  pushTokens(e) {
    this.stack.push(...e);
  }
  /**
   * Find an macro argument without expanding tokens and append the array of
   * tokens to the token stack. Uses Token as a container for the result.
   */
  scanArgument(e) {
    var t, a, n;
    if (e) {
      if (this.consumeSpaces(), this.future().text !== "[")
        return null;
      t = this.popToken(), {
        tokens: n,
        end: a
      } = this.consumeArg(["]"]);
    } else
      ({
        tokens: n,
        start: t,
        end: a
      } = this.consumeArg());
    return this.pushToken(new qe("EOF", a.loc)), this.pushTokens(n), t.range(a, "");
  }
  /**
   * Consume all following space tokens, without expansion.
   */
  consumeSpaces() {
    for (; ; ) {
      var e = this.future();
      if (e.text === " ")
        this.stack.pop();
      else
        break;
    }
  }
  /**
   * Consume an argument from the token stream, and return the resulting array
   * of tokens and start/end token.
   */
  consumeArg(e) {
    var t = [], a = e && e.length > 0;
    a || this.consumeSpaces();
    var n = this.future(), i, o = 0, u = 0;
    do {
      if (i = this.popToken(), t.push(i), i.text === "{")
        ++o;
      else if (i.text === "}") {
        if (--o, o === -1)
          throw new L("Extra }", i);
      } else if (i.text === "EOF")
        throw new L("Unexpected end of input in a macro argument, expected '" + (e && a ? e[u] : "}") + "'", i);
      if (e && a)
        if ((o === 0 || o === 1 && e[u] === "{") && i.text === e[u]) {
          if (++u, u === e.length) {
            t.splice(-u, u);
            break;
          }
        } else
          u = 0;
    } while (o !== 0 || a);
    return n.text === "{" && t[t.length - 1].text === "}" && (t.pop(), t.shift()), t.reverse(), {
      tokens: t,
      start: n,
      end: i
    };
  }
  /**
   * Consume the specified number of (delimited) arguments from the token
   * stream and return the resulting array of arguments.
   */
  consumeArgs(e, t) {
    if (t) {
      if (t.length !== e + 1)
        throw new L("The length of delimiters doesn't match the number of args!");
      for (var a = t[0], n = 0; n < a.length; n++) {
        var i = this.popToken();
        if (a[n] !== i.text)
          throw new L("Use of the macro doesn't match its definition", i);
      }
    }
    for (var o = [], u = 0; u < e; u++)
      o.push(this.consumeArg(t && t[u + 1]).tokens);
    return o;
  }
  /**
   * Expand the next token only once if possible.
   *
   * If the token is expanded, the resulting tokens will be pushed onto
   * the stack in reverse order and will be returned as an array,
   * also in reverse order.
   *
   * If not, the next token will be returned without removing it
   * from the stack.  This case can be detected by a `Token` return value
   * instead of an `Array` return value.
   *
   * In either case, the next token will be on the top of the stack,
   * or the stack will be empty.
   *
   * Used to implement `expandAfterFuture` and `expandNextToken`.
   *
   * If expandableOnly, only expandable tokens are expanded and
   * an undefined control sequence results in an error.
   */
  expandOnce(e) {
    var t = this.popToken(), a = t.text, n = t.noexpand ? null : this._getExpansion(a);
    if (n == null || e && n.unexpandable) {
      if (e && n == null && a[0] === "\\" && !this.isDefined(a))
        throw new L("Undefined control sequence: " + a);
      return this.pushToken(t), t;
    }
    if (this.expansionCount++, this.expansionCount > this.settings.maxExpand)
      throw new L("Too many expansions: infinite loop or need to increase maxExpand setting");
    var i = n.tokens, o = this.consumeArgs(n.numArgs, n.delimiters);
    if (n.numArgs) {
      i = i.slice();
      for (var u = i.length - 1; u >= 0; --u) {
        var c = i[u];
        if (c.text === "#") {
          if (u === 0)
            throw new L("Incomplete placeholder at end of macro body", c);
          if (c = i[--u], c.text === "#")
            i.splice(u + 1, 1);
          else if (/^[1-9]$/.test(c.text))
            i.splice(u, 2, ...o[+c.text - 1]);
          else
            throw new L("Not a valid argument number", c);
        }
      }
    }
    return this.pushTokens(i), i;
  }
  /**
   * Expand the next token only once (if possible), and return the resulting
   * top token on the stack (without removing anything from the stack).
   * Similar in behavior to TeX's `\expandafter\futurelet`.
   * Equivalent to expandOnce() followed by future().
   */
  expandAfterFuture() {
    return this.expandOnce(), this.future();
  }
  /**
   * Recursively expand first token, then return first non-expandable token.
   */
  expandNextToken() {
    for (; ; ) {
      var e = this.expandOnce();
      if (e instanceof qe)
        return e.treatAsRelax && (e.text = "\\relax"), this.stack.pop();
    }
    throw new Error();
  }
  /**
   * Fully expand the given macro name and return the resulting list of
   * tokens, or return `undefined` if no such macro is defined.
   */
  expandMacro(e) {
    return this.macros.has(e) ? this.expandTokens([new qe(e)]) : void 0;
  }
  /**
   * Fully expand the given token stream and return the resulting list of
   * tokens.  Note that the input tokens are in reverse order, but the
   * output tokens are in forward order.
   */
  expandTokens(e) {
    var t = [], a = this.stack.length;
    for (this.pushTokens(e); this.stack.length > a; ) {
      var n = this.expandOnce(true);
      n instanceof qe && (n.treatAsRelax && (n.noexpand = false, n.treatAsRelax = false), t.push(this.stack.pop()));
    }
    return t;
  }
  /**
   * Fully expand the given macro name and return the result as a string,
   * or return `undefined` if no such macro is defined.
   */
  expandMacroAsText(e) {
    var t = this.expandMacro(e);
    return t && t.map((a) => a.text).join("");
  }
  /**
   * Returns the expanded macro as a reversed array of tokens and a macro
   * argument count.  Or returns `null` if no such macro.
   */
  _getExpansion(e) {
    var t = this.macros.get(e);
    if (t == null)
      return t;
    if (e.length === 1) {
      var a = this.lexer.catcodes[e];
      if (a != null && a !== 13)
        return;
    }
    var n = typeof t == "function" ? t(this) : t;
    if (typeof n == "string") {
      var i = 0;
      if (n.indexOf("#") !== -1)
        for (var o = n.replace(/##/g, ""); o.indexOf("#" + (i + 1)) !== -1; )
          ++i;
      for (var u = new Yr(n, this.settings), c = [], m = u.lex(); m.text !== "EOF"; )
        c.push(m), m = u.lex();
      c.reverse();
      var p = {
        tokens: c,
        numArgs: i
      };
      return p;
    }
    return n;
  }
  /**
   * Determine whether a command is currently "defined" (has some
   * functionality), meaning that it's a macro (in the current group),
   * a function, a symbol, or one of the special commands listed in
   * `implicitCommands`.
   */
  isDefined(e) {
    return this.macros.has(e) || d0.hasOwnProperty(e) || se.math.hasOwnProperty(e) || se.text.hasOwnProperty(e) || an.hasOwnProperty(e);
  }
  /**
   * Determine whether a command is expandable.
   */
  isExpandable(e) {
    var t = this.macros.get(e);
    return t != null ? typeof t == "string" || typeof t == "function" || !t.unexpandable : d0.hasOwnProperty(e) && !d0[e].primitive;
  }
}
var Zr = /^[₊₋₌₍₎₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓᵦᵧᵨᵩᵪ]/, J0 = Object.freeze({
  "₊": "+",
  "₋": "-",
  "₌": "=",
  "₍": "(",
  "₎": ")",
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  "ₐ": "a",
  "ₑ": "e",
  "ₕ": "h",
  "ᵢ": "i",
  "ⱼ": "j",
  "ₖ": "k",
  "ₗ": "l",
  "ₘ": "m",
  "ₙ": "n",
  "ₒ": "o",
  "ₚ": "p",
  "ᵣ": "r",
  "ₛ": "s",
  "ₜ": "t",
  "ᵤ": "u",
  "ᵥ": "v",
  "ₓ": "x",
  "ᵦ": "β",
  "ᵧ": "γ",
  "ᵨ": "ρ",
  "ᵩ": "ϕ",
  "ᵪ": "χ",
  "⁺": "+",
  "⁻": "-",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "ᴬ": "A",
  "ᴮ": "B",
  "ᴰ": "D",
  "ᴱ": "E",
  "ᴳ": "G",
  "ᴴ": "H",
  "ᴵ": "I",
  "ᴶ": "J",
  "ᴷ": "K",
  "ᴸ": "L",
  "ᴹ": "M",
  "ᴺ": "N",
  "ᴼ": "O",
  "ᴾ": "P",
  "ᴿ": "R",
  "ᵀ": "T",
  "ᵁ": "U",
  "ⱽ": "V",
  "ᵂ": "W",
  "ᵃ": "a",
  "ᵇ": "b",
  "ᶜ": "c",
  "ᵈ": "d",
  "ᵉ": "e",
  "ᶠ": "f",
  "ᵍ": "g",
  ʰ: "h",
  "ⁱ": "i",
  ʲ: "j",
  "ᵏ": "k",
  ˡ: "l",
  "ᵐ": "m",
  ⁿ: "n",
  "ᵒ": "o",
  "ᵖ": "p",
  ʳ: "r",
  ˢ: "s",
  "ᵗ": "t",
  "ᵘ": "u",
  "ᵛ": "v",
  ʷ: "w",
  ˣ: "x",
  ʸ: "y",
  "ᶻ": "z",
  "ᵝ": "β",
  "ᵞ": "γ",
  "ᵟ": "δ",
  "ᵠ": "ϕ",
  "ᵡ": "χ",
  "ᶿ": "θ"
}), Dt = {
  "́": {
    text: "\\'",
    math: "\\acute"
  },
  "̀": {
    text: "\\`",
    math: "\\grave"
  },
  "̈": {
    text: '\\"',
    math: "\\ddot"
  },
  "̃": {
    text: "\\~",
    math: "\\tilde"
  },
  "̄": {
    text: "\\=",
    math: "\\bar"
  },
  "̆": {
    text: "\\u",
    math: "\\breve"
  },
  "̌": {
    text: "\\v",
    math: "\\check"
  },
  "̂": {
    text: "\\^",
    math: "\\hat"
  },
  "̇": {
    text: "\\.",
    math: "\\dot"
  },
  "̊": {
    text: "\\r",
    math: "\\mathring"
  },
  "̋": {
    text: "\\H"
  },
  "̧": {
    text: "\\c"
  }
}, Kr = {
  á: "á",
  à: "à",
  ä: "ä",
  ǟ: "ǟ",
  ã: "ã",
  ā: "ā",
  ă: "ă",
  ắ: "ắ",
  ằ: "ằ",
  ẵ: "ẵ",
  ǎ: "ǎ",
  â: "â",
  ấ: "ấ",
  ầ: "ầ",
  ẫ: "ẫ",
  ȧ: "ȧ",
  ǡ: "ǡ",
  å: "å",
  ǻ: "ǻ",
  ḃ: "ḃ",
  ć: "ć",
  ḉ: "ḉ",
  č: "č",
  ĉ: "ĉ",
  ċ: "ċ",
  ç: "ç",
  ď: "ď",
  ḋ: "ḋ",
  ḑ: "ḑ",
  é: "é",
  è: "è",
  ë: "ë",
  ẽ: "ẽ",
  ē: "ē",
  ḗ: "ḗ",
  ḕ: "ḕ",
  ĕ: "ĕ",
  ḝ: "ḝ",
  ě: "ě",
  ê: "ê",
  ế: "ế",
  ề: "ề",
  ễ: "ễ",
  ė: "ė",
  ȩ: "ȩ",
  ḟ: "ḟ",
  ǵ: "ǵ",
  ḡ: "ḡ",
  ğ: "ğ",
  ǧ: "ǧ",
  ĝ: "ĝ",
  ġ: "ġ",
  ģ: "ģ",
  ḧ: "ḧ",
  ȟ: "ȟ",
  ĥ: "ĥ",
  ḣ: "ḣ",
  ḩ: "ḩ",
  í: "í",
  ì: "ì",
  ï: "ï",
  ḯ: "ḯ",
  ĩ: "ĩ",
  ī: "ī",
  ĭ: "ĭ",
  ǐ: "ǐ",
  î: "î",
  ǰ: "ǰ",
  ĵ: "ĵ",
  ḱ: "ḱ",
  ǩ: "ǩ",
  ķ: "ķ",
  ĺ: "ĺ",
  ľ: "ľ",
  ļ: "ļ",
  ḿ: "ḿ",
  ṁ: "ṁ",
  ń: "ń",
  ǹ: "ǹ",
  ñ: "ñ",
  ň: "ň",
  ṅ: "ṅ",
  ņ: "ņ",
  ó: "ó",
  ò: "ò",
  ö: "ö",
  ȫ: "ȫ",
  õ: "õ",
  ṍ: "ṍ",
  ṏ: "ṏ",
  ȭ: "ȭ",
  ō: "ō",
  ṓ: "ṓ",
  ṑ: "ṑ",
  ŏ: "ŏ",
  ǒ: "ǒ",
  ô: "ô",
  ố: "ố",
  ồ: "ồ",
  ỗ: "ỗ",
  ȯ: "ȯ",
  ȱ: "ȱ",
  ő: "ő",
  ṕ: "ṕ",
  ṗ: "ṗ",
  ŕ: "ŕ",
  ř: "ř",
  ṙ: "ṙ",
  ŗ: "ŗ",
  ś: "ś",
  ṥ: "ṥ",
  š: "š",
  ṧ: "ṧ",
  ŝ: "ŝ",
  ṡ: "ṡ",
  ş: "ş",
  ẗ: "ẗ",
  ť: "ť",
  ṫ: "ṫ",
  ţ: "ţ",
  ú: "ú",
  ù: "ù",
  ü: "ü",
  ǘ: "ǘ",
  ǜ: "ǜ",
  ǖ: "ǖ",
  ǚ: "ǚ",
  ũ: "ũ",
  ṹ: "ṹ",
  ū: "ū",
  ṻ: "ṻ",
  ŭ: "ŭ",
  ǔ: "ǔ",
  û: "û",
  ů: "ů",
  ű: "ű",
  ṽ: "ṽ",
  ẃ: "ẃ",
  ẁ: "ẁ",
  ẅ: "ẅ",
  ŵ: "ŵ",
  ẇ: "ẇ",
  ẘ: "ẘ",
  ẍ: "ẍ",
  ẋ: "ẋ",
  ý: "ý",
  ỳ: "ỳ",
  ÿ: "ÿ",
  ỹ: "ỹ",
  ȳ: "ȳ",
  ŷ: "ŷ",
  ẏ: "ẏ",
  ẙ: "ẙ",
  ź: "ź",
  ž: "ž",
  ẑ: "ẑ",
  ż: "ż",
  Á: "Á",
  À: "À",
  Ä: "Ä",
  Ǟ: "Ǟ",
  Ã: "Ã",
  Ā: "Ā",
  Ă: "Ă",
  Ắ: "Ắ",
  Ằ: "Ằ",
  Ẵ: "Ẵ",
  Ǎ: "Ǎ",
  Â: "Â",
  Ấ: "Ấ",
  Ầ: "Ầ",
  Ẫ: "Ẫ",
  Ȧ: "Ȧ",
  Ǡ: "Ǡ",
  Å: "Å",
  Ǻ: "Ǻ",
  Ḃ: "Ḃ",
  Ć: "Ć",
  Ḉ: "Ḉ",
  Č: "Č",
  Ĉ: "Ĉ",
  Ċ: "Ċ",
  Ç: "Ç",
  Ď: "Ď",
  Ḋ: "Ḋ",
  Ḑ: "Ḑ",
  É: "É",
  È: "È",
  Ë: "Ë",
  Ẽ: "Ẽ",
  Ē: "Ē",
  Ḗ: "Ḗ",
  Ḕ: "Ḕ",
  Ĕ: "Ĕ",
  Ḝ: "Ḝ",
  Ě: "Ě",
  Ê: "Ê",
  Ế: "Ế",
  Ề: "Ề",
  Ễ: "Ễ",
  Ė: "Ė",
  Ȩ: "Ȩ",
  Ḟ: "Ḟ",
  Ǵ: "Ǵ",
  Ḡ: "Ḡ",
  Ğ: "Ğ",
  Ǧ: "Ǧ",
  Ĝ: "Ĝ",
  Ġ: "Ġ",
  Ģ: "Ģ",
  Ḧ: "Ḧ",
  Ȟ: "Ȟ",
  Ĥ: "Ĥ",
  Ḣ: "Ḣ",
  Ḩ: "Ḩ",
  Í: "Í",
  Ì: "Ì",
  Ï: "Ï",
  Ḯ: "Ḯ",
  Ĩ: "Ĩ",
  Ī: "Ī",
  Ĭ: "Ĭ",
  Ǐ: "Ǐ",
  Î: "Î",
  İ: "İ",
  Ĵ: "Ĵ",
  Ḱ: "Ḱ",
  Ǩ: "Ǩ",
  Ķ: "Ķ",
  Ĺ: "Ĺ",
  Ľ: "Ľ",
  Ļ: "Ļ",
  Ḿ: "Ḿ",
  Ṁ: "Ṁ",
  Ń: "Ń",
  Ǹ: "Ǹ",
  Ñ: "Ñ",
  Ň: "Ň",
  Ṅ: "Ṅ",
  Ņ: "Ņ",
  Ó: "Ó",
  Ò: "Ò",
  Ö: "Ö",
  Ȫ: "Ȫ",
  Õ: "Õ",
  Ṍ: "Ṍ",
  Ṏ: "Ṏ",
  Ȭ: "Ȭ",
  Ō: "Ō",
  Ṓ: "Ṓ",
  Ṑ: "Ṑ",
  Ŏ: "Ŏ",
  Ǒ: "Ǒ",
  Ô: "Ô",
  Ố: "Ố",
  Ồ: "Ồ",
  Ỗ: "Ỗ",
  Ȯ: "Ȯ",
  Ȱ: "Ȱ",
  Ő: "Ő",
  Ṕ: "Ṕ",
  Ṗ: "Ṗ",
  Ŕ: "Ŕ",
  Ř: "Ř",
  Ṙ: "Ṙ",
  Ŗ: "Ŗ",
  Ś: "Ś",
  Ṥ: "Ṥ",
  Š: "Š",
  Ṧ: "Ṧ",
  Ŝ: "Ŝ",
  Ṡ: "Ṡ",
  Ş: "Ş",
  Ť: "Ť",
  Ṫ: "Ṫ",
  Ţ: "Ţ",
  Ú: "Ú",
  Ù: "Ù",
  Ü: "Ü",
  Ǘ: "Ǘ",
  Ǜ: "Ǜ",
  Ǖ: "Ǖ",
  Ǚ: "Ǚ",
  Ũ: "Ũ",
  Ṹ: "Ṹ",
  Ū: "Ū",
  Ṻ: "Ṻ",
  Ŭ: "Ŭ",
  Ǔ: "Ǔ",
  Û: "Û",
  Ů: "Ů",
  Ű: "Ű",
  Ṽ: "Ṽ",
  Ẃ: "Ẃ",
  Ẁ: "Ẁ",
  Ẅ: "Ẅ",
  Ŵ: "Ŵ",
  Ẇ: "Ẇ",
  Ẍ: "Ẍ",
  Ẋ: "Ẋ",
  Ý: "Ý",
  Ỳ: "Ỳ",
  Ÿ: "Ÿ",
  Ỹ: "Ỹ",
  Ȳ: "Ȳ",
  Ŷ: "Ŷ",
  Ẏ: "Ẏ",
  Ź: "Ź",
  Ž: "Ž",
  Ẑ: "Ẑ",
  Ż: "Ż",
  ά: "ά",
  ὰ: "ὰ",
  ᾱ: "ᾱ",
  ᾰ: "ᾰ",
  έ: "έ",
  ὲ: "ὲ",
  ή: "ή",
  ὴ: "ὴ",
  ί: "ί",
  ὶ: "ὶ",
  ϊ: "ϊ",
  ΐ: "ΐ",
  ῒ: "ῒ",
  ῑ: "ῑ",
  ῐ: "ῐ",
  ό: "ό",
  ὸ: "ὸ",
  ύ: "ύ",
  ὺ: "ὺ",
  ϋ: "ϋ",
  ΰ: "ΰ",
  ῢ: "ῢ",
  ῡ: "ῡ",
  ῠ: "ῠ",
  ώ: "ώ",
  ὼ: "ὼ",
  Ύ: "Ύ",
  Ὺ: "Ὺ",
  Ϋ: "Ϋ",
  Ῡ: "Ῡ",
  Ῠ: "Ῠ",
  Ώ: "Ώ",
  Ὼ: "Ὼ"
};
class O0 {
  constructor(e, t) {
    this.mode = void 0, this.gullet = void 0, this.settings = void 0, this.leftrightDepth = void 0, this.nextToken = void 0, this.mode = "math", this.gullet = new ps(e, t, this.mode), this.settings = t, this.leftrightDepth = 0;
  }
  /**
   * Checks a result to make sure it has the right type, and throws an
   * appropriate error otherwise.
   */
  expect(e, t) {
    if (t === void 0 && (t = true), this.fetch().text !== e)
      throw new L("Expected '" + e + "', got '" + this.fetch().text + "'", this.fetch());
    t && this.consume();
  }
  /**
   * Discards the current lookahead token, considering it consumed.
   */
  consume() {
    this.nextToken = null;
  }
  /**
   * Return the current lookahead token, or if there isn't one (at the
   * beginning, or if the previous lookahead token was consume()d),
   * fetch the next token as the new lookahead token and return it.
   */
  fetch() {
    return this.nextToken == null && (this.nextToken = this.gullet.expandNextToken()), this.nextToken;
  }
  /**
   * Switches between "text" and "math" modes.
   */
  switchMode(e) {
    this.mode = e, this.gullet.switchMode(e);
  }
  /**
   * Main parsing function, which parses an entire input.
   */
  parse() {
    this.settings.globalGroup || this.gullet.beginGroup(), this.settings.colorIsTextColor && this.gullet.macros.set("\\color", "\\textcolor");
    try {
      var e = this.parseExpression(false);
      return this.expect("EOF"), this.settings.globalGroup || this.gullet.endGroup(), e;
    } finally {
      this.gullet.endGroups();
    }
  }
  /**
   * Fully parse a separate sequence of tokens as a separate job.
   * Tokens should be specified in reverse order, as in a MacroDefinition.
   */
  subparse(e) {
    var t = this.nextToken;
    this.consume(), this.gullet.pushToken(new qe("}")), this.gullet.pushTokens(e);
    var a = this.parseExpression(false);
    return this.expect("}"), this.nextToken = t, a;
  }
  /**
   * Parses an "expression", which is a list of atoms.
   *
   * `breakOnInfix`: Should the parsing stop when we hit infix nodes? This
   *                 happens when functions have higher precendence han infix
   *                 nodes in implicit parses.
   *
   * `breakOnTokenText`: The text of the token that the expression should end
   *                     with, or `null` if something else should end the
   *                     expression.
   */
  parseExpression(e, t) {
    for (var a = []; ; ) {
      this.mode === "math" && this.consumeSpaces();
      var n = this.fetch();
      if (O0.endOfExpression.indexOf(n.text) !== -1 || t && n.text === t || e && d0[n.text] && d0[n.text].infix)
        break;
      var i = this.parseAtom(t);
      if (i) {
        if (i.type === "internal")
          continue;
      } else
        break;
      a.push(i);
    }
    return this.mode === "text" && this.formLigatures(a), this.handleInfixNodes(a);
  }
  /**
   * Rewrites infix operators such as \over with corresponding commands such
   * as \frac.
   *
   * There can only be one infix operator per group.  If there's more than one
   * then the expression is ambiguous.  This can be resolved by adding {}.
   */
  handleInfixNodes(e) {
    for (var t = -1, a, n = 0; n < e.length; n++)
      if (e[n].type === "infix") {
        if (t !== -1)
          throw new L("only one infix operator per group", e[n].token);
        t = n, a = e[n].replaceWith;
      }
    if (t !== -1 && a) {
      var i, o, u = e.slice(0, t), c = e.slice(t + 1);
      u.length === 1 && u[0].type === "ordgroup" ? i = u[0] : i = {
        type: "ordgroup",
        mode: this.mode,
        body: u
      }, c.length === 1 && c[0].type === "ordgroup" ? o = c[0] : o = {
        type: "ordgroup",
        mode: this.mode,
        body: c
      };
      var m;
      return a === "\\\\abovefrac" ? m = this.callFunction(a, [i, e[t], o], []) : m = this.callFunction(a, [i, o], []), [m];
    } else
      return e;
  }
  /**
   * Handle a subscript or superscript with nice errors.
   */
  handleSupSubscript(e) {
    var t = this.fetch(), a = t.text;
    this.consume(), this.consumeSpaces();
    var n = this.parseGroup(e);
    if (!n)
      throw new L("Expected group after '" + a + "'", t);
    return n;
  }
  /**
   * Converts the textual input of an unsupported command into a text node
   * contained within a color node whose color is determined by errorColor
   */
  formatUnsupportedCmd(e) {
    for (var t = [], a = 0; a < e.length; a++)
      t.push({
        type: "textord",
        mode: "text",
        text: e[a]
      });
    var n = {
      type: "text",
      mode: this.mode,
      body: t
    }, i = {
      type: "color",
      mode: this.mode,
      color: this.settings.errorColor,
      body: [n]
    };
    return i;
  }
  /**
   * Parses a group with optional super/subscripts.
   */
  parseAtom(e) {
    var t = this.parseGroup("atom", e);
    if (this.mode === "text")
      return t;
    for (var a, n; ; ) {
      this.consumeSpaces();
      var i = this.fetch();
      if (i.text === "\\limits" || i.text === "\\nolimits") {
        if (t && t.type === "op") {
          var o = i.text === "\\limits";
          t.limits = o, t.alwaysHandleSupSub = true;
        } else if (t && t.type === "operatorname")
          t.alwaysHandleSupSub && (t.limits = i.text === "\\limits");
        else
          throw new L("Limit controls must follow a math operator", i);
        this.consume();
      } else if (i.text === "^") {
        if (a)
          throw new L("Double superscript", i);
        a = this.handleSupSubscript("superscript");
      } else if (i.text === "_") {
        if (n)
          throw new L("Double subscript", i);
        n = this.handleSupSubscript("subscript");
      } else if (i.text === "'") {
        if (a)
          throw new L("Double superscript", i);
        var u = {
          type: "textord",
          mode: this.mode,
          text: "\\prime"
        }, c = [u];
        for (this.consume(); this.fetch().text === "'"; )
          c.push(u), this.consume();
        this.fetch().text === "^" && c.push(this.handleSupSubscript("superscript")), a = {
          type: "ordgroup",
          mode: this.mode,
          body: c
        };
      } else if (J0[i.text]) {
        var m = J0[i.text], p = Zr.test(i.text);
        for (this.consume(); ; ) {
          var v = this.fetch().text;
          if (!J0[v] || Zr.test(v) !== p)
            break;
          this.consume(), m += J0[v];
        }
        var k = new O0(m, this.settings).parse();
        p ? n = {
          type: "ordgroup",
          mode: "math",
          body: k
        } : a = {
          type: "ordgroup",
          mode: "math",
          body: k
        };
      } else
        break;
    }
    return a || n ? {
      type: "supsub",
      mode: this.mode,
      base: t,
      sup: a,
      sub: n
    } : t;
  }
  /**
   * Parses an entire function, including its base and all of its arguments.
   */
  parseFunction(e, t) {
    var a = this.fetch(), n = a.text, i = d0[n];
    if (!i)
      return null;
    if (this.consume(), t && t !== "atom" && !i.allowedInArgument)
      throw new L("Got function '" + n + "' with no arguments" + (t ? " as " + t : ""), a);
    if (this.mode === "text" && !i.allowedInText)
      throw new L("Can't use function '" + n + "' in text mode", a);
    if (this.mode === "math" && i.allowedInMath === false)
      throw new L("Can't use function '" + n + "' in math mode", a);
    var {
      args: o,
      optArgs: u
    } = this.parseArguments(n, i);
    return this.callFunction(n, o, u, a, e);
  }
  /**
   * Call a function handler with a suitable context and arguments.
   */
  callFunction(e, t, a, n, i) {
    var o = {
      funcName: e,
      parser: this,
      token: n,
      breakOnTokenText: i
    }, u = d0[e];
    if (u && u.handler)
      return u.handler(o, t, a);
    throw new L("No function handler for " + e);
  }
  /**
   * Parses the arguments of a function or environment
   */
  parseArguments(e, t) {
    var a = t.numArgs + t.numOptionalArgs;
    if (a === 0)
      return {
        args: [],
        optArgs: []
      };
    for (var n = [], i = [], o = 0; o < a; o++) {
      var u = t.argTypes && t.argTypes[o], c = o < t.numOptionalArgs;
      (t.primitive && u == null || // \sqrt expands into primitive if optional argument doesn't exist
      t.type === "sqrt" && o === 1 && i[0] == null) && (u = "primitive");
      var m = this.parseGroupOfType("argument to '" + e + "'", u, c);
      if (c)
        i.push(m);
      else if (m != null)
        n.push(m);
      else
        throw new L("Null argument, please report this as a bug");
    }
    return {
      args: n,
      optArgs: i
    };
  }
  /**
   * Parses a group when the mode is changing.
   */
  parseGroupOfType(e, t, a) {
    switch (t) {
      case "color":
        return this.parseColorGroup(a);
      case "size":
        return this.parseSizeGroup(a);
      case "url":
        return this.parseUrlGroup(a);
      case "math":
      case "text":
        return this.parseArgumentGroup(a, t);
      case "hbox": {
        var n = this.parseArgumentGroup(a, "text");
        return n != null ? {
          type: "styling",
          mode: n.mode,
          body: [n],
          style: "text"
          // simulate \textstyle
        } : null;
      }
      case "raw": {
        var i = this.parseStringGroup("raw", a);
        return i != null ? {
          type: "raw",
          mode: "text",
          string: i.text
        } : null;
      }
      case "primitive": {
        if (a)
          throw new L("A primitive argument cannot be optional");
        var o = this.parseGroup(e);
        if (o == null)
          throw new L("Expected group as " + e, this.fetch());
        return o;
      }
      case "original":
      case null:
      case void 0:
        return this.parseArgumentGroup(a);
      default:
        throw new L("Unknown group type as " + e, this.fetch());
    }
  }
  /**
   * Discard any space tokens, fetching the next non-space token.
   */
  consumeSpaces() {
    for (; this.fetch().text === " "; )
      this.consume();
  }
  /**
   * Parses a group, essentially returning the string formed by the
   * brace-enclosed tokens plus some position information.
   */
  parseStringGroup(e, t) {
    var a = this.gullet.scanArgument(t);
    if (a == null)
      return null;
    for (var n = "", i; (i = this.fetch()).text !== "EOF"; )
      n += i.text, this.consume();
    return this.consume(), a.text = n, a;
  }
  /**
   * Parses a regex-delimited group: the largest sequence of tokens
   * whose concatenated strings match `regex`. Returns the string
   * formed by the tokens plus some position information.
   */
  parseRegexGroup(e, t) {
    for (var a = this.fetch(), n = a, i = "", o; (o = this.fetch()).text !== "EOF" && e.test(i + o.text); )
      n = o, i += n.text, this.consume();
    if (i === "")
      throw new L("Invalid " + t + ": '" + a.text + "'", a);
    return a.range(n, i);
  }
  /**
   * Parses a color description.
   */
  parseColorGroup(e) {
    var t = this.parseStringGroup("color", e);
    if (t == null)
      return null;
    var a = /^(#[a-f0-9]{3}|#?[a-f0-9]{6}|[a-z]+)$/i.exec(t.text);
    if (!a)
      throw new L("Invalid color: '" + t.text + "'", t);
    var n = a[0];
    return /^[0-9a-f]{6}$/i.test(n) && (n = "#" + n), {
      type: "color-token",
      mode: this.mode,
      color: n
    };
  }
  /**
   * Parses a size specification, consisting of magnitude and unit.
   */
  parseSizeGroup(e) {
    var t, a = false;
    if (this.gullet.consumeSpaces(), !e && this.gullet.future().text !== "{" ? t = this.parseRegexGroup(/^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size") : t = this.parseStringGroup("size", e), !t)
      return null;
    !e && t.text.length === 0 && (t.text = "0pt", a = true);
    var n = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(t.text);
    if (!n)
      throw new L("Invalid size: '" + t.text + "'", t);
    var i = {
      number: +(n[1] + n[2]),
      // sign + magnitude, cast to number
      unit: n[3]
    };
    if (!ma(i))
      throw new L("Invalid unit: '" + i.unit + "'", t);
    return {
      type: "size",
      mode: this.mode,
      value: i,
      isBlank: a
    };
  }
  /**
   * Parses an URL, checking escaped letters and allowed protocols,
   * and setting the catcode of % as an active character (as in \hyperref).
   */
  parseUrlGroup(e) {
    this.gullet.lexer.setCatcode("%", 13), this.gullet.lexer.setCatcode("~", 12);
    var t = this.parseStringGroup("url", e);
    if (this.gullet.lexer.setCatcode("%", 14), this.gullet.lexer.setCatcode("~", 13), t == null)
      return null;
    var a = t.text.replace(/\\([#$%&~_^{}])/g, "$1");
    return {
      type: "url",
      mode: this.mode,
      url: a
    };
  }
  /**
   * Parses an argument with the mode specified.
   */
  parseArgumentGroup(e, t) {
    var a = this.gullet.scanArgument(e);
    if (a == null)
      return null;
    var n = this.mode;
    t && this.switchMode(t), this.gullet.beginGroup();
    var i = this.parseExpression(false, "EOF");
    this.expect("EOF"), this.gullet.endGroup();
    var o = {
      type: "ordgroup",
      mode: this.mode,
      loc: a.loc,
      body: i
    };
    return t && this.switchMode(n), o;
  }
  /**
   * Parses an ordinary group, which is either a single nucleus (like "x")
   * or an expression in braces (like "{x+y}") or an implicit group, a group
   * that starts at the current position, and ends right before a higher explicit
   * group ends, or at EOF.
   */
  parseGroup(e, t) {
    var a = this.fetch(), n = a.text, i;
    if (n === "{" || n === "\\begingroup") {
      this.consume();
      var o = n === "{" ? "}" : "\\endgroup";
      this.gullet.beginGroup();
      var u = this.parseExpression(false, o), c = this.fetch();
      this.expect(o), this.gullet.endGroup(), i = {
        type: "ordgroup",
        mode: this.mode,
        loc: Ie.range(a, c),
        body: u,
        // A group formed by \begingroup...\endgroup is a semi-simple group
        // which doesn't affect spacing in math mode, i.e., is transparent.
        // https://tex.stackexchange.com/questions/1930/when-should-one-
        // use-begingroup-instead-of-bgroup
        semisimple: n === "\\begingroup" || void 0
      };
    } else if (i = this.parseFunction(t, e) || this.parseSymbol(), i == null && n[0] === "\\" && !an.hasOwnProperty(n)) {
      if (this.settings.throwOnError)
        throw new L("Undefined control sequence: " + n, a);
      i = this.formatUnsupportedCmd(n), this.consume();
    }
    return i;
  }
  /**
   * Form ligature-like combinations of characters for text mode.
   * This includes inputs like "--", "---", "``" and "''".
   * The result will simply replace multiple textord nodes with a single
   * character in each value by a single textord node having multiple
   * characters in its value.  The representation is still ASCII source.
   * The group will be modified in place.
   */
  formLigatures(e) {
    for (var t = e.length - 1, a = 0; a < t; ++a) {
      var n = e[a], i = n.text;
      i === "-" && e[a + 1].text === "-" && (a + 1 < t && e[a + 2].text === "-" ? (e.splice(a, 3, {
        type: "textord",
        mode: "text",
        loc: Ie.range(n, e[a + 2]),
        text: "---"
      }), t -= 2) : (e.splice(a, 2, {
        type: "textord",
        mode: "text",
        loc: Ie.range(n, e[a + 1]),
        text: "--"
      }), t -= 1)), (i === "'" || i === "`") && e[a + 1].text === i && (e.splice(a, 2, {
        type: "textord",
        mode: "text",
        loc: Ie.range(n, e[a + 1]),
        text: i + i
      }), t -= 1);
    }
  }
  /**
   * Parse a single symbol out of the string. Here, we handle single character
   * symbols and special functions like \verb.
   */
  parseSymbol() {
    var e = this.fetch(), t = e.text;
    if (/^\\verb[^a-zA-Z]/.test(t)) {
      this.consume();
      var a = t.slice(5), n = a.charAt(0) === "*";
      if (n && (a = a.slice(1)), a.length < 2 || a.charAt(0) !== a.slice(-1))
        throw new L(`\\verb assertion failed --
                    please report what input caused this bug`);
      return a = a.slice(1, -1), {
        type: "verb",
        mode: "text",
        body: a,
        star: n
      };
    }
    Kr.hasOwnProperty(t[0]) && !se[this.mode][t[0]] && (this.settings.strict && this.mode === "math" && this.settings.reportNonstrict("unicodeTextInMathMode", 'Accented Unicode text character "' + t[0] + '" used in math mode', e), t = Kr[t[0]] + t.substr(1));
    var i = cs.exec(t);
    i && (t = t.substring(0, i.index), t === "i" ? t = "ı" : t === "j" && (t = "ȷ"));
    var o;
    if (se[this.mode][t]) {
      this.settings.strict && this.mode === "math" && Ft.indexOf(t) >= 0 && this.settings.reportNonstrict("unicodeTextInMathMode", 'Latin-1/Unicode text character "' + t[0] + '" used in math mode', e);
      var u = se[this.mode][t].group, c = Ie.range(e), m;
      if (ri.hasOwnProperty(u)) {
        var p = u;
        m = {
          type: "atom",
          mode: this.mode,
          family: p,
          loc: c,
          text: t
        };
      } else
        m = {
          type: u,
          mode: this.mode,
          loc: c,
          text: t
        };
      o = m;
    } else if (t.charCodeAt(0) >= 128)
      this.settings.strict && (ha(t.charCodeAt(0)) ? this.mode === "math" && this.settings.reportNonstrict("unicodeTextInMathMode", 'Unicode text character "' + t[0] + '" used in math mode', e) : this.settings.reportNonstrict("unknownSymbol", 'Unrecognized Unicode character "' + t[0] + '"' + (" (" + t.charCodeAt(0) + ")"), e)), o = {
        type: "textord",
        mode: "text",
        loc: Ie.range(e),
        text: t
      };
    else
      return null;
    if (this.consume(), i)
      for (var v = 0; v < i[0].length; v++) {
        var k = i[0][v];
        if (!Dt[k])
          throw new L("Unknown accent ' " + k + "'", e);
        var S = Dt[k][this.mode] || Dt[k].text;
        if (!S)
          throw new L("Accent " + k + " unsupported in " + this.mode + " mode", e);
        o = {
          type: "accent",
          mode: this.mode,
          loc: Ie.range(e),
          label: S,
          isStretchy: false,
          isShifty: true,
          // $FlowFixMe
          base: o
        };
      }
    return o;
  }
}
O0.endOfExpression = ["}", "\\endgroup", "\\end", "\\right", "&"];
var hr = function(e, t) {
  if (!(typeof e == "string" || e instanceof String))
    throw new TypeError("KaTeX can only parse string typed expression");
  var a = new O0(e, t);
  delete a.gullet.macros.current["\\df@tag"];
  var n = a.parse();
  if (delete a.gullet.macros.current["\\current@color"], delete a.gullet.macros.current["\\color"], a.gullet.macros.get("\\df@tag")) {
    if (!t.displayMode)
      throw new L("\\tag works only in display equations");
    n = [{
      type: "tag",
      mode: "text",
      body: n,
      tag: a.subparse([new qe("\\df@tag")])
    }];
  }
  return n;
}, nn = function(e, t, a) {
  t.textContent = "";
  var n = mr(e, a).toNode();
  t.appendChild(n);
};
var fs = function(e, t) {
  var a = mr(e, t).toMarkup();
  return a;
}, gs = function(e, t) {
  var a = new Yt(t);
  return hr(e, a);
}, sn = function(e, t, a) {
  if (a.throwOnError || !(e instanceof L))
    throw e;
  var n = A.makeSpan(["katex-error"], [new Ge(t)]);
  return n.setAttribute("title", e.toString()), n.setAttribute("style", "color:" + a.errorColor), n;
}, mr = function(e, t) {
  var a = new Yt(t);
  try {
    var n = hr(e, a);
    return Ti(n, e, a);
  } catch (i) {
    return sn(i, e, a);
  }
}, vs = function(e, t) {
  var a = new Yt(t);
  try {
    var n = hr(e, a);
    return _i(n, e, a);
  } catch (i) {
    return sn(i, e, a);
  }
}, bs = {
  /**
   * Current KaTeX version
   */
  version: "0.15.6",
  /**
   * Renders the given LaTeX into an HTML+MathML combination, and adds
   * it as a child to the specified DOM node.
   */
  render: nn,
  /**
   * Renders the given LaTeX into an HTML+MathML combination string,
   * for sending to the client.
   */
  renderToString: fs,
  /**
   * KaTeX error, usually during parsing.
   */
  ParseError: L,
  /**
   * The shema of Settings
   */
  SETTINGS_SCHEMA: Q0,
  /**
   * Parses the given LaTeX into KaTeX's internal parse tree structure,
   * without rendering to HTML or MathML.
   *
   * NOTE: This method is not currently recommended for public use.
   * The internal tree representation is unstable and is very likely
   * to change. Use at your own risk.
   */
  __parse: gs,
  /**
   * Renders the given LaTeX into an HTML+MathML internal DOM tree
   * representation, without flattening that representation to a string.
   *
   * NOTE: This method is not currently recommended for public use.
   * The internal tree representation is unstable and is very likely
   * to change. Use at your own risk.
   */
  __renderToDomTree: mr,
  /**
   * Renders the given LaTeX into an HTML internal DOM tree representation,
   * without MathML and without flattening that representation to a string.
   *
   * NOTE: This method is not currently recommended for public use.
   * The internal tree representation is unstable and is very likely
   * to change. Use at your own risk.
   */
  __renderToHTMLTree: vs,
  /**
   * extends internal font metrics object with a new object
   * each key in the new object represents a font name
  */
  __setFontMetrics: Xn,
  /**
   * adds a new symbol to builtin symbols table
   */
  __defineSymbol: s,
  /**
   * adds a new macro to builtin macro list
   */
  __defineMacro: h,
  /**
   * Expose the dom tree node types, which can be useful for type checking nodes.
   *
   * NOTE: This method is not currently recommended for public use.
   * The internal tree representation is unstable and is very likely
   * to change. Use at your own risk.
   */
  __domTree: {
    Span: F0,
    Anchor: Zt,
    SymbolNode: Ge,
    SvgNode: m0,
    PathNode: w0,
    LineNode: $t
  }
};
const ys = ["innerHTML"], ws = {
  name: "Katex"
}, ln = /* @__PURE__ */ defineComponent({
  ...ws,
  props: {
    expression: {
      type: String,
      required: true
    }
  },
  setup(r4) {
    const e = r4, t = computed(() => bs.renderToString(e.expression));
    return (a, n) => (openBlock(), createElementBlock("span", { innerHTML: t.value }, null, 8, ys));
  }
}), xs = ["target", "href"], ks = ["target", "href"], Ss = ["target", "href"], As = { key: 5 }, Ts = {
  key: 7,
  class: "notion-inline-code"
}, _s = { key: 8 }, Es = { key: 9 }, Ms = { key: 10 }, zs = {
  key: 11,
  class: "notion-underline"
}, Ns = {
  key: 13,
  class: "notion-inline-code"
}, Cs = {
  name: "NotionDecorator"
}, Ds = /* @__PURE__ */ defineComponent({
  ...Cs,
  props: {
    content: Object,
    ...oe
  },
  setup(r4) {
    const e = r4, { props: t, pass: a, type: n, hasPageLinkOptions: i, pageLinkProps: o } = ue(e), u = computed(() => {
      var _a2;
      return (_a2 = e.content) == null ? void 0 : _a2[0];
    }), c = computed(() => {
      var _a2;
      return ((_a2 = e.content) == null ? void 0 : _a2[1]) || [];
    }), m = computed(() => {
      var _a2, _b;
      return (_b = (_a2 = c.value) == null ? void 0 : _a2[0]) == null ? void 0 : _b[0];
    }), p = computed(() => {
      var _a2, _b;
      return (_b = (_a2 = c.value) == null ? void 0 : _a2[0]) == null ? void 0 : _b[1];
    }), v = computed(() => {
      const M = JSON.parse(JSON.stringify(c.value || []));
      return M.shift(), M;
    }), k = computed(() => [u.value, v.value]), S = computed(() => u.value === "‣"), z = computed(() => {
      var _a2;
      return ((_a2 = p.value) == null ? void 0 : _a2[0]) === "/";
    }), T = computed(
      () => {
        var _a2, _b, _c, _d, _e, _f;
        return ((_f = (_e = (_d = (_c = (_b = (_a2 = t.blockMap) == null ? void 0 : _a2[p.value]) == null ? void 0 : _b.value) == null ? void 0 : _c.properties) == null ? void 0 : _d.title) == null ? void 0 : _e[0]) == null ? void 0 : _f[0]) || "link";
      }
    ), _ = computed(() => n.value === "page" ? t.pageLinkTarget : t.textLinkTarget);
    return (M, b) => {
      var _a2, _b;
      const y = resolveComponent("NotionDecorator");
      return S.value && unref(i) ? (openBlock(), createBlock(resolveDynamicComponent((_a2 = unref(t).pageLinkOptions) == null ? void 0 : _a2.component), mergeProps({
        key: 0,
        class: "notion-link"
      }, unref(o)(p.value)), {
        default: withCtx(() => [
          createTextVNode(toDisplayString(T.value), 1)
        ]),
        _: 1
      }, 16)) : S.value ? (openBlock(), createElementBlock("a", {
        key: 1,
        class: "notion-link",
        target: unref(t).pageLinkTarget,
        href: unref(t).mapPageUrl(p.value)
      }, toDisplayString(T.value), 9, xs)) : m.value === "a" && unref(i) && z.value ? (openBlock(), createBlock(resolveDynamicComponent((_b = unref(t).pageLinkOptions) == null ? void 0 : _b.component), mergeProps({
        key: 2,
        class: "notion-link"
      }, unref(o)(p.value.slice(1))), {
        default: withCtx(() => [
          createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
        ]),
        _: 1
      }, 16)) : m.value === "a" && z.value ? (openBlock(), createElementBlock("a", {
        key: 3,
        class: "notion-link",
        target: _.value,
        href: unref(t).mapPageUrl(p.value.slice(1))
      }, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ], 8, ks)) : m.value === "a" ? (openBlock(), createElementBlock("a", {
        key: 4,
        class: "notion-link",
        target: _.value,
        href: p.value
      }, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ], 8, Ss)) : c.value.length === 0 ? (openBlock(), createElementBlock("span", As, toDisplayString(u.value), 1)) : m.value === "h" ? (openBlock(), createElementBlock("span", {
        key: 6,
        class: normalizeClass("notion-" + p.value)
      }, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ], 2)) : m.value === "c" ? (openBlock(), createElementBlock("code", Ts, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ])) : m.value === "b" ? (openBlock(), createElementBlock("b", _s, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ])) : m.value === "i" ? (openBlock(), createElementBlock("em", Es, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ])) : m.value === "s" ? (openBlock(), createElementBlock("s", Ms, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ])) : m.value === "_" ? (openBlock(), createElementBlock("u", zs, [
        createVNode(y, mergeProps({ content: k.value }, unref(a)), null, 16, ["content"])
      ])) : m.value === "e" && unref(t).katex ? (openBlock(), createBlock(ln, {
        key: 12,
        expression: p.value
      }, null, 8, ["expression"])) : m.value === "e" ? (openBlock(), createElementBlock("code", Ns, toDisplayString(p.value), 1)) : (openBlock(), createBlock(y, mergeProps({
        key: 14,
        content: k.value
      }, unref(a)), null, 16, ["content"]));
    };
  }
}), Rs = {
  name: "NotionTextRenderer"
}, we = /* @__PURE__ */ defineComponent({
  ...Rs,
  props: { text: Object, ...oe },
  setup(r4) {
    const e = r4, { pass: t } = ue(e);
    return (n, i) => (openBlock(), createElementBlock("span", null, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(r4.text, (o, u) => (openBlock(), createBlock(Ds, mergeProps({
        key: u,
        content: o,
        ref_for: true
      }, unref(t)), null, 16, ["content"]))), 128))
    ]));
  }
}), Is = { class: "notion-row" }, Bs = ["href"], Os = { class: "notion-bookmark-title" }, Ls = {
  key: 0,
  class: "notion-bookmark-description"
}, $s = { class: "notion-bookmark-link" }, Fs = ["alt", "src"], Ps = {
  key: 0,
  class: "notion-bookmark-image"
}, qs = ["alt", "src"], Hs = {
  name: "NotionBookmark"
}, Gs = /* @__PURE__ */ defineComponent({
  ...Hs,
  props: { ...oe },
  setup(r4) {
    const e = r4, { f: t, properties: a, title: n, description: i, pass: o } = ue(e);
    return (u, c) => (openBlock(), createElementBlock("div", Is, [
      createElementVNode("a", {
        target: "_blank",
        rel: "noopener noreferrer",
        class: normalizeClass(["notion-bookmark", unref(t).block_color && `notion-${unref(t).block_color}`]),
        href: unref(a).link[0][0]
      }, [
        createElementVNode("div", null, [
          createElementVNode("div", Os, [
            createVNode(we, mergeProps({
              text: unref(n) || unref(a).link
            }, unref(o)), null, 16, ["text"])
          ]),
          unref(i) ? (openBlock(), createElementBlock("div", Ls, [
            createVNode(we, mergeProps({ text: unref(i) }, unref(o)), null, 16, ["text"])
          ])) : createCommentVNode("", true),
          createElementVNode("div", $s, [
            unref(t).bookmark_icon ? (openBlock(), createElementBlock("img", {
              key: 0,
              alt: unref(rt)(unref(n) || unref(a).link),
              src: unref(t).bookmark_icon
            }, null, 8, Fs)) : createCommentVNode("", true),
            createElementVNode("div", null, [
              createVNode(we, mergeProps({
                text: unref(a).link
              }, unref(o)), null, 16, ["text"])
            ])
          ])
        ]),
        unref(t).bookmark_cover ? (openBlock(), createElementBlock("div", Ps, [
          createElementVNode("img", {
            alt: unref(rt)(unref(n) || unref(a).link),
            src: unref(t).bookmark_cover
          }, null, 8, qs)
        ])) : createCommentVNode("", true)
      ], 10, Bs)
    ]));
  }
}), pr = (r4, e) => {
  const t = r4.__vccOpts || r4;
  for (const [a, n] of e)
    t[a] = n;
  return t;
}, Us = {}, Vs = {
  viewBox: "0 0 30 30",
  width: "20"
};
function js(r4, e) {
  return openBlock(), createElementBlock("svg", Vs, e[0] || (e[0] = [
    createElementVNode("path", { d: "M16,1H4v28h22V11L16,1z M16,3.828L23.172,11H16V3.828z M24,27H6V3h8v10h10V27z M8,17h14v-2H8V17z M8,21h14v-2H8V21z M8,25h14v-2H8V25z" }, null, -1)
  ]));
}
const Ys = /* @__PURE__ */ pr(Us, [["render", js]]), Ws = ["src", "alt"], Xs = ["aria-label"], Zs = {
  name: "NotionPageIcon"
}, tt = /* @__PURE__ */ defineComponent({
  ...Zs,
  props: { big: Boolean, ...oe },
  setup(r4) {
    const e = r4, { icon: t, format: a, block: n, title: i } = ue(e);
    return (o, u) => {
      var _a2, _b;
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([((_a2 = unref(a)) == null ? void 0 : _a2.page_cover) && "notion-page-icon-offset", r4.big ? "notion-page-icon-cover" : "notion-page-icon"])
      }, [
        ((_b = unref(t)) == null ? void 0 : _b.includes("http")) ? (openBlock(), createElementBlock("img", {
          key: 0,
          src: e.mapImageUrl(unref(t), unref(n)),
          alt: unref(i) ? unref(rt)(unref(i)) : "Icon",
          class: "notion-page-icon"
        }, null, 8, Ws)) : unref(t) ? (openBlock(), createElementBlock("span", {
          key: 1,
          role: "img",
          "aria-label": unref(t),
          class: "notion-page-icon"
        }, toDisplayString(unref(t)), 9, Xs)) : r4.big ? createCommentVNode("", true) : (openBlock(), createBlock(Ys, {
          key: 2,
          class: "notion-page-icon"
        }))
      ], 2);
    };
  }
}), Ks = { style: { "font-size": "12px" } }, Js = { class: "notion-callout-text" }, Qs = {
  name: "NotionCallout"
}, el = /* @__PURE__ */ defineComponent({
  ...Qs,
  props: { ...oe },
  setup(r4) {
    const e = r4, { pass: t, title: a, blockColorClass: n, block: i } = ue(e);
    return (o, u) => (openBlock(), createElementBlock("div", {
      class: normalizeClass(["notion-callout", unref(n)()])
    }, [
      createElementVNode("div", Ks, [
        createVNode(tt, normalizeProps(guardReactiveProps(unref(t))), null, 16)
      ]),
      createElementVNode("div", Js, [
        unref(i).value.content ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(unref(i).value.content, (c, m) => (openBlock(), createBlock(ft, mergeProps({ ref_for: true }, unref(t), {
          key: c,
          level: unref(t).level + 1,
          "content-id": c,
          "content-index": m
        }), null, 16, ["level", "content-id", "content-index"]))), 128)) : (openBlock(), createBlock(we, mergeProps({
          key: 1,
          text: unref(a)
        }, unref(t)), null, 16, ["text"]))
      ])
    ], 2));
  }
}), tl = {
  name: "NotionColumn"
}, rl = /* @__PURE__ */ defineComponent({
  ...tl,
  props: {
    format: { type: Object, required: true }
  },
  setup(r4) {
    const t = r4, a = computed(() => ({
      width: `calc((100% - ${(Number((1 / t.format.column_ratio).toFixed(0)) - 1) * 46}px) * ${t.format.column_ratio})`
    })), n = computed(() => ({ width: "46px" }));
    return (i, o) => (openBlock(), createElementBlock(Fragment, null, [
      createElementVNode("div", {
        class: "notion-column",
        style: normalizeStyle(a.value)
      }, [
        renderSlot(i.$slots, "default")
      ], 4),
      createElementVNode("div", {
        class: "notion-spacer",
        style: normalizeStyle(n.value)
      }, null, 4)
    ], 64));
  }
});
var Jr = typeof globalThis < "u" ? globalThis : typeof global < "u" ? global : typeof self < "u" ? self : {};
function al(r4) {
  return r4 && r4.__esModule && Object.prototype.hasOwnProperty.call(r4, "default") ? r4.default : r4;
}
var on = { exports: {} };
(function(r4) {
  var e = typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope ? self : {};
  /**
   * Prism: Lightweight, robust, elegant syntax highlighting
   *
   * @license MIT <https://opensource.org/licenses/MIT>
   * @author Lea Verou <https://lea.verou.me>
   * @namespace
   * @public
   */
  var t = function(a) {
    var n = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i, i = 0, o = {}, u = {
      /**
       * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
       * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
       * additional languages or plugins yourself.
       *
       * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
       *
       * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
       * empty Prism object into the global scope before loading the Prism script like this:
       *
       * ```js
       * window.Prism = window.Prism || {};
       * Prism.manual = true;
       * // add a new <script> to load Prism's script
       * ```
       *
       * @default false
       * @type {boolean}
       * @memberof Prism
       * @public
       */
      manual: a.Prism && a.Prism.manual,
      /**
       * By default, if Prism is in a web worker, it assumes that it is in a worker it created itself, so it uses
       * `addEventListener` to communicate with its parent instance. However, if you're using Prism manually in your
       * own worker, you don't want it to do this.
       *
       * By setting this value to `true`, Prism will not add its own listeners to the worker.
       *
       * You obviously have to change this value before Prism executes. To do this, you can add an
       * empty Prism object into the global scope before loading the Prism script like this:
       *
       * ```js
       * window.Prism = window.Prism || {};
       * Prism.disableWorkerMessageHandler = true;
       * // Load Prism's script
       * ```
       *
       * @default false
       * @type {boolean}
       * @memberof Prism
       * @public
       */
      disableWorkerMessageHandler: a.Prism && a.Prism.disableWorkerMessageHandler,
      /**
       * A namespace for utility methods.
       *
       * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
       * change or disappear at any time.
       *
       * @namespace
       * @memberof Prism
       */
      util: {
        encode: function b(y) {
          return y instanceof c ? new c(y.type, b(y.content), y.alias) : Array.isArray(y) ? y.map(b) : y.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
        },
        /**
         * Returns the name of the type of the given value.
         *
         * @param {any} o
         * @returns {string}
         * @example
         * type(null)      === 'Null'
         * type(undefined) === 'Undefined'
         * type(123)       === 'Number'
         * type('foo')     === 'String'
         * type(true)      === 'Boolean'
         * type([1, 2])    === 'Array'
         * type({})        === 'Object'
         * type(String)    === 'Function'
         * type(/abc+/)    === 'RegExp'
         */
        type: function(b) {
          return Object.prototype.toString.call(b).slice(8, -1);
        },
        /**
         * Returns a unique number for the given object. Later calls will still return the same number.
         *
         * @param {Object} obj
         * @returns {number}
         */
        objId: function(b) {
          return b.__id || Object.defineProperty(b, "__id", { value: ++i }), b.__id;
        },
        /**
         * Creates a deep clone of the given object.
         *
         * The main intended use of this function is to clone language definitions.
         *
         * @param {T} o
         * @param {Record<number, any>} [visited]
         * @returns {T}
         * @template T
         */
        clone: function b(y, E) {
          E = E || {};
          var N, C;
          switch (u.util.type(y)) {
            case "Object":
              if (C = u.util.objId(y), E[C])
                return E[C];
              N = /** @type {Record<string, any>} */
              {}, E[C] = N;
              for (var I in y)
                y.hasOwnProperty(I) && (N[I] = b(y[I], E));
              return (
                /** @type {any} */
                N
              );
            case "Array":
              return C = u.util.objId(y), E[C] ? E[C] : (N = [], E[C] = N, /** @type {Array} */
              /** @type {any} */
              y.forEach(function(F, O) {
                N[O] = b(F, E);
              }), /** @type {any} */
              N);
            default:
              return y;
          }
        },
        /**
         * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
         *
         * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
         *
         * @param {Element} element
         * @returns {string}
         */
        getLanguage: function(b) {
          for (; b; ) {
            var y = n.exec(b.className);
            if (y)
              return y[1].toLowerCase();
            b = b.parentElement;
          }
          return "none";
        },
        /**
         * Sets the Prism `language-xxxx` class of the given element.
         *
         * @param {Element} element
         * @param {string} language
         * @returns {void}
         */
        setLanguage: function(b, y) {
          b.className = b.className.replace(RegExp(n, "gi"), ""), b.classList.add("language-" + y);
        },
        /**
         * Returns the script element that is currently executing.
         *
         * This does __not__ work for line script element.
         *
         * @returns {HTMLScriptElement | null}
         */
        currentScript: function() {
          return null;
        },
        /**
         * Returns whether a given class is active for `element`.
         *
         * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
         * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
         * given class is just the given class with a `no-` prefix.
         *
         * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
         * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
         * ancestors have the given class or the negated version of it, then the default activation will be returned.
         *
         * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
         * version of it, the class is considered active.
         *
         * @param {Element} element
         * @param {string} className
         * @param {boolean} [defaultActivation=false]
         * @returns {boolean}
         */
        isActive: function(b, y, E) {
          for (var N = "no-" + y; b; ) {
            var C = b.classList;
            if (C.contains(y))
              return true;
            if (C.contains(N))
              return false;
            b = b.parentElement;
          }
          return !!E;
        }
      },
      /**
       * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
       *
       * @namespace
       * @memberof Prism
       * @public
       */
      languages: {
        /**
         * The grammar for plain, unformatted text.
         */
        plain: o,
        plaintext: o,
        text: o,
        txt: o,
        /**
         * Creates a deep copy of the language with the given id and appends the given tokens.
         *
         * If a token in `redef` also appears in the copied language, then the existing token in the copied language
         * will be overwritten at its original position.
         *
         * ## Best practices
         *
         * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
         * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
         * understand the language definition because, normally, the order of tokens matters in Prism grammars.
         *
         * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
         * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
         *
         * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
         * @param {Grammar} redef The new tokens to append.
         * @returns {Grammar} The new language created.
         * @public
         * @example
         * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
         *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
         *     // at its original position
         *     'comment': { ... },
         *     // CSS doesn't have a 'color' token, so this token will be appended
         *     'color': /\b(?:red|green|blue)\b/
         * });
         */
        extend: function(b, y) {
          var E = u.util.clone(u.languages[b]);
          for (var N in y)
            E[N] = y[N];
          return E;
        },
        /**
         * Inserts tokens _before_ another token in a language definition or any other grammar.
         *
         * ## Usage
         *
         * This helper method makes it easy to modify existing languages. For example, the CSS language definition
         * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
         * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
         * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
         * this:
         *
         * ```js
         * Prism.languages.markup.style = {
         *     // token
         * };
         * ```
         *
         * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
         * before existing tokens. For the CSS example above, you would use it like this:
         *
         * ```js
         * Prism.languages.insertBefore('markup', 'cdata', {
         *     'style': {
         *         // token
         *     }
         * });
         * ```
         *
         * ## Special cases
         *
         * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
         * will be ignored.
         *
         * This behavior can be used to insert tokens after `before`:
         *
         * ```js
         * Prism.languages.insertBefore('markup', 'comment', {
         *     'comment': Prism.languages.markup.comment,
         *     // tokens after 'comment'
         * });
         * ```
         *
         * ## Limitations
         *
         * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
         * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
         * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
         * deleting properties which is necessary to insert at arbitrary positions.
         *
         * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
         * Instead, it will create a new object and replace all references to the target object with the new one. This
         * can be done without temporarily deleting properties, so the iteration order is well-defined.
         *
         * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
         * you hold the target object in a variable, then the value of the variable will not change.
         *
         * ```js
         * var oldMarkup = Prism.languages.markup;
         * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
         *
         * assert(oldMarkup !== Prism.languages.markup);
         * assert(newMarkup === Prism.languages.markup);
         * ```
         *
         * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
         * object to be modified.
         * @param {string} before The key to insert before.
         * @param {Grammar} insert An object containing the key-value pairs to be inserted.
         * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
         * object to be modified.
         *
         * Defaults to `Prism.languages`.
         * @returns {Grammar} The new grammar object.
         * @public
         */
        insertBefore: function(b, y, E, N) {
          N = N || /** @type {any} */
          u.languages;
          var C = N[b], I = {};
          for (var F in C)
            if (C.hasOwnProperty(F)) {
              if (F == y)
                for (var O in E)
                  E.hasOwnProperty(O) && (I[O] = E[O]);
              E.hasOwnProperty(F) || (I[F] = C[F]);
            }
          var Y = N[b];
          return N[b] = I, u.languages.DFS(u.languages, function(J, ce) {
            ce === Y && J != b && (this[J] = I);
          }), I;
        },
        // Traverse a language definition with Depth First Search
        DFS: function b(y, E, N, C) {
          C = C || {};
          var I = u.util.objId;
          for (var F in y)
            if (y.hasOwnProperty(F)) {
              E.call(y, F, y[F], N || F);
              var O = y[F], Y = u.util.type(O);
              Y === "Object" && !C[I(O)] ? (C[I(O)] = true, b(O, E, null, C)) : Y === "Array" && !C[I(O)] && (C[I(O)] = true, b(O, E, F, C));
            }
        }
      },
      plugins: {},
      /**
       * This is the most high-level function in Prism’s API.
       * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
       * each one of them.
       *
       * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
       *
       * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
       * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
       * @memberof Prism
       * @public
       */
      highlightAll: function(b, y) {
        u.highlightAllUnder(void 0, b, y);
      },
      /**
       * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
       * {@link Prism.highlightElement} on each one of them.
       *
       * The following hooks will be run:
       * 1. `before-highlightall`
       * 2. `before-all-elements-highlight`
       * 3. All hooks of {@link Prism.highlightElement} for each element.
       *
       * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
       * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
       * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
       * @memberof Prism
       * @public
       */
      highlightAllUnder: function(b, y, E) {
        var N = {
          callback: E,
          container: b,
          selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
        };
        u.hooks.run("before-highlightall", N), N.elements = Array.prototype.slice.apply(N.container.querySelectorAll(N.selector)), u.hooks.run("before-all-elements-highlight", N);
        for (var C = 0, I; I = N.elements[C++]; )
          u.highlightElement(I, y === true, N.callback);
      },
      /**
       * Highlights the code inside a single element.
       *
       * The following hooks will be run:
       * 1. `before-sanity-check`
       * 2. `before-highlight`
       * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
       * 4. `before-insert`
       * 5. `after-highlight`
       * 6. `complete`
       *
       * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
       * the element's language.
       *
       * @param {Element} element The element containing the code.
       * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
       * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
       * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
       * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
       *
       * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
       * asynchronous highlighting to work. You can build your own bundle on the
       * [Download page](https://prismjs.com/download.html).
       * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
       * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
       * @memberof Prism
       * @public
       */
      highlightElement: function(b, y, E) {
        var N = u.util.getLanguage(b), C = u.languages[N];
        u.util.setLanguage(b, N);
        var I = b.parentElement;
        I && I.nodeName.toLowerCase() === "pre" && u.util.setLanguage(I, N);
        var F = b.textContent, O = {
          element: b,
          language: N,
          grammar: C,
          code: F
        };
        function Y(ce) {
          O.highlightedCode = ce, u.hooks.run("before-insert", O), O.element.innerHTML = O.highlightedCode, u.hooks.run("after-highlight", O), u.hooks.run("complete", O), E && E.call(O.element);
        }
        if (u.hooks.run("before-sanity-check", O), I = O.element.parentElement, I && I.nodeName.toLowerCase() === "pre" && !I.hasAttribute("tabindex") && I.setAttribute("tabindex", "0"), !O.code) {
          u.hooks.run("complete", O), E && E.call(O.element);
          return;
        }
        if (u.hooks.run("before-highlight", O), !O.grammar) {
          Y(u.util.encode(O.code));
          return;
        }
        if (y && a.Worker) {
          var J = new Worker(u.filename);
          J.onmessage = function(ce) {
            Y(ce.data);
          }, J.postMessage(JSON.stringify({
            language: O.language,
            code: O.code,
            immediateClose: true
          }));
        } else
          Y(u.highlight(O.code, O.grammar, O.language));
      },
      /**
       * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
       * and the language definitions to use, and returns a string with the HTML produced.
       *
       * The following hooks will be run:
       * 1. `before-tokenize`
       * 2. `after-tokenize`
       * 3. `wrap`: On each {@link Token}.
       *
       * @param {string} text A string with the code to be highlighted.
       * @param {Grammar} grammar An object containing the tokens to use.
       *
       * Usually a language definition like `Prism.languages.markup`.
       * @param {string} language The name of the language definition passed to `grammar`.
       * @returns {string} The highlighted HTML.
       * @memberof Prism
       * @public
       * @example
       * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
       */
      highlight: function(b, y, E) {
        var N = {
          code: b,
          grammar: y,
          language: E
        };
        if (u.hooks.run("before-tokenize", N), !N.grammar)
          throw new Error('The language "' + N.language + '" has no grammar.');
        return N.tokens = u.tokenize(N.code, N.grammar), u.hooks.run("after-tokenize", N), c.stringify(u.util.encode(N.tokens), N.language);
      },
      /**
       * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
       * and the language definitions to use, and returns an array with the tokenized code.
       *
       * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
       *
       * This method could be useful in other contexts as well, as a very crude parser.
       *
       * @param {string} text A string with the code to be highlighted.
       * @param {Grammar} grammar An object containing the tokens to use.
       *
       * Usually a language definition like `Prism.languages.markup`.
       * @returns {TokenStream} An array of strings and tokens, a token stream.
       * @memberof Prism
       * @public
       * @example
       * let code = `var foo = 0;`;
       * let tokens = Prism.tokenize(code, Prism.languages.javascript);
       * tokens.forEach(token => {
       *     if (token instanceof Prism.Token && token.type === 'number') {
       *         console.log(`Found numeric literal: ${token.content}`);
       *     }
       * });
       */
      tokenize: function(b, y) {
        var E = y.rest;
        if (E) {
          for (var N in E)
            y[N] = E[N];
          delete y.rest;
        }
        var C = new v();
        return k(C, C.head, b), p(b, C, y, C.head, 0), z(C);
      },
      /**
       * @namespace
       * @memberof Prism
       * @public
       */
      hooks: {
        all: {},
        /**
         * Adds the given callback to the list of callbacks for the given hook.
         *
         * The callback will be invoked when the hook it is registered for is run.
         * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
         *
         * One callback function can be registered to multiple hooks and the same hook multiple times.
         *
         * @param {string} name The name of the hook.
         * @param {HookCallback} callback The callback function which is given environment variables.
         * @public
         */
        add: function(b, y) {
          var E = u.hooks.all;
          E[b] = E[b] || [], E[b].push(y);
        },
        /**
         * Runs a hook invoking all registered callbacks with the given environment variables.
         *
         * Callbacks will be invoked synchronously and in the order in which they were registered.
         *
         * @param {string} name The name of the hook.
         * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
         * @public
         */
        run: function(b, y) {
          var E = u.hooks.all[b];
          if (!(!E || !E.length))
            for (var N = 0, C; C = E[N++]; )
              C(y);
        }
      },
      Token: c
    };
    a.Prism = u;
    function c(b, y, E, N) {
      this.type = b, this.content = y, this.alias = E, this.length = (N || "").length | 0;
    }
    c.stringify = function b(y, E) {
      if (typeof y == "string")
        return y;
      if (Array.isArray(y)) {
        var N = "";
        return y.forEach(function(Y) {
          N += b(Y, E);
        }), N;
      }
      var C = {
        type: y.type,
        content: b(y.content, E),
        tag: "span",
        classes: ["token", y.type],
        attributes: {},
        language: E
      }, I = y.alias;
      I && (Array.isArray(I) ? Array.prototype.push.apply(C.classes, I) : C.classes.push(I)), u.hooks.run("wrap", C);
      var F = "";
      for (var O in C.attributes)
        F += " " + O + '="' + (C.attributes[O] || "").replace(/"/g, "&quot;") + '"';
      return "<" + C.tag + ' class="' + C.classes.join(" ") + '"' + F + ">" + C.content + "</" + C.tag + ">";
    };
    function m(b, y, E, N) {
      b.lastIndex = y;
      var C = b.exec(E);
      if (C && N && C[1]) {
        var I = C[1].length;
        C.index += I, C[0] = C[0].slice(I);
      }
      return C;
    }
    function p(b, y, E, N, C, I) {
      for (var F in E)
        if (!(!E.hasOwnProperty(F) || !E[F])) {
          var O = E[F];
          O = Array.isArray(O) ? O : [O];
          for (var Y = 0; Y < O.length; ++Y) {
            if (I && I.cause == F + "," + Y)
              return;
            var J = O[Y], ce = J.inside, xe = !!J.lookbehind, fe = !!J.greedy, Te = J.alias;
            if (fe && !J.pattern.global) {
              var ye = J.pattern.toString().match(/[imsuy]*$/)[0];
              J.pattern = RegExp(J.pattern.source, ye + "g");
            }
            for (var Le = J.pattern || J, ae = N.next, le = C; ae !== y.tail && !(I && le >= I.reach); le += ae.value.length, ae = ae.next) {
              var ke = ae.value;
              if (y.length > b.length)
                return;
              if (!(ke instanceof c)) {
                var _e = 1, he;
                if (fe) {
                  if (he = m(Le, le, b, xe), !he || he.index >= b.length)
                    break;
                  var g0 = he.index, q0 = he.index + he[0].length, Ye = le;
                  for (Ye += ae.value.length; g0 >= Ye; )
                    ae = ae.next, Ye += ae.value.length;
                  if (Ye -= ae.value.length, le = Ye, ae.value instanceof c)
                    continue;
                  for (var $e = ae; $e !== y.tail && (Ye < q0 || typeof $e.value == "string"); $e = $e.next)
                    _e++, Ye += $e.value.length;
                  _e--, ke = b.slice(le, Ye), he.index -= le;
                } else if (he = m(Le, 0, ke, xe), !he)
                  continue;
                var g0 = he.index, Ve = he[0], We = ke.slice(0, g0), v0 = ke.slice(g0 + Ve.length), o0 = le + ke.length;
                I && o0 > I.reach && (I.reach = o0);
                var S0 = ae.prev;
                We && (S0 = k(y, S0, We), le += We.length), S(y, S0, _e);
                var gt = new c(F, ce ? u.tokenize(Ve, ce) : Ve, Te, Ve);
                if (ae = k(y, S0, gt), v0 && k(y, ae, v0), _e > 1) {
                  var N0 = {
                    cause: F + "," + Y,
                    reach: o0
                  };
                  p(b, y, E, ae.prev, le, N0), I && N0.reach > I.reach && (I.reach = N0.reach);
                }
              }
            }
          }
        }
    }
    function v() {
      var b = { value: null, prev: null, next: null }, y = { value: null, prev: b, next: null };
      b.next = y, this.head = b, this.tail = y, this.length = 0;
    }
    function k(b, y, E) {
      var N = y.next, C = { value: E, prev: y, next: N };
      return y.next = C, N.prev = C, b.length++, C;
    }
    function S(b, y, E) {
      for (var N = y.next, C = 0; C < E && N !== b.tail; C++)
        N = N.next;
      y.next = N, N.prev = y, b.length -= C;
    }
    function z(b) {
      for (var y = [], E = b.head.next; E !== b.tail; )
        y.push(E.value), E = E.next;
      return y;
    }
    if (!a.document)
      return a.addEventListener && (u.disableWorkerMessageHandler || a.addEventListener("message", function(b) {
        var y = JSON.parse(b.data), E = y.language, N = y.code, C = y.immediateClose;
        a.postMessage(u.highlight(N, u.languages[E], E)), C && a.close();
      }, false)), u;
    var T = u.util.currentScript();
    T && (u.filename = T.src, T.hasAttribute("data-manual") && (u.manual = true));
    function _() {
      u.manual || u.highlightAll();
    }
    if (!u.manual) {
      var M = (void 0).readyState;
      M === "loading" || M === "interactive" && T && T.defer ? (void 0).addEventListener("DOMContentLoaded", _) : (void 0).requestAnimationFrame ? (void 0).requestAnimationFrame(_) : (void 0).setTimeout(_, 16);
    }
    return u;
  }(e);
  r4.exports && (r4.exports = t), typeof Jr < "u" && (Jr.Prism = t), t.languages.markup = {
    comment: {
      pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
      greedy: true
    },
    prolog: {
      pattern: /<\?[\s\S]+?\?>/,
      greedy: true
    },
    doctype: {
      // https://www.w3.org/TR/xml/#NT-doctypedecl
      pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
      greedy: true,
      inside: {
        "internal-subset": {
          pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
          lookbehind: true,
          greedy: true,
          inside: null
          // see below
        },
        string: {
          pattern: /"[^"]*"|'[^']*'/,
          greedy: true
        },
        punctuation: /^<!|>$|[[\]]/,
        "doctype-tag": /^DOCTYPE/i,
        name: /[^\s<>'"]+/
      }
    },
    cdata: {
      pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
      greedy: true
    },
    tag: {
      pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
      greedy: true,
      inside: {
        tag: {
          pattern: /^<\/?[^\s>\/]+/,
          inside: {
            punctuation: /^<\/?/,
            namespace: /^[^\s>\/:]+:/
          }
        },
        "special-attr": [],
        "attr-value": {
          pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
          inside: {
            punctuation: [
              {
                pattern: /^=/,
                alias: "attr-equals"
              },
              {
                pattern: /^(\s*)["']|["']$/,
                lookbehind: true
              }
            ]
          }
        },
        punctuation: /\/?>/,
        "attr-name": {
          pattern: /[^\s>\/]+/,
          inside: {
            namespace: /^[^\s>\/:]+:/
          }
        }
      }
    },
    entity: [
      {
        pattern: /&[\da-z]{1,8};/i,
        alias: "named-entity"
      },
      /&#x?[\da-f]{1,8};/i
    ]
  }, t.languages.markup.tag.inside["attr-value"].inside.entity = t.languages.markup.entity, t.languages.markup.doctype.inside["internal-subset"].inside = t.languages.markup, t.hooks.add("wrap", function(a) {
    a.type === "entity" && (a.attributes.title = a.content.replace(/&amp;/, "&"));
  }), Object.defineProperty(t.languages.markup.tag, "addInlined", {
    /**
     * Adds an inlined language to markup.
     *
     * An example of an inlined language is CSS with `<style>` tags.
     *
     * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
     * case insensitive.
     * @param {string} lang The language key.
     * @example
     * addInlined('style', 'css');
     */
    value: function(n, i) {
      var o = {};
      o["language-" + i] = {
        pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
        lookbehind: true,
        inside: t.languages[i]
      }, o.cdata = /^<!\[CDATA\[|\]\]>$/i;
      var u = {
        "included-cdata": {
          pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
          inside: o
        }
      };
      u["language-" + i] = {
        pattern: /[\s\S]+/,
        inside: t.languages[i]
      };
      var c = {};
      c[n] = {
        pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
          return n;
        }), "i"),
        lookbehind: true,
        greedy: true,
        inside: u
      }, t.languages.insertBefore("markup", "cdata", c);
    }
  }), Object.defineProperty(t.languages.markup.tag, "addAttribute", {
    /**
     * Adds an pattern to highlight languages embedded in HTML attributes.
     *
     * An example of an inlined language is CSS with `style` attributes.
     *
     * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
     * case insensitive.
     * @param {string} lang The language key.
     * @example
     * addAttribute('style', 'css');
     */
    value: function(a, n) {
      t.languages.markup.tag.inside["special-attr"].push({
        pattern: RegExp(
          /(^|["'\s])/.source + "(?:" + a + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
          "i"
        ),
        lookbehind: true,
        inside: {
          "attr-name": /^[^\s=]+/,
          "attr-value": {
            pattern: /=[\s\S]+/,
            inside: {
              value: {
                pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
                lookbehind: true,
                alias: [n, "language-" + n],
                inside: t.languages[n]
              },
              punctuation: [
                {
                  pattern: /^=/,
                  alias: "attr-equals"
                },
                /"|'/
              ]
            }
          }
        }
      });
    }
  }), t.languages.html = t.languages.markup, t.languages.mathml = t.languages.markup, t.languages.svg = t.languages.markup, t.languages.xml = t.languages.extend("markup", {}), t.languages.ssml = t.languages.xml, t.languages.atom = t.languages.xml, t.languages.rss = t.languages.xml, function(a) {
    var n = /(?:"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n])*')/;
    a.languages.css = {
      comment: /\/\*[\s\S]*?\*\//,
      atrule: {
        pattern: RegExp("@[\\w-](?:" + /[^;{\s"']|\s+(?!\s)/.source + "|" + n.source + ")*?" + /(?:;|(?=\s*\{))/.source),
        inside: {
          rule: /^@[\w-]+/,
          "selector-function-argument": {
            pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
            lookbehind: true,
            alias: "selector"
          },
          keyword: {
            pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
            lookbehind: true
          }
          // See rest below
        }
      },
      url: {
        // https://drafts.csswg.org/css-values-3/#urls
        pattern: RegExp("\\burl\\((?:" + n.source + "|" + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ")\\)", "i"),
        greedy: true,
        inside: {
          function: /^url/i,
          punctuation: /^\(|\)$/,
          string: {
            pattern: RegExp("^" + n.source + "$"),
            alias: "url"
          }
        }
      },
      selector: {
        pattern: RegExp(`(^|[{}\\s])[^{}\\s](?:[^{};"'\\s]|\\s+(?![\\s{])|` + n.source + ")*(?=\\s*\\{)"),
        lookbehind: true
      },
      string: {
        pattern: n,
        greedy: true
      },
      property: {
        pattern: /(^|[^-\w\xA0-\uFFFF])(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
        lookbehind: true
      },
      important: /!important\b/i,
      function: {
        pattern: /(^|[^-a-z0-9])[-a-z0-9]+(?=\()/i,
        lookbehind: true
      },
      punctuation: /[(){};:,]/
    }, a.languages.css.atrule.inside.rest = a.languages.css;
    var i = a.languages.markup;
    i && (i.tag.addInlined("style", "css"), i.tag.addAttribute("style", "css"));
  }(t), t.languages.clike = {
    comment: [
      {
        pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
        lookbehind: true,
        greedy: true
      },
      {
        pattern: /(^|[^\\:])\/\/.*/,
        lookbehind: true,
        greedy: true
      }
    ],
    string: {
      pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
      greedy: true
    },
    "class-name": {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new|trait)\s+|\bcatch\s+\()[\w.\\]+/i,
      lookbehind: true,
      inside: {
        punctuation: /[.\\]/
      }
    },
    keyword: /\b(?:break|catch|continue|do|else|finally|for|function|if|in|instanceof|new|null|return|throw|try|while)\b/,
    boolean: /\b(?:false|true)\b/,
    function: /\b\w+(?=\()/,
    number: /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
    operator: /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
    punctuation: /[{}[\];(),.:]/
  }, t.languages.javascript = t.languages.extend("clike", {
    "class-name": [
      t.languages.clike["class-name"],
      {
        pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,
        lookbehind: true
      }
    ],
    keyword: [
      {
        pattern: /((?:^|\})\s*)catch\b/,
        lookbehind: true
      },
      {
        pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
        lookbehind: true
      }
    ],
    // Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
    function: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
    number: {
      pattern: RegExp(
        /(^|[^\w$])/.source + "(?:" + // constant
        (/NaN|Infinity/.source + "|" + // binary integer
        /0[bB][01]+(?:_[01]+)*n?/.source + "|" + // octal integer
        /0[oO][0-7]+(?:_[0-7]+)*n?/.source + "|" + // hexadecimal integer
        /0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source + "|" + // decimal bigint
        /\d+(?:_\d+)*n/.source + "|" + // decimal number (integer or float) but no bigint
        /(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source) + ")" + /(?![\w$])/.source
      ),
      lookbehind: true
    },
    operator: /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
  }), t.languages.javascript["class-name"][0].pattern = /(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/, t.languages.insertBefore("javascript", "keyword", {
    regex: {
      pattern: RegExp(
        // lookbehind
        // eslint-disable-next-line regexp/no-dupe-characters-character-class
        /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source + // Regex pattern:
        // There are 2 regex patterns here. The RegExp set notation proposal added support for nested character
        // classes if the `v` flag is present. Unfortunately, nested CCs are both context-free and incompatible
        // with the only syntax, so we have to define 2 different regex patterns.
        /\//.source + "(?:" + /(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source + "|" + // `v` flag syntax. This supports 3 levels of nested character classes.
        /(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source + ")" + // lookahead
        /(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        "regex-source": {
          pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
          lookbehind: true,
          alias: "language-regex",
          inside: t.languages.regex
        },
        "regex-delimiter": /^\/|\/$/,
        "regex-flags": /^[a-z]+$/
      }
    },
    // This must be declared before keyword because we use "function" inside the look-forward
    "function-variable": {
      pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
      alias: "function"
    },
    parameter: [
      {
        pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
        lookbehind: true,
        inside: t.languages.javascript
      },
      {
        pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
        lookbehind: true,
        inside: t.languages.javascript
      },
      {
        pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
        lookbehind: true,
        inside: t.languages.javascript
      },
      {
        pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
        lookbehind: true,
        inside: t.languages.javascript
      }
    ],
    constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/
  }), t.languages.insertBefore("javascript", "string", {
    hashbang: {
      pattern: /^#!.*/,
      greedy: true,
      alias: "comment"
    },
    "template-string": {
      pattern: /`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,
      greedy: true,
      inside: {
        "template-punctuation": {
          pattern: /^`|`$/,
          alias: "string"
        },
        interpolation: {
          pattern: /((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,
          lookbehind: true,
          inside: {
            "interpolation-punctuation": {
              pattern: /^\$\{|\}$/,
              alias: "punctuation"
            },
            rest: t.languages.javascript
          }
        },
        string: /[\s\S]+/
      }
    },
    "string-property": {
      pattern: /((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,
      lookbehind: true,
      greedy: true,
      alias: "property"
    }
  }), t.languages.insertBefore("javascript", "operator", {
    "literal-property": {
      pattern: /((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,
      lookbehind: true,
      alias: "property"
    }
  }), t.languages.markup && (t.languages.markup.tag.addInlined("script", "javascript"), t.languages.markup.tag.addAttribute(
    /on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,
    "javascript"
  )), t.languages.js = t.languages.javascript;
})(on);
var nl = on.exports;
const Vt = /* @__PURE__ */ al(nl), il = ["innerHTML"], sl = ["innerHTML"], ll = /* @__PURE__ */ defineComponent({
  __name: "prism",
  props: {
    code: {
      type: String
    },
    inline: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: "markup"
    }
  },
  setup(r4) {
    var _a2;
    const e = useSlots(), t = r4, { inline: a, language: n } = toRefs(t), i = computed(() => `language-${n.value}`), o = e && e.default && e.default() || [], u = t.code || o && o.length && ((_a2 = o[0]) == null ? void 0 : _a2.children) ? o[0].children : "", c = computed(() => Vt == null ? void 0 : Vt.highlight(u, Vt == null ? void 0 : Vt.languages[n.value], "en"));
    return (m, p) => unref(a) ? (openBlock(), createElementBlock("div", {
      key: 0,
      class: normalizeClass(i.value),
      innerHTML: c.value
    }, null, 10, il)) : (openBlock(), createElementBlock("pre", {
      key: 1,
      class: normalizeClass(i.value)
    }, [
      createElementVNode("div", { innerHTML: c.value }, null, 8, sl)
    ], 2));
  }
});
(function(r4) {
  function e(t, a) {
    return "___" + t.toUpperCase() + a + "___";
  }
  Object.defineProperties(r4.languages["markup-templating"] = {}, {
    buildPlaceholders: {
      /**
       * Tokenize all inline templating expressions matching `placeholderPattern`.
       *
       * If `replaceFilter` is provided, only matches of `placeholderPattern` for which `replaceFilter` returns
       * `true` will be replaced.
       *
       * @param {object} env The environment of the `before-tokenize` hook.
       * @param {string} language The language id.
       * @param {RegExp} placeholderPattern The matches of this pattern will be replaced by placeholders.
       * @param {(match: string) => boolean} [replaceFilter]
       */
      value: function(t, a, n, i) {
        if (t.language === a) {
          var o = t.tokenStack = [];
          t.code = t.code.replace(n, function(u) {
            if (typeof i == "function" && !i(u))
              return u;
            for (var c = o.length, m; t.code.indexOf(m = e(a, c)) !== -1; )
              ++c;
            return o[c] = u, m;
          }), t.grammar = r4.languages.markup;
        }
      }
    },
    tokenizePlaceholders: {
      /**
       * Replace placeholders with proper tokens after tokenizing.
       *
       * @param {object} env The environment of the `after-tokenize` hook.
       * @param {string} language The language id.
       */
      value: function(t, a) {
        if (t.language !== a || !t.tokenStack)
          return;
        t.grammar = r4.languages[a];
        var n = 0, i = Object.keys(t.tokenStack);
        function o(u) {
          for (var c = 0; c < u.length && !(n >= i.length); c++) {
            var m = u[c];
            if (typeof m == "string" || m.content && typeof m.content == "string") {
              var p = i[n], v = t.tokenStack[p], k = typeof m == "string" ? m : m.content, S = e(a, p), z = k.indexOf(S);
              if (z > -1) {
                ++n;
                var T = k.substring(0, z), _ = new r4.Token(a, r4.tokenize(v, t.grammar), "language-" + a, v), M = k.substring(z + S.length), b = [];
                T && b.push.apply(b, o([T])), b.push(_), M && b.push.apply(b, o([M])), typeof m == "string" ? u.splice.apply(u, [c, 1].concat(b)) : m.content = b;
              }
            } else
              m.content && o(m.content);
          }
          return u;
        }
        o(t.tokens);
      }
    }
  });
})(Prism);
Prism.languages.markup = {
  comment: {
    pattern: /<!--(?:(?!<!--)[\s\S])*?-->/,
    greedy: true
  },
  prolog: {
    pattern: /<\?[\s\S]+?\?>/,
    greedy: true
  },
  doctype: {
    // https://www.w3.org/TR/xml/#NT-doctypedecl
    pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
    greedy: true,
    inside: {
      "internal-subset": {
        pattern: /(^[^\[]*\[)[\s\S]+(?=\]>$)/,
        lookbehind: true,
        greedy: true,
        inside: null
        // see below
      },
      string: {
        pattern: /"[^"]*"|'[^']*'/,
        greedy: true
      },
      punctuation: /^<!|>$|[[\]]/,
      "doctype-tag": /^DOCTYPE/i,
      name: /[^\s<>'"]+/
    }
  },
  cdata: {
    pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
    greedy: true
  },
  tag: {
    pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
    greedy: true,
    inside: {
      tag: {
        pattern: /^<\/?[^\s>\/]+/,
        inside: {
          punctuation: /^<\/?/,
          namespace: /^[^\s>\/:]+:/
        }
      },
      "special-attr": [],
      "attr-value": {
        pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
        inside: {
          punctuation: [
            {
              pattern: /^=/,
              alias: "attr-equals"
            },
            {
              pattern: /^(\s*)["']|["']$/,
              lookbehind: true
            }
          ]
        }
      },
      punctuation: /\/?>/,
      "attr-name": {
        pattern: /[^\s>\/]+/,
        inside: {
          namespace: /^[^\s>\/:]+:/
        }
      }
    }
  },
  entity: [
    {
      pattern: /&[\da-z]{1,8};/i,
      alias: "named-entity"
    },
    /&#x?[\da-f]{1,8};/i
  ]
};
Prism.languages.markup.tag.inside["attr-value"].inside.entity = Prism.languages.markup.entity;
Prism.languages.markup.doctype.inside["internal-subset"].inside = Prism.languages.markup;
Prism.hooks.add("wrap", function(r4) {
  r4.type === "entity" && (r4.attributes.title = r4.content.replace(/&amp;/, "&"));
});
Object.defineProperty(Prism.languages.markup.tag, "addInlined", {
  /**
   * Adds an inlined language to markup.
   *
   * An example of an inlined language is CSS with `<style>` tags.
   *
   * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
   * case insensitive.
   * @param {string} lang The language key.
   * @example
   * addInlined('style', 'css');
   */
  value: function(e, t) {
    var a = {};
    a["language-" + t] = {
      pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
      lookbehind: true,
      inside: Prism.languages[t]
    }, a.cdata = /^<!\[CDATA\[|\]\]>$/i;
    var n = {
      "included-cdata": {
        pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
        inside: a
      }
    };
    n["language-" + t] = {
      pattern: /[\s\S]+/,
      inside: Prism.languages[t]
    };
    var i = {};
    i[e] = {
      pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function() {
        return e;
      }), "i"),
      lookbehind: true,
      greedy: true,
      inside: n
    }, Prism.languages.insertBefore("markup", "cdata", i);
  }
});
Object.defineProperty(Prism.languages.markup.tag, "addAttribute", {
  /**
   * Adds an pattern to highlight languages embedded in HTML attributes.
   *
   * An example of an inlined language is CSS with `style` attributes.
   *
   * @param {string} attrName The name of the tag that contains the inlined language. This name will be treated as
   * case insensitive.
   * @param {string} lang The language key.
   * @example
   * addAttribute('style', 'css');
   */
  value: function(r4, e) {
    Prism.languages.markup.tag.inside["special-attr"].push({
      pattern: RegExp(
        /(^|["'\s])/.source + "(?:" + r4 + ")" + /\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))/.source,
        "i"
      ),
      lookbehind: true,
      inside: {
        "attr-name": /^[^\s=]+/,
        "attr-value": {
          pattern: /=[\s\S]+/,
          inside: {
            value: {
              pattern: /(^=\s*(["']|(?!["'])))\S[\s\S]*(?=\2$)/,
              lookbehind: true,
              alias: [e, "language-" + e],
              inside: Prism.languages[e]
            },
            punctuation: [
              {
                pattern: /^=/,
                alias: "attr-equals"
              },
              /"|'/
            ]
          }
        }
      }
    });
  }
});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;
Prism.languages.xml = Prism.languages.extend("markup", {});
Prism.languages.ssml = Prism.languages.xml;
Prism.languages.atom = Prism.languages.xml;
Prism.languages.rss = Prism.languages.xml;
(function(r4) {
  var e = "\\b(?:BASH|BASHOPTS|BASH_ALIASES|BASH_ARGC|BASH_ARGV|BASH_CMDS|BASH_COMPLETION_COMPAT_DIR|BASH_LINENO|BASH_REMATCH|BASH_SOURCE|BASH_VERSINFO|BASH_VERSION|COLORTERM|COLUMNS|COMP_WORDBREAKS|DBUS_SESSION_BUS_ADDRESS|DEFAULTS_PATH|DESKTOP_SESSION|DIRSTACK|DISPLAY|EUID|GDMSESSION|GDM_LANG|GNOME_KEYRING_CONTROL|GNOME_KEYRING_PID|GPG_AGENT_INFO|GROUPS|HISTCONTROL|HISTFILE|HISTFILESIZE|HISTSIZE|HOME|HOSTNAME|HOSTTYPE|IFS|INSTANCE|JOB|LANG|LANGUAGE|LC_ADDRESS|LC_ALL|LC_IDENTIFICATION|LC_MEASUREMENT|LC_MONETARY|LC_NAME|LC_NUMERIC|LC_PAPER|LC_TELEPHONE|LC_TIME|LESSCLOSE|LESSOPEN|LINES|LOGNAME|LS_COLORS|MACHTYPE|MAILCHECK|MANDATORY_PATH|NO_AT_BRIDGE|OLDPWD|OPTERR|OPTIND|ORBIT_SOCKETDIR|OSTYPE|PAPERSIZE|PATH|PIPESTATUS|PPID|PS1|PS2|PS3|PS4|PWD|RANDOM|REPLY|SECONDS|SELINUX_INIT|SESSION|SESSIONTYPE|SESSION_MANAGER|SHELL|SHELLOPTS|SHLVL|SSH_AUTH_SOCK|TERM|UID|UPSTART_EVENTS|UPSTART_INSTANCE|UPSTART_JOB|UPSTART_SESSION|USER|WINDOWID|XAUTHORITY|XDG_CONFIG_DIRS|XDG_CURRENT_DESKTOP|XDG_DATA_DIRS|XDG_GREETER_DATA_DIR|XDG_MENU_PREFIX|XDG_RUNTIME_DIR|XDG_SEAT|XDG_SEAT_PATH|XDG_SESSION_DESKTOP|XDG_SESSION_ID|XDG_SESSION_PATH|XDG_SESSION_TYPE|XDG_VTNR|XMODIFIERS)\\b", t = {
    pattern: /(^(["']?)\w+\2)[ \t]+\S.*/,
    lookbehind: true,
    alias: "punctuation",
    // this looks reasonably well in all themes
    inside: null
    // see below
  }, a = {
    bash: t,
    environment: {
      pattern: RegExp("\\$" + e),
      alias: "constant"
    },
    variable: [
      // [0]: Arithmetic Environment
      {
        pattern: /\$?\(\([\s\S]+?\)\)/,
        greedy: true,
        inside: {
          // If there is a $ sign at the beginning highlight $(( and )) as variable
          variable: [
            {
              pattern: /(^\$\(\([\s\S]+)\)\)/,
              lookbehind: true
            },
            /^\$\(\(/
          ],
          number: /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee]-?\d+)?/,
          // Operators according to https://www.gnu.org/software/bash/manual/bashref.html#Shell-Arithmetic
          operator: /--|\+\+|\*\*=?|<<=?|>>=?|&&|\|\||[=!+\-*/%<>^&|]=?|[?~:]/,
          // If there is no $ sign at the beginning highlight (( and )) as punctuation
          punctuation: /\(\(?|\)\)?|,|;/
        }
      },
      // [1]: Command Substitution
      {
        pattern: /\$\((?:\([^)]+\)|[^()])+\)|`[^`]+`/,
        greedy: true,
        inside: {
          variable: /^\$\(|^`|\)$|`$/
        }
      },
      // [2]: Brace expansion
      {
        pattern: /\$\{[^}]+\}/,
        greedy: true,
        inside: {
          operator: /:[-=?+]?|[!\/]|##?|%%?|\^\^?|,,?/,
          punctuation: /[\[\]]/,
          environment: {
            pattern: RegExp("(\\{)" + e),
            lookbehind: true,
            alias: "constant"
          }
        }
      },
      /\$(?:\w+|[#?*!@$])/
    ],
    // Escape sequences from echo and printf's manuals, and escaped quotes.
    entity: /\\(?:[abceEfnrtv\\"]|O?[0-7]{1,3}|U[0-9a-fA-F]{8}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{1,2})/
  };
  r4.languages.bash = {
    shebang: {
      pattern: /^#!\s*\/.*/,
      alias: "important"
    },
    comment: {
      pattern: /(^|[^"{\\$])#.*/,
      lookbehind: true
    },
    "function-name": [
      // a) function foo {
      // b) foo() {
      // c) function foo() {
      // but not “foo {”
      {
        // a) and c)
        pattern: /(\bfunction\s+)[\w-]+(?=(?:\s*\(?:\s*\))?\s*\{)/,
        lookbehind: true,
        alias: "function"
      },
      {
        // b)
        pattern: /\b[\w-]+(?=\s*\(\s*\)\s*\{)/,
        alias: "function"
      }
    ],
    // Highlight variable names as variables in for and select beginnings.
    "for-or-select": {
      pattern: /(\b(?:for|select)\s+)\w+(?=\s+in\s)/,
      alias: "variable",
      lookbehind: true
    },
    // Highlight variable names as variables in the left-hand part
    // of assignments (“=” and “+=”).
    "assign-left": {
      pattern: /(^|[\s;|&]|[<>]\()\w+(?:\.\w+)*(?=\+?=)/,
      inside: {
        environment: {
          pattern: RegExp("(^|[\\s;|&]|[<>]\\()" + e),
          lookbehind: true,
          alias: "constant"
        }
      },
      alias: "variable",
      lookbehind: true
    },
    // Highlight parameter names as variables
    parameter: {
      pattern: /(^|\s)-{1,2}(?:\w+:[+-]?)?\w+(?:\.\w+)*(?=[=\s]|$)/,
      alias: "variable",
      lookbehind: true
    },
    string: [
      // Support for Here-documents https://en.wikipedia.org/wiki/Here_document
      {
        pattern: /((?:^|[^<])<<-?\s*)(\w+)\s[\s\S]*?(?:\r?\n|\r)\2/,
        lookbehind: true,
        greedy: true,
        inside: a
      },
      // Here-document with quotes around the tag
      // → No expansion (so no “inside”).
      {
        pattern: /((?:^|[^<])<<-?\s*)(["'])(\w+)\2\s[\s\S]*?(?:\r?\n|\r)\3/,
        lookbehind: true,
        greedy: true,
        inside: {
          bash: t
        }
      },
      // “Normal” string
      {
        // https://www.gnu.org/software/bash/manual/html_node/Double-Quotes.html
        pattern: /(^|[^\\](?:\\\\)*)"(?:\\[\s\S]|\$\([^)]+\)|\$(?!\()|`[^`]+`|[^"\\`$])*"/,
        lookbehind: true,
        greedy: true,
        inside: a
      },
      {
        // https://www.gnu.org/software/bash/manual/html_node/Single-Quotes.html
        pattern: /(^|[^$\\])'[^']*'/,
        lookbehind: true,
        greedy: true
      },
      {
        // https://www.gnu.org/software/bash/manual/html_node/ANSI_002dC-Quoting.html
        pattern: /\$'(?:[^'\\]|\\[\s\S])*'/,
        greedy: true,
        inside: {
          entity: a.entity
        }
      }
    ],
    environment: {
      pattern: RegExp("\\$?" + e),
      alias: "constant"
    },
    variable: a.variable,
    function: {
      pattern: /(^|[\s;|&]|[<>]\()(?:add|apropos|apt|apt-cache|apt-get|aptitude|aspell|automysqlbackup|awk|basename|bash|bc|bconsole|bg|bzip2|cal|cargo|cat|cfdisk|chgrp|chkconfig|chmod|chown|chroot|cksum|clear|cmp|column|comm|composer|cp|cron|crontab|csplit|curl|cut|date|dc|dd|ddrescue|debootstrap|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|docker|docker-compose|du|egrep|eject|env|ethtool|expand|expect|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|git|gparted|grep|groupadd|groupdel|groupmod|groups|grub-mkconfig|gzip|halt|head|hg|history|host|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|ip|java|jobs|join|kill|killall|less|link|ln|locate|logname|logrotate|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|lynx|make|man|mc|mdadm|mkconfig|mkdir|mke2fs|mkfifo|mkfs|mkisofs|mknod|mkswap|mmv|more|most|mount|mtools|mtr|mutt|mv|nano|nc|netstat|nice|nl|node|nohup|notify-send|npm|nslookup|op|open|parted|passwd|paste|pathchk|ping|pkill|pnpm|podman|podman-compose|popd|pr|printcap|printenv|ps|pushd|pv|quota|quotacheck|quotactl|ram|rar|rcp|reboot|remsync|rename|renice|rev|rm|rmdir|rpm|rsync|scp|screen|sdiff|sed|sendmail|seq|service|sftp|sh|shellcheck|shuf|shutdown|sleep|slocate|sort|split|ssh|stat|strace|su|sudo|sum|suspend|swapon|sync|sysctl|tac|tail|tar|tee|time|timeout|top|touch|tr|traceroute|tsort|tty|umount|uname|unexpand|uniq|units|unrar|unshar|unzip|update-grub|uptime|useradd|userdel|usermod|users|uudecode|uuencode|v|vcpkg|vdir|vi|vim|virsh|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yarn|yes|zenity|zip|zsh|zypper)(?=$|[)\s;|&])/,
      lookbehind: true
    },
    keyword: {
      pattern: /(^|[\s;|&]|[<>]\()(?:case|do|done|elif|else|esac|fi|for|function|if|in|select|then|until|while)(?=$|[)\s;|&])/,
      lookbehind: true
    },
    // https://www.gnu.org/software/bash/manual/html_node/Shell-Builtin-Commands.html
    builtin: {
      pattern: /(^|[\s;|&]|[<>]\()(?:\.|:|alias|bind|break|builtin|caller|cd|command|continue|declare|echo|enable|eval|exec|exit|export|getopts|hash|help|let|local|logout|mapfile|printf|pwd|read|readarray|readonly|return|set|shift|shopt|source|test|times|trap|type|typeset|ulimit|umask|unalias|unset)(?=$|[)\s;|&])/,
      lookbehind: true,
      // Alias added to make those easier to distinguish from strings.
      alias: "class-name"
    },
    boolean: {
      pattern: /(^|[\s;|&]|[<>]\()(?:false|true)(?=$|[)\s;|&])/,
      lookbehind: true
    },
    "file-descriptor": {
      pattern: /\B&\d\b/,
      alias: "important"
    },
    operator: {
      // Lots of redirections here, but not just that.
      pattern: /\d?<>|>\||\+=|=[=~]?|!=?|<<[<-]?|[&\d]?>>|\d[<>]&?|[<>][&=]?|&[>&]?|\|[&|]?/,
      inside: {
        "file-descriptor": {
          pattern: /^\d/,
          alias: "important"
        }
      }
    },
    punctuation: /\$?\(\(?|\)\)?|\.\.|[{}[\];\\]/,
    number: {
      pattern: /(^|\s)(?:[1-9]\d*|0)(?:[.,]\d+)?\b/,
      lookbehind: true
    }
  }, t.inside = r4.languages.bash;
  for (var n = [
    "comment",
    "function-name",
    "for-or-select",
    "assign-left",
    "parameter",
    "string",
    "environment",
    "function",
    "keyword",
    "builtin",
    "boolean",
    "file-descriptor",
    "operator",
    "punctuation",
    "number"
  ], i = a.variable[1].inside, o = 0; o < n.length; o++)
    i[n[o]] = r4.languages.bash[n[o]];
  r4.languages.sh = r4.languages.bash, r4.languages.shell = r4.languages.bash;
})(Prism);
Prism.languages.c = Prism.languages.extend("clike", {
  comment: {
    pattern: /\/\/(?:[^\r\n\\]|\\(?:\r\n?|\n|(?![\r\n])))*|\/\*[\s\S]*?(?:\*\/|$)/,
    greedy: true
  },
  string: {
    // https://en.cppreference.com/w/c/language/string_literal
    pattern: /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
    greedy: true
  },
  "class-name": {
    pattern: /(\b(?:enum|struct)\s+(?:__attribute__\s*\(\([\s\S]*?\)\)\s*)?)\w+|\b[a-z]\w*_t\b/,
    lookbehind: true
  },
  keyword: /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|__attribute__|asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|typeof|union|unsigned|void|volatile|while)\b/,
  function: /\b[a-z_]\w*(?=\s*\()/i,
  number: /(?:\b0x(?:[\da-f]+(?:\.[\da-f]*)?|\.[\da-f]+)(?:p[+-]?\d+)?|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?)[ful]{0,4}/i,
  operator: />>=?|<<=?|->|([-+&|:])\1|[?:~]|[-+*/%&|^!=<>]=?/
});
Prism.languages.insertBefore("c", "string", {
  char: {
    // https://en.cppreference.com/w/c/language/character_constant
    pattern: /'(?:\\(?:\r\n|[\s\S])|[^'\\\r\n]){0,32}'/,
    greedy: true
  }
});
Prism.languages.insertBefore("c", "string", {
  macro: {
    // allow for multiline macro definitions
    // spaces after the # character compile fine with gcc
    pattern: /(^[\t ]*)#\s*[a-z](?:[^\r\n\\/]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|\\(?:\r\n|[\s\S]))*/im,
    lookbehind: true,
    greedy: true,
    alias: "property",
    inside: {
      string: [
        {
          // highlight the path of the include statement as a string
          pattern: /^(#\s*include\s*)<[^>]+>/,
          lookbehind: true
        },
        Prism.languages.c.string
      ],
      char: Prism.languages.c.char,
      comment: Prism.languages.c.comment,
      "macro-name": [
        {
          pattern: /(^#\s*define\s+)\w+\b(?!\()/i,
          lookbehind: true
        },
        {
          pattern: /(^#\s*define\s+)\w+\b(?=\()/i,
          lookbehind: true,
          alias: "function"
        }
      ],
      // highlight macro directives as keywords
      directive: {
        pattern: /^(#\s*)[a-z]+/,
        lookbehind: true,
        alias: "keyword"
      },
      "directive-hash": /^#/,
      punctuation: /##|\\(?=[\r\n])/,
      expression: {
        pattern: /\S[\s\S]*/,
        inside: Prism.languages.c
      }
    }
  }
});
Prism.languages.insertBefore("c", "function", {
  // highlight predefined macros as constants
  constant: /\b(?:EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|__DATE__|__FILE__|__LINE__|__TIMESTAMP__|__TIME__|__func__|stderr|stdin|stdout)\b/
});
delete Prism.languages.c.boolean;
(function(r4) {
  var e = /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|char8_t|class|co_await|co_return|co_yield|compl|concept|const|const_cast|consteval|constexpr|constinit|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|final|float|for|friend|goto|if|import|inline|int|int16_t|int32_t|int64_t|int8_t|long|module|mutable|namespace|new|noexcept|nullptr|operator|override|private|protected|public|register|reinterpret_cast|requires|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|uint16_t|uint32_t|uint64_t|uint8_t|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/, t = /\b(?!<keyword>)\w+(?:\s*\.\s*\w+)*\b/.source.replace(/<keyword>/g, function() {
    return e.source;
  });
  r4.languages.cpp = r4.languages.extend("c", {
    "class-name": [
      {
        pattern: RegExp(/(\b(?:class|concept|enum|struct|typename)\s+)(?!<keyword>)\w+/.source.replace(/<keyword>/g, function() {
          return e.source;
        })),
        lookbehind: true
      },
      // This is intended to capture the class name of method implementations like:
      //   void foo::bar() const {}
      // However! The `foo` in the above example could also be a namespace, so we only capture the class name if
      // it starts with an uppercase letter. This approximation should give decent results.
      /\b[A-Z]\w*(?=\s*::\s*\w+\s*\()/,
      // This will capture the class name before destructors like:
      //   Foo::~Foo() {}
      /\b[A-Z_]\w*(?=\s*::\s*~\w+\s*\()/i,
      // This also intends to capture the class name of method implementations but here the class has template
      // parameters, so it can't be a namespace (until C++ adds generic namespaces).
      /\b\w+(?=\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>\s*::\s*\w+\s*\()/
    ],
    keyword: e,
    number: {
      pattern: /(?:\b0b[01']+|\b0x(?:[\da-f']+(?:\.[\da-f']*)?|\.[\da-f']+)(?:p[+-]?[\d']+)?|(?:\b[\d']+(?:\.[\d']*)?|\B\.[\d']+)(?:e[+-]?[\d']+)?)[ful]{0,4}/i,
      greedy: true
    },
    operator: />>=?|<<=?|->|--|\+\+|&&|\|\||[?:~]|<=>|[-+*/%&|^!=<>]=?|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/,
    boolean: /\b(?:false|true)\b/
  }), r4.languages.insertBefore("cpp", "string", {
    module: {
      // https://en.cppreference.com/w/cpp/language/modules
      pattern: RegExp(
        /(\b(?:import|module)\s+)/.source + "(?:" + // header-name
        /"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"|<[^<>\r\n]*>/.source + "|" + // module name or partition or both
        /<mod-name>(?:\s*:\s*<mod-name>)?|:\s*<mod-name>/.source.replace(/<mod-name>/g, function() {
          return t;
        }) + ")"
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        string: /^[<"][\s\S]+/,
        operator: /:/,
        punctuation: /\./
      }
    },
    "raw-string": {
      pattern: /R"([^()\\ ]{0,16})\([\s\S]*?\)\1"/,
      alias: "string",
      greedy: true
    }
  }), r4.languages.insertBefore("cpp", "keyword", {
    "generic-function": {
      pattern: /\b(?!operator\b)[a-z_]\w*\s*<(?:[^<>]|<[^<>]*>)*>(?=\s*\()/i,
      inside: {
        function: /^\w+/,
        generic: {
          pattern: /<[\s\S]+/,
          alias: "class-name",
          inside: r4.languages.cpp
        }
      }
    }
  }), r4.languages.insertBefore("cpp", "operator", {
    "double-colon": {
      pattern: /::/,
      alias: "punctuation"
    }
  }), r4.languages.insertBefore("cpp", "class-name", {
    // the base clause is an optional list of parent classes
    // https://en.cppreference.com/w/cpp/language/class
    "base-clause": {
      pattern: /(\b(?:class|struct)\s+\w+\s*:\s*)[^;{}"'\s]+(?:\s+[^;{}"'\s]+)*(?=\s*[;{])/,
      lookbehind: true,
      greedy: true,
      inside: r4.languages.extend("cpp", {})
    }
  }), r4.languages.insertBefore("inside", "double-colon", {
    // All untokenized words that are not namespaces should be class names
    "class-name": /\b[a-z_]\w*\b(?!\s*::)/i
  }, r4.languages.cpp["base-clause"]);
})(Prism);
(function(r4) {
  function e(le, ke) {
    return le.replace(/<<(\d+)>>/g, function(_e, he) {
      return "(?:" + ke[+he] + ")";
    });
  }
  function t(le, ke, _e) {
    return RegExp(e(le, ke), "");
  }
  function a(le, ke) {
    for (var _e = 0; _e < ke; _e++)
      le = le.replace(/<<self>>/g, function() {
        return "(?:" + le + ")";
      });
    return le.replace(/<<self>>/g, "[^\\s\\S]");
  }
  var n = {
    // keywords which represent a return or variable type
    type: "bool byte char decimal double dynamic float int long object sbyte short string uint ulong ushort var void",
    // keywords which are used to declare a type
    typeDeclaration: "class enum interface record struct",
    // contextual keywords
    // ("var" and "dynamic" are missing because they are used like types)
    contextual: "add alias and ascending async await by descending from(?=\\s*(?:\\w|$)) get global group into init(?=\\s*;) join let nameof not notnull on or orderby partial remove select set unmanaged value when where with(?=\\s*{)",
    // all other keywords
    other: "abstract as base break case catch checked const continue default delegate do else event explicit extern finally fixed for foreach goto if implicit in internal is lock namespace new null operator out override params private protected public readonly ref return sealed sizeof stackalloc static switch this throw try typeof unchecked unsafe using virtual volatile while yield"
  };
  function i(le) {
    return "\\b(?:" + le.trim().replace(/ /g, "|") + ")\\b";
  }
  var o = i(n.typeDeclaration), u = RegExp(i(n.type + " " + n.typeDeclaration + " " + n.contextual + " " + n.other)), c = i(n.typeDeclaration + " " + n.contextual + " " + n.other), m = i(n.type + " " + n.typeDeclaration + " " + n.other), p = a(/<(?:[^<>;=+\-*/%&|^]|<<self>>)*>/.source, 2), v = a(/\((?:[^()]|<<self>>)*\)/.source, 2), k = /@?\b[A-Za-z_]\w*\b/.source, S = e(/<<0>>(?:\s*<<1>>)?/.source, [k, p]), z = e(/(?!<<0>>)<<1>>(?:\s*\.\s*<<1>>)*/.source, [c, S]), T = /\[\s*(?:,\s*)*\]/.source, _ = e(/<<0>>(?:\s*(?:\?\s*)?<<1>>)*(?:\s*\?)?/.source, [z, T]), M = e(/[^,()<>[\];=+\-*/%&|^]|<<0>>|<<1>>|<<2>>/.source, [p, v, T]), b = e(/\(<<0>>+(?:,<<0>>+)+\)/.source, [M]), y = e(/(?:<<0>>|<<1>>)(?:\s*(?:\?\s*)?<<2>>)*(?:\s*\?)?/.source, [b, z, T]), E = {
    keyword: u,
    punctuation: /[<>()?,.:[\]]/
  }, N = /'(?:[^\r\n'\\]|\\.|\\[Uux][\da-fA-F]{1,8})'/.source, C = /"(?:\\.|[^\\"\r\n])*"/.source, I = /@"(?:""|\\[\s\S]|[^\\"])*"(?!")/.source;
  r4.languages.csharp = r4.languages.extend("clike", {
    string: [
      {
        pattern: t(/(^|[^$\\])<<0>>/.source, [I]),
        lookbehind: true,
        greedy: true
      },
      {
        pattern: t(/(^|[^@$\\])<<0>>/.source, [C]),
        lookbehind: true,
        greedy: true
      }
    ],
    "class-name": [
      {
        // Using static
        // using static System.Math;
        pattern: t(/(\busing\s+static\s+)<<0>>(?=\s*;)/.source, [z]),
        lookbehind: true,
        inside: E
      },
      {
        // Using alias (type)
        // using Project = PC.MyCompany.Project;
        pattern: t(/(\busing\s+<<0>>\s*=\s*)<<1>>(?=\s*;)/.source, [k, y]),
        lookbehind: true,
        inside: E
      },
      {
        // Using alias (alias)
        // using Project = PC.MyCompany.Project;
        pattern: t(/(\busing\s+)<<0>>(?=\s*=)/.source, [k]),
        lookbehind: true
      },
      {
        // Type declarations
        // class Foo<A, B>
        // interface Foo<out A, B>
        pattern: t(/(\b<<0>>\s+)<<1>>/.source, [o, S]),
        lookbehind: true,
        inside: E
      },
      {
        // Single catch exception declaration
        // catch(Foo)
        // (things like catch(Foo e) is covered by variable declaration)
        pattern: t(/(\bcatch\s*\(\s*)<<0>>/.source, [z]),
        lookbehind: true,
        inside: E
      },
      {
        // Name of the type parameter of generic constraints
        // where Foo : class
        pattern: t(/(\bwhere\s+)<<0>>/.source, [k]),
        lookbehind: true
      },
      {
        // Casts and checks via as and is.
        // as Foo<A>, is Bar<B>
        // (things like if(a is Foo b) is covered by variable declaration)
        pattern: t(/(\b(?:is(?:\s+not)?|as)\s+)<<0>>/.source, [_]),
        lookbehind: true,
        inside: E
      },
      {
        // Variable, field and parameter declaration
        // (Foo bar, Bar baz, Foo[,,] bay, Foo<Bar, FooBar<Bar>> bax)
        pattern: t(/\b<<0>>(?=\s+(?!<<1>>|with\s*\{)<<2>>(?:\s*[=,;:{)\]]|\s+(?:in|when)\b))/.source, [y, m, k]),
        inside: E
      }
    ],
    keyword: u,
    // https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure#literals
    number: /(?:\b0(?:x[\da-f_]*[\da-f]|b[01_]*[01])|(?:\B\.\d+(?:_+\d+)*|\b\d+(?:_+\d+)*(?:\.\d+(?:_+\d+)*)?)(?:e[-+]?\d+(?:_+\d+)*)?)(?:[dflmu]|lu|ul)?\b/i,
    operator: />>=?|<<=?|[-=]>|([-+&|])\1|~|\?\?=?|[-+*/%&|^!=<>]=?/,
    punctuation: /\?\.?|::|[{}[\];(),.:]/
  }), r4.languages.insertBefore("csharp", "number", {
    range: {
      pattern: /\.\./,
      alias: "operator"
    }
  }), r4.languages.insertBefore("csharp", "punctuation", {
    "named-parameter": {
      pattern: t(/([(,]\s*)<<0>>(?=\s*:)/.source, [k]),
      lookbehind: true,
      alias: "punctuation"
    }
  }), r4.languages.insertBefore("csharp", "class-name", {
    namespace: {
      // namespace Foo.Bar {}
      // using Foo.Bar;
      pattern: t(/(\b(?:namespace|using)\s+)<<0>>(?:\s*\.\s*<<0>>)*(?=\s*[;{])/.source, [k]),
      lookbehind: true,
      inside: {
        punctuation: /\./
      }
    },
    "type-expression": {
      // default(Foo), typeof(Foo<Bar>), sizeof(int)
      pattern: t(/(\b(?:default|sizeof|typeof)\s*\(\s*(?!\s))(?:[^()\s]|\s(?!\s)|<<0>>)*(?=\s*\))/.source, [v]),
      lookbehind: true,
      alias: "class-name",
      inside: E
    },
    "return-type": {
      // Foo<Bar> ForBar(); Foo IFoo.Bar() => 0
      // int this[int index] => 0; T IReadOnlyList<T>.this[int index] => this[index];
      // int Foo => 0; int Foo { get; set } = 0;
      pattern: t(/<<0>>(?=\s+(?:<<1>>\s*(?:=>|[({]|\.\s*this\s*\[)|this\s*\[))/.source, [y, z]),
      inside: E,
      alias: "class-name"
    },
    "constructor-invocation": {
      // new List<Foo<Bar[]>> { }
      pattern: t(/(\bnew\s+)<<0>>(?=\s*[[({])/.source, [y]),
      lookbehind: true,
      inside: E,
      alias: "class-name"
    },
    /*'explicit-implementation': {
    	// int IFoo<Foo>.Bar => 0; void IFoo<Foo<Foo>>.Foo<T>();
    	pattern: replace(/\b<<0>>(?=\.<<1>>)/, className, methodOrPropertyDeclaration),
    	inside: classNameInside,
    	alias: 'class-name'
    },*/
    "generic-method": {
      // foo<Bar>()
      pattern: t(/<<0>>\s*<<1>>(?=\s*\()/.source, [k, p]),
      inside: {
        function: t(/^<<0>>/.source, [k]),
        generic: {
          pattern: RegExp(p),
          alias: "class-name",
          inside: E
        }
      }
    },
    "type-list": {
      // The list of types inherited or of generic constraints
      // class Foo<F> : Bar, IList<FooBar>
      // where F : Bar, IList<int>
      pattern: t(
        /\b((?:<<0>>\s+<<1>>|record\s+<<1>>\s*<<5>>|where\s+<<2>>)\s*:\s*)(?:<<3>>|<<4>>|<<1>>\s*<<5>>|<<6>>)(?:\s*,\s*(?:<<3>>|<<4>>|<<6>>))*(?=\s*(?:where|[{;]|=>|$))/.source,
        [o, S, k, y, u.source, v, /\bnew\s*\(\s*\)/.source]
      ),
      lookbehind: true,
      inside: {
        "record-arguments": {
          pattern: t(/(^(?!new\s*\()<<0>>\s*)<<1>>/.source, [S, v]),
          lookbehind: true,
          greedy: true,
          inside: r4.languages.csharp
        },
        keyword: u,
        "class-name": {
          pattern: RegExp(y),
          greedy: true,
          inside: E
        },
        punctuation: /[,()]/
      }
    },
    preprocessor: {
      pattern: /(^[\t ]*)#.*/m,
      lookbehind: true,
      alias: "property",
      inside: {
        // highlight preprocessor directives as keywords
        directive: {
          pattern: /(#)\b(?:define|elif|else|endif|endregion|error|if|line|nullable|pragma|region|undef|warning)\b/,
          lookbehind: true,
          alias: "keyword"
        }
      }
    }
  });
  var F = C + "|" + N, O = e(/\/(?![*/])|\/\/[^\r\n]*[\r\n]|\/\*(?:[^*]|\*(?!\/))*\*\/|<<0>>/.source, [F]), Y = a(e(/[^"'/()]|<<0>>|\(<<self>>*\)/.source, [O]), 2), J = /\b(?:assembly|event|field|method|module|param|property|return|type)\b/.source, ce = e(/<<0>>(?:\s*\(<<1>>*\))?/.source, [z, Y]);
  r4.languages.insertBefore("csharp", "class-name", {
    attribute: {
      // Attributes
      // [Foo], [Foo(1), Bar(2, Prop = "foo")], [return: Foo(1), Bar(2)], [assembly: Foo(Bar)]
      pattern: t(/((?:^|[^\s\w>)?])\s*\[\s*)(?:<<0>>\s*:\s*)?<<1>>(?:\s*,\s*<<1>>)*(?=\s*\])/.source, [J, ce]),
      lookbehind: true,
      greedy: true,
      inside: {
        target: {
          pattern: t(/^<<0>>(?=\s*:)/.source, [J]),
          alias: "keyword"
        },
        "attribute-arguments": {
          pattern: t(/\(<<0>>*\)/.source, [Y]),
          inside: r4.languages.csharp
        },
        "class-name": {
          pattern: RegExp(z),
          inside: {
            punctuation: /\./
          }
        },
        punctuation: /[:,]/
      }
    }
  });
  var xe = /:[^}\r\n]+/.source, fe = a(e(/[^"'/()]|<<0>>|\(<<self>>*\)/.source, [O]), 2), Te = e(/\{(?!\{)(?:(?![}:])<<0>>)*<<1>>?\}/.source, [fe, xe]), ye = a(e(/[^"'/()]|\/(?!\*)|\/\*(?:[^*]|\*(?!\/))*\*\/|<<0>>|\(<<self>>*\)/.source, [F]), 2), Le = e(/\{(?!\{)(?:(?![}:])<<0>>)*<<1>>?\}/.source, [ye, xe]);
  function ae(le, ke) {
    return {
      interpolation: {
        pattern: t(/((?:^|[^{])(?:\{\{)*)<<0>>/.source, [le]),
        lookbehind: true,
        inside: {
          "format-string": {
            pattern: t(/(^\{(?:(?![}:])<<0>>)*)<<1>>(?=\}$)/.source, [ke, xe]),
            lookbehind: true,
            inside: {
              punctuation: /^:/
            }
          },
          punctuation: /^\{|\}$/,
          expression: {
            pattern: /[\s\S]+/,
            alias: "language-csharp",
            inside: r4.languages.csharp
          }
        }
      },
      string: /[\s\S]+/
    };
  }
  r4.languages.insertBefore("csharp", "string", {
    "interpolation-string": [
      {
        pattern: t(/(^|[^\\])(?:\$@|@\$)"(?:""|\\[\s\S]|\{\{|<<0>>|[^\\{"])*"/.source, [Te]),
        lookbehind: true,
        greedy: true,
        inside: ae(Te, fe)
      },
      {
        pattern: t(/(^|[^@\\])\$"(?:\\.|\{\{|<<0>>|[^\\"{])*"/.source, [Le]),
        lookbehind: true,
        greedy: true,
        inside: ae(Le, ye)
      }
    ],
    char: {
      pattern: RegExp(N),
      greedy: true
    }
  }), r4.languages.dotnet = r4.languages.cs = r4.languages.csharp;
})(Prism);
(function(r4) {
  var e = /\\[\r\n](?:\s|\\[\r\n]|#.*(?!.))*(?![\s#]|\\[\r\n])/.source, t = /(?:[ \t]+(?![ \t])(?:<SP_BS>)?|<SP_BS>)/.source.replace(/<SP_BS>/g, function() {
    return e;
  }), a = /"(?:[^"\\\r\n]|\\(?:\r\n|[\s\S]))*"|'(?:[^'\\\r\n]|\\(?:\r\n|[\s\S]))*'/.source, n = /--[\w-]+=(?:<STR>|(?!["'])(?:[^\s\\]|\\.)+)/.source.replace(/<STR>/g, function() {
    return a;
  }), i = {
    pattern: RegExp(a),
    greedy: true
  }, o = {
    pattern: /(^[ \t]*)#.*/m,
    lookbehind: true,
    greedy: true
  };
  function u(c, m) {
    return c = c.replace(/<OPT>/g, function() {
      return n;
    }).replace(/<SP>/g, function() {
      return t;
    }), RegExp(c, m);
  }
  r4.languages.docker = {
    instruction: {
      pattern: /(^[ \t]*)(?:ADD|ARG|CMD|COPY|ENTRYPOINT|ENV|EXPOSE|FROM|HEALTHCHECK|LABEL|MAINTAINER|ONBUILD|RUN|SHELL|STOPSIGNAL|USER|VOLUME|WORKDIR)(?=\s)(?:\\.|[^\r\n\\])*(?:\\$(?:\s|#.*$)*(?![\s#])(?:\\.|[^\r\n\\])*)*/im,
      lookbehind: true,
      greedy: true,
      inside: {
        options: {
          pattern: u(/(^(?:ONBUILD<SP>)?\w+<SP>)<OPT>(?:<SP><OPT>)*/.source, "i"),
          lookbehind: true,
          greedy: true,
          inside: {
            property: {
              pattern: /(^|\s)--[\w-]+/,
              lookbehind: true
            },
            string: [
              i,
              {
                pattern: /(=)(?!["'])(?:[^\s\\]|\\.)+/,
                lookbehind: true
              }
            ],
            operator: /\\$/m,
            punctuation: /=/
          }
        },
        keyword: [
          {
            // https://docs.docker.com/engine/reference/builder/#healthcheck
            pattern: u(/(^(?:ONBUILD<SP>)?HEALTHCHECK<SP>(?:<OPT><SP>)*)(?:CMD|NONE)\b/.source, "i"),
            lookbehind: true,
            greedy: true
          },
          {
            // https://docs.docker.com/engine/reference/builder/#from
            pattern: u(/(^(?:ONBUILD<SP>)?FROM<SP>(?:<OPT><SP>)*(?!--)[^ \t\\]+<SP>)AS/.source, "i"),
            lookbehind: true,
            greedy: true
          },
          {
            // https://docs.docker.com/engine/reference/builder/#onbuild
            pattern: u(/(^ONBUILD<SP>)\w+/.source, "i"),
            lookbehind: true,
            greedy: true
          },
          {
            pattern: /^\w+/,
            greedy: true
          }
        ],
        comment: o,
        string: i,
        variable: /\$(?:\w+|\{[^{}"'\\]*\})/,
        operator: /\\$/m
      }
    },
    comment: o
  }, r4.languages.dockerfile = r4.languages.docker;
})(Prism);
(function(r4) {
  var e = /\b(?:abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|exports|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|module|native|new|non-sealed|null|open|opens|package|permits|private|protected|provides|public|record(?!\s*[(){}[\]<>=%~.:,;?+\-*/&|^])|requires|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/, t = /(?:[a-z]\w*\s*\.\s*)*(?:[A-Z]\w*\s*\.\s*)*/.source, a = {
    pattern: RegExp(/(^|[^\w.])/.source + t + /[A-Z](?:[\d_A-Z]*[a-z]\w*)?\b/.source),
    lookbehind: true,
    inside: {
      namespace: {
        pattern: /^[a-z]\w*(?:\s*\.\s*[a-z]\w*)*(?:\s*\.)?/,
        inside: {
          punctuation: /\./
        }
      },
      punctuation: /\./
    }
  };
  r4.languages.java = r4.languages.extend("clike", {
    string: {
      pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"/,
      lookbehind: true,
      greedy: true
    },
    "class-name": [
      a,
      {
        // variables, parameters, and constructor references
        // this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
        pattern: RegExp(/(^|[^\w.])/.source + t + /[A-Z]\w*(?=\s+\w+\s*[;,=()]|\s*(?:\[[\s,]*\]\s*)?::\s*new\b)/.source),
        lookbehind: true,
        inside: a.inside
      },
      {
        // class names based on keyword
        // this to support class names (or generic parameters) which do not contain a lower case letter (also works for methods)
        pattern: RegExp(/(\b(?:class|enum|extends|implements|instanceof|interface|new|record|throws)\s+)/.source + t + /[A-Z]\w*\b/.source),
        lookbehind: true,
        inside: a.inside
      }
    ],
    keyword: e,
    function: [
      r4.languages.clike.function,
      {
        pattern: /(::\s*)[a-z_]\w*/,
        lookbehind: true
      }
    ],
    number: /\b0b[01][01_]*L?\b|\b0x(?:\.[\da-f_p+-]+|[\da-f_]+(?:\.[\da-f_p+-]+)?)\b|(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,
    operator: {
      pattern: /(^|[^.])(?:<<=?|>>>?=?|->|--|\+\+|&&|\|\||::|[?:~]|[-+*/%&|^!=<>]=?)/m,
      lookbehind: true
    },
    constant: /\b[A-Z][A-Z_\d]+\b/
  }), r4.languages.insertBefore("java", "string", {
    "triple-quoted-string": {
      // http://openjdk.java.net/jeps/355#Description
      pattern: /"""[ \t]*[\r\n](?:(?:"|"")?(?:\\.|[^"\\]))*"""/,
      greedy: true,
      alias: "string"
    },
    char: {
      pattern: /'(?:\\.|[^'\\\r\n]){1,6}'/,
      greedy: true
    }
  }), r4.languages.insertBefore("java", "class-name", {
    annotation: {
      pattern: /(^|[^.])@\w+(?:\s*\.\s*\w+)*/,
      lookbehind: true,
      alias: "punctuation"
    },
    generics: {
      pattern: /<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&)|<(?:[\w\s,.?]|&(?!&))*>)*>)*>)*>/,
      inside: {
        "class-name": a,
        keyword: e,
        punctuation: /[<>(),.:]/,
        operator: /[?&|]/
      }
    },
    import: [
      {
        pattern: RegExp(/(\bimport\s+)/.source + t + /(?:[A-Z]\w*|\*)(?=\s*;)/.source),
        lookbehind: true,
        inside: {
          namespace: a.inside.namespace,
          punctuation: /\./,
          operator: /\*/,
          "class-name": /\w+/
        }
      },
      {
        pattern: RegExp(/(\bimport\s+static\s+)/.source + t + /(?:\w+|\*)(?=\s*;)/.source),
        lookbehind: true,
        alias: "static",
        inside: {
          namespace: a.inside.namespace,
          static: /\b\w+$/,
          punctuation: /\./,
          operator: /\*/,
          "class-name": /\w+/
        }
      }
    ],
    namespace: {
      pattern: RegExp(
        /(\b(?:exports|import(?:\s+static)?|module|open|opens|package|provides|requires|to|transitive|uses|with)\s+)(?!<keyword>)[a-z]\w*(?:\.[a-z]\w*)*\.?/.source.replace(/<keyword>/g, function() {
          return e.source;
        })
      ),
      lookbehind: true,
      inside: {
        punctuation: /\./
      }
    }
  });
})(Prism);
(function(r4) {
  var e = r4.languages.javascript["template-string"], t = e.pattern.source, a = e.inside.interpolation, n = a.inside["interpolation-punctuation"], i = a.pattern.source;
  function o(S, z) {
    if (r4.languages[S])
      return {
        pattern: RegExp("((?:" + z + ")\\s*)" + t),
        lookbehind: true,
        greedy: true,
        inside: {
          "template-punctuation": {
            pattern: /^`|`$/,
            alias: "string"
          },
          "embedded-code": {
            pattern: /[\s\S]+/,
            alias: S
          }
        }
      };
  }
  r4.languages.javascript["template-string"] = [
    // styled-jsx:
    //   css`a { color: #25F; }`
    // styled-components:
    //   styled.h1`color: red;`
    o("css", /\b(?:styled(?:\([^)]*\))?(?:\s*\.\s*\w+(?:\([^)]*\))*)*|css(?:\s*\.\s*(?:global|resolve))?|createGlobalStyle|keyframes)/.source),
    // html`<p></p>`
    // div.innerHTML = `<p></p>`
    o("html", /\bhtml|\.\s*(?:inner|outer)HTML\s*\+?=/.source),
    // svg`<path fill="#fff" d="M55.37 ..."/>`
    o("svg", /\bsvg/.source),
    // md`# h1`, markdown`## h2`
    o("markdown", /\b(?:markdown|md)/.source),
    // gql`...`, graphql`...`, graphql.experimental`...`
    o("graphql", /\b(?:gql|graphql(?:\s*\.\s*experimental)?)/.source),
    // sql`...`
    o("sql", /\bsql/.source),
    // vanilla template string
    e
  ].filter(Boolean);
  function u(S, z) {
    return "___" + z.toUpperCase() + "_" + S + "___";
  }
  function c(S, z, T) {
    var _ = {
      code: S,
      grammar: z,
      language: T
    };
    return r4.hooks.run("before-tokenize", _), _.tokens = r4.tokenize(_.code, _.grammar), r4.hooks.run("after-tokenize", _), _.tokens;
  }
  function m(S) {
    var z = {};
    z["interpolation-punctuation"] = n;
    var T = r4.tokenize(S, z);
    if (T.length === 3) {
      var _ = [1, 1];
      _.push.apply(_, c(T[1], r4.languages.javascript, "javascript")), T.splice.apply(T, _);
    }
    return new r4.Token("interpolation", T, a.alias, S);
  }
  function p(S, z, T) {
    var _ = r4.tokenize(S, {
      interpolation: {
        pattern: RegExp(i),
        lookbehind: true
      }
    }), M = 0, b = {}, y = _.map(function(I) {
      if (typeof I == "string")
        return I;
      for (var F = I.content, O; S.indexOf(O = u(M++, T)) !== -1; )
        ;
      return b[O] = F, O;
    }).join(""), E = c(y, z, T), N = Object.keys(b);
    M = 0;
    function C(I) {
      for (var F = 0; F < I.length; F++) {
        if (M >= N.length)
          return;
        var O = I[F];
        if (typeof O == "string" || typeof O.content == "string") {
          var Y = N[M], J = typeof O == "string" ? O : (
            /** @type {string} */
            O.content
          ), ce = J.indexOf(Y);
          if (ce !== -1) {
            ++M;
            var xe = J.substring(0, ce), fe = m(b[Y]), Te = J.substring(ce + Y.length), ye = [];
            if (xe && ye.push(xe), ye.push(fe), Te) {
              var Le = [Te];
              C(Le), ye.push.apply(ye, Le);
            }
            typeof O == "string" ? (I.splice.apply(I, [F, 1].concat(ye)), F += ye.length - 1) : O.content = ye;
          }
        } else {
          var ae = O.content;
          Array.isArray(ae) ? C(ae) : C([ae]);
        }
      }
    }
    return C(E), new r4.Token(T, E, "language-" + T, S);
  }
  var v = {
    javascript: true,
    js: true,
    typescript: true,
    ts: true,
    jsx: true,
    tsx: true
  };
  r4.hooks.add("after-tokenize", function(S) {
    if (!(S.language in v))
      return;
    function z(T) {
      for (var _ = 0, M = T.length; _ < M; _++) {
        var b = T[_];
        if (typeof b != "string") {
          var y = b.content;
          if (!Array.isArray(y)) {
            typeof y != "string" && z([y]);
            continue;
          }
          if (b.type === "template-string") {
            var E = y[1];
            if (y.length === 3 && typeof E != "string" && E.type === "embedded-code") {
              var N = k(E), C = E.alias, I = Array.isArray(C) ? C[0] : C, F = r4.languages[I];
              if (!F)
                continue;
              y[1] = p(N, F, I);
            }
          } else
            z(y);
        }
      }
    }
    z(S.tokens);
  });
  function k(S) {
    return typeof S == "string" ? S : Array.isArray(S) ? S.map(k).join("") : k(S.content);
  }
})(Prism);
(function(r4) {
  r4.languages.typescript = r4.languages.extend("javascript", {
    "class-name": {
      pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
      lookbehind: true,
      greedy: true,
      inside: null
      // see below
    },
    builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/
  }), r4.languages.typescript.keyword.push(
    /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
    // keywords that have to be followed by an identifier
    /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
    // This is for `import type *, {}`
    /\btype\b(?=\s*(?:[\{*]|$))/
  ), delete r4.languages.typescript.parameter, delete r4.languages.typescript["literal-property"];
  var e = r4.languages.extend("typescript", {});
  delete e["class-name"], r4.languages.typescript["class-name"].inside = e, r4.languages.insertBefore("typescript", "function", {
    decorator: {
      pattern: /@[$\w\xA0-\uFFFF]+/,
      inside: {
        at: {
          pattern: /^@/,
          alias: "operator"
        },
        function: /^[\s\S]+/
      }
    },
    "generic-function": {
      // e.g. foo<T extends "bar" | "baz">( ...
      pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
      greedy: true,
      inside: {
        function: /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
        generic: {
          pattern: /<[\s\S]+/,
          // everything after the first <
          alias: "class-name",
          inside: e
        }
      }
    }
  }), r4.languages.ts = r4.languages.typescript;
})(Prism);
(function(r4) {
  var e = /#(?!\{).+/, t = {
    pattern: /#\{[^}]+\}/,
    alias: "variable"
  };
  r4.languages.coffeescript = r4.languages.extend("javascript", {
    comment: e,
    string: [
      // Strings are multiline
      {
        pattern: /'(?:\\[\s\S]|[^\\'])*'/,
        greedy: true
      },
      {
        // Strings are multiline
        pattern: /"(?:\\[\s\S]|[^\\"])*"/,
        greedy: true,
        inside: {
          interpolation: t
        }
      }
    ],
    keyword: /\b(?:and|break|by|catch|class|continue|debugger|delete|do|each|else|extend|extends|false|finally|for|if|in|instanceof|is|isnt|let|loop|namespace|new|no|not|null|of|off|on|or|own|return|super|switch|then|this|throw|true|try|typeof|undefined|unless|until|when|while|window|with|yes|yield)\b/,
    "class-member": {
      pattern: /@(?!\d)\w+/,
      alias: "variable"
    }
  }), r4.languages.insertBefore("coffeescript", "comment", {
    "multiline-comment": {
      pattern: /###[\s\S]+?###/,
      alias: "comment"
    },
    // Block regexp can contain comments and interpolation
    "block-regex": {
      pattern: /\/{3}[\s\S]*?\/{3}/,
      alias: "regex",
      inside: {
        comment: e,
        interpolation: t
      }
    }
  }), r4.languages.insertBefore("coffeescript", "string", {
    "inline-javascript": {
      pattern: /`(?:\\[\s\S]|[^\\`])*`/,
      inside: {
        delimiter: {
          pattern: /^`|`$/,
          alias: "punctuation"
        },
        script: {
          pattern: /[\s\S]+/,
          alias: "language-javascript",
          inside: r4.languages.javascript
        }
      }
    },
    // Block strings
    "multiline-string": [
      {
        pattern: /'''[\s\S]*?'''/,
        greedy: true,
        alias: "string"
      },
      {
        pattern: /"""[\s\S]*?"""/,
        greedy: true,
        alias: "string",
        inside: {
          interpolation: t
        }
      }
    ]
  }), r4.languages.insertBefore("coffeescript", "keyword", {
    // Object property
    property: /(?!\d)\w+(?=\s*:(?!:))/
  }), delete r4.languages.coffeescript["template-string"], r4.languages.coffee = r4.languages.coffeescript;
})(Prism);
(function(r4) {
  r4.languages.diff = {
    coord: [
      // Match all kinds of coord lines (prefixed by "+++", "---" or "***").
      /^(?:\*{3}|-{3}|\+{3}).*$/m,
      // Match "@@ ... @@" coord lines in unified diff.
      /^@@.*@@$/m,
      // Match coord lines in normal diff (starts with a number).
      /^\d.*$/m
    ]
    // deleted, inserted, unchanged, diff
  };
  var e = {
    "deleted-sign": "-",
    "deleted-arrow": "<",
    "inserted-sign": "+",
    "inserted-arrow": ">",
    unchanged: " ",
    diff: "!"
  };
  Object.keys(e).forEach(function(t) {
    var a = e[t], n = [];
    /^\w+$/.test(t) || n.push(/\w+/.exec(t)[0]), t === "diff" && n.push("bold"), r4.languages.diff[t] = {
      pattern: RegExp("^(?:[" + a + `].*(?:\r
?|
|(?![\\s\\S])))+`, "m"),
      alias: n,
      inside: {
        line: {
          pattern: /(.)(?=[\s\S]).*(?:\r\n?|\n)?/,
          lookbehind: true
        },
        prefix: {
          pattern: /[\s\S]/,
          alias: /\w+/.exec(t)[0]
        }
      }
    };
  }), Object.defineProperty(r4.languages.diff, "PREFIXES", {
    value: e
  });
})(Prism);
Prism.languages.git = {
  /*
   * A simple one line comment like in a git status command
   * For instance:
   * $ git status
   * # On branch infinite-scroll
   * # Your branch and 'origin/sharedBranches/frontendTeam/infinite-scroll' have diverged,
   * # and have 1 and 2 different commits each, respectively.
   * nothing to commit (working directory clean)
   */
  comment: /^#.*/m,
  /*
   * Regexp to match the changed lines in a git diff output. Check the example below.
   */
  deleted: /^[-–].*/m,
  inserted: /^\+.*/m,
  /*
   * a string (double and simple quote)
   */
  string: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
  /*
   * a git command. It starts with a random prompt finishing by a $, then "git" then some other parameters
   * For instance:
   * $ git add file.txt
   */
  command: {
    pattern: /^.*\$ git .*$/m,
    inside: {
      /*
       * A git command can contain a parameter starting by a single or a double dash followed by a string
       * For instance:
       * $ git diff --cached
       * $ git log -p
       */
      parameter: /\s--?\w+/
    }
  },
  /*
   * Coordinates displayed in a git diff command
   * For instance:
   * $ git diff
   * diff --git file.txt file.txt
   * index 6214953..1d54a52 100644
   * --- file.txt
   * +++ file.txt
   * @@ -1 +1,2 @@
   * -Here's my tetx file
   * +Here's my text file
   * +And this is the second line
   */
  coord: /^@@.*@@$/m,
  /*
   * Match a "commit [SHA1]" line in a git log output.
   * For instance:
   * $ git log
   * commit a11a14ef7e26f2ca62d4b35eac455ce636d0dc09
   * Author: lgiraudel
   * Date:   Mon Feb 17 11:18:34 2014 +0100
   *
   *     Add of a new line
   */
  "commit-sha1": /^commit \w{40}$/m
};
Prism.languages.go = Prism.languages.extend("clike", {
  string: {
    pattern: /(^|[^\\])"(?:\\.|[^"\\\r\n])*"|`[^`]*`/,
    lookbehind: true,
    greedy: true
  },
  keyword: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go(?:to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
  boolean: /\b(?:_|false|iota|nil|true)\b/,
  number: [
    // binary and octal integers
    /\b0(?:b[01_]+|o[0-7_]+)i?\b/i,
    // hexadecimal integers and floats
    /\b0x(?:[a-f\d_]+(?:\.[a-f\d_]*)?|\.[a-f\d_]+)(?:p[+-]?\d+(?:_\d+)*)?i?(?!\w)/i,
    // decimal integers and floats
    /(?:\b\d[\d_]*(?:\.[\d_]*)?|\B\.\d[\d_]*)(?:e[+-]?[\d_]+)?i?(?!\w)/i
  ],
  operator: /[*\/%^!=]=?|\+[=+]?|-[=-]?|\|[=|]?|&(?:=|&|\^=?)?|>(?:>=?|=)?|<(?:<=?|=|-)?|:=|\.\.\./,
  builtin: /\b(?:append|bool|byte|cap|close|complex|complex(?:64|128)|copy|delete|error|float(?:32|64)|u?int(?:8|16|32|64)?|imag|len|make|new|panic|print(?:ln)?|real|recover|rune|string|uintptr)\b/
});
Prism.languages.insertBefore("go", "string", {
  char: {
    pattern: /'(?:\\.|[^'\\\r\n]){0,10}'/,
    greedy: true
  }
});
delete Prism.languages.go["class-name"];
Prism.languages.graphql = {
  comment: /#.*/,
  description: {
    pattern: /(?:"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*")(?=\s*[a-z_])/i,
    greedy: true,
    alias: "string",
    inside: {
      "language-markdown": {
        pattern: /(^"(?:"")?)(?!\1)[\s\S]+(?=\1$)/,
        lookbehind: true,
        inside: Prism.languages.markdown
      }
    }
  },
  string: {
    pattern: /"""(?:[^"]|(?!""")")*"""|"(?:\\.|[^\\"\r\n])*"/,
    greedy: true
  },
  number: /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
  boolean: /\b(?:false|true)\b/,
  variable: /\$[a-z_]\w*/i,
  directive: {
    pattern: /@[a-z_]\w*/i,
    alias: "function"
  },
  "attr-name": {
    pattern: /\b[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i,
    greedy: true
  },
  "atom-input": {
    pattern: /\b[A-Z]\w*Input\b/,
    alias: "class-name"
  },
  scalar: /\b(?:Boolean|Float|ID|Int|String)\b/,
  constant: /\b[A-Z][A-Z_\d]*\b/,
  "class-name": {
    pattern: /(\b(?:enum|implements|interface|on|scalar|type|union)\s+|&\s*|:\s*|\[)[A-Z_]\w*/,
    lookbehind: true
  },
  fragment: {
    pattern: /(\bfragment\s+|\.{3}\s*(?!on\b))[a-zA-Z_]\w*/,
    lookbehind: true,
    alias: "function"
  },
  "definition-mutation": {
    pattern: /(\bmutation\s+)[a-zA-Z_]\w*/,
    lookbehind: true,
    alias: "function"
  },
  "definition-query": {
    pattern: /(\bquery\s+)[a-zA-Z_]\w*/,
    lookbehind: true,
    alias: "function"
  },
  keyword: /\b(?:directive|enum|extend|fragment|implements|input|interface|mutation|on|query|repeatable|scalar|schema|subscription|type|union)\b/,
  operator: /[!=|&]|\.{3}/,
  "property-query": /\w+(?=\s*\()/,
  object: /\w+(?=\s*\{)/,
  punctuation: /[!(){}\[\]:=,]/,
  property: /\w+/
};
Prism.hooks.add("after-tokenize", function(e) {
  if (e.language !== "graphql")
    return;
  var t = e.tokens.filter(function(T) {
    return typeof T != "string" && T.type !== "comment" && T.type !== "scalar";
  }), a = 0;
  function n(T) {
    return t[a + T];
  }
  function i(T, _) {
    _ = _ || 0;
    for (var M = 0; M < T.length; M++) {
      var b = n(M + _);
      if (!b || b.type !== T[M])
        return false;
    }
    return true;
  }
  function o(T, _) {
    for (var M = 1, b = a; b < t.length; b++) {
      var y = t[b], E = y.content;
      if (y.type === "punctuation" && typeof E == "string") {
        if (T.test(E))
          M++;
        else if (_.test(E) && (M--, M === 0))
          return b;
      }
    }
    return -1;
  }
  function u(T, _) {
    var M = T.alias;
    M ? Array.isArray(M) || (T.alias = M = [M]) : T.alias = M = [], M.push(_);
  }
  for (; a < t.length; ) {
    var c = t[a++];
    if (c.type === "keyword" && c.content === "mutation") {
      var m = [];
      if (i(["definition-mutation", "punctuation"]) && n(1).content === "(") {
        a += 2;
        var p = o(/^\($/, /^\)$/);
        if (p === -1)
          continue;
        for (; a < p; a++) {
          var v = n(0);
          v.type === "variable" && (u(v, "variable-input"), m.push(v.content));
        }
        a = p + 1;
      }
      if (i(["punctuation", "property-query"]) && n(0).content === "{" && (a++, u(n(0), "property-mutation"), m.length > 0)) {
        var k = o(/^\{$/, /^\}$/);
        if (k === -1)
          continue;
        for (var S = a; S < k; S++) {
          var z = t[S];
          z.type === "variable" && m.indexOf(z.content) >= 0 && u(z, "variable-input");
        }
      }
    }
  }
});
(function(r4) {
  r4.languages.handlebars = {
    comment: /\{\{![\s\S]*?\}\}/,
    delimiter: {
      pattern: /^\{\{\{?|\}\}\}?$/,
      alias: "punctuation"
    },
    string: /(["'])(?:\\.|(?!\1)[^\\\r\n])*\1/,
    number: /\b0x[\dA-Fa-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:[Ee][+-]?\d+)?/,
    boolean: /\b(?:false|true)\b/,
    block: {
      pattern: /^(\s*(?:~\s*)?)[#\/]\S+?(?=\s*(?:~\s*)?$|\s)/,
      lookbehind: true,
      alias: "keyword"
    },
    brackets: {
      pattern: /\[[^\]]+\]/,
      inside: {
        punctuation: /\[|\]/,
        variable: /[\s\S]+/
      }
    },
    punctuation: /[!"#%&':()*+,.\/;<=>@\[\\\]^`{|}~]/,
    variable: /[^!"#%&'()*+,\/;<=>@\[\\\]^`{|}~\s]+/
  }, r4.hooks.add("before-tokenize", function(e) {
    var t = /\{\{\{[\s\S]+?\}\}\}|\{\{[\s\S]+?\}\}/g;
    r4.languages["markup-templating"].buildPlaceholders(e, "handlebars", t);
  }), r4.hooks.add("after-tokenize", function(e) {
    r4.languages["markup-templating"].tokenizePlaceholders(e, "handlebars");
  }), r4.languages.hbs = r4.languages.handlebars, r4.languages.mustache = r4.languages.handlebars;
})(Prism);
Prism.languages.json = {
  property: {
    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
    lookbehind: true,
    greedy: true
  },
  string: {
    pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
    lookbehind: true,
    greedy: true
  },
  comment: {
    pattern: /\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,
    greedy: true
  },
  number: /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
  punctuation: /[{}[\],]/,
  operator: /:/,
  boolean: /\b(?:false|true)\b/,
  null: {
    pattern: /\bnull\b/,
    alias: "keyword"
  }
};
Prism.languages.webmanifest = Prism.languages.json;
Prism.languages.less = Prism.languages.extend("css", {
  comment: [
    /\/\*[\s\S]*?\*\//,
    {
      pattern: /(^|[^\\])\/\/.*/,
      lookbehind: true
    }
  ],
  atrule: {
    pattern: /@[\w-](?:\((?:[^(){}]|\([^(){}]*\))*\)|[^(){};\s]|\s+(?!\s))*?(?=\s*\{)/,
    inside: {
      punctuation: /[:()]/
    }
  },
  // selectors and mixins are considered the same
  selector: {
    pattern: /(?:@\{[\w-]+\}|[^{};\s@])(?:@\{[\w-]+\}|\((?:[^(){}]|\([^(){}]*\))*\)|[^(){};@\s]|\s+(?!\s))*?(?=\s*\{)/,
    inside: {
      // mixin parameters
      variable: /@+[\w-]+/
    }
  },
  property: /(?:@\{[\w-]+\}|[\w-])+(?:\+_?)?(?=\s*:)/,
  operator: /[+\-*\/]/
});
Prism.languages.insertBefore("less", "property", {
  variable: [
    // Variable declaration (the colon must be consumed!)
    {
      pattern: /@[\w-]+\s*:/,
      inside: {
        punctuation: /:/
      }
    },
    // Variable usage
    /@@?[\w-]+/
  ],
  "mixin-usage": {
    pattern: /([{;]\s*)[.#](?!\d)[\w-].*?(?=[(;])/,
    lookbehind: true,
    alias: "function"
  }
});
Prism.languages.makefile = {
  comment: {
    pattern: /(^|[^\\])#(?:\\(?:\r\n|[\s\S])|[^\\\r\n])*/,
    lookbehind: true
  },
  string: {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
    greedy: true
  },
  "builtin-target": {
    pattern: /\.[A-Z][^:#=\s]+(?=\s*:(?!=))/,
    alias: "builtin"
  },
  target: {
    pattern: /^(?:[^:=\s]|[ \t]+(?![\s:]))+(?=\s*:(?!=))/m,
    alias: "symbol",
    inside: {
      variable: /\$+(?:(?!\$)[^(){}:#=\s]+|(?=[({]))/
    }
  },
  variable: /\$+(?:(?!\$)[^(){}:#=\s]+|\([@*%<^+?][DF]\)|(?=[({]))/,
  // Directives
  keyword: /-include\b|\b(?:define|else|endef|endif|export|ifn?def|ifn?eq|include|override|private|sinclude|undefine|unexport|vpath)\b/,
  function: {
    pattern: /(\()(?:abspath|addsuffix|and|basename|call|dir|error|eval|file|filter(?:-out)?|findstring|firstword|flavor|foreach|guile|if|info|join|lastword|load|notdir|or|origin|patsubst|realpath|shell|sort|strip|subst|suffix|value|warning|wildcard|word(?:list|s)?)(?=[ \t])/,
    lookbehind: true
  },
  operator: /(?:::|[?:+!])?=|[|@]/,
  punctuation: /[:;(){}]/
};
(function(r4) {
  var e = /(?:\\.|[^\\\n\r]|(?:\n|\r\n?)(?![\r\n]))/.source;
  function t(p) {
    return p = p.replace(/<inner>/g, function() {
      return e;
    }), RegExp(/((?:^|[^\\])(?:\\{2})*)/.source + "(?:" + p + ")");
  }
  var a = /(?:\\.|``(?:[^`\r\n]|`(?!`))+``|`[^`\r\n]+`|[^\\|\r\n`])+/.source, n = /\|?__(?:\|__)+\|?(?:(?:\n|\r\n?)|(?![\s\S]))/.source.replace(/__/g, function() {
    return a;
  }), i = /\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?(?:\n|\r\n?)/.source;
  r4.languages.markdown = r4.languages.extend("markup", {}), r4.languages.insertBefore("markdown", "prolog", {
    "front-matter-block": {
      pattern: /(^(?:\s*[\r\n])?)---(?!.)[\s\S]*?[\r\n]---(?!.)/,
      lookbehind: true,
      greedy: true,
      inside: {
        punctuation: /^---|---$/,
        "front-matter": {
          pattern: /\S+(?:\s+\S+)*/,
          alias: ["yaml", "language-yaml"],
          inside: r4.languages.yaml
        }
      }
    },
    blockquote: {
      // > ...
      pattern: /^>(?:[\t ]*>)*/m,
      alias: "punctuation"
    },
    table: {
      pattern: RegExp("^" + n + i + "(?:" + n + ")*", "m"),
      inside: {
        "table-data-rows": {
          pattern: RegExp("^(" + n + i + ")(?:" + n + ")*$"),
          lookbehind: true,
          inside: {
            "table-data": {
              pattern: RegExp(a),
              inside: r4.languages.markdown
            },
            punctuation: /\|/
          }
        },
        "table-line": {
          pattern: RegExp("^(" + n + ")" + i + "$"),
          lookbehind: true,
          inside: {
            punctuation: /\||:?-{3,}:?/
          }
        },
        "table-header-row": {
          pattern: RegExp("^" + n + "$"),
          inside: {
            "table-header": {
              pattern: RegExp(a),
              alias: "important",
              inside: r4.languages.markdown
            },
            punctuation: /\|/
          }
        }
      }
    },
    code: [
      {
        // Prefixed by 4 spaces or 1 tab and preceded by an empty line
        pattern: /((?:^|\n)[ \t]*\n|(?:^|\r\n?)[ \t]*\r\n?)(?: {4}|\t).+(?:(?:\n|\r\n?)(?: {4}|\t).+)*/,
        lookbehind: true,
        alias: "keyword"
      },
      {
        // ```optional language
        // code block
        // ```
        pattern: /^```[\s\S]*?^```$/m,
        greedy: true,
        inside: {
          "code-block": {
            pattern: /^(```.*(?:\n|\r\n?))[\s\S]+?(?=(?:\n|\r\n?)^```$)/m,
            lookbehind: true
          },
          "code-language": {
            pattern: /^(```).+/,
            lookbehind: true
          },
          punctuation: /```/
        }
      }
    ],
    title: [
      {
        // title 1
        // =======
        // title 2
        // -------
        pattern: /\S.*(?:\n|\r\n?)(?:==+|--+)(?=[ \t]*$)/m,
        alias: "important",
        inside: {
          punctuation: /==+$|--+$/
        }
      },
      {
        // # title 1
        // ###### title 6
        pattern: /(^\s*)#.+/m,
        lookbehind: true,
        alias: "important",
        inside: {
          punctuation: /^#+|#+$/
        }
      }
    ],
    hr: {
      // ***
      // ---
      // * * *
      // -----------
      pattern: /(^\s*)([*-])(?:[\t ]*\2){2,}(?=\s*$)/m,
      lookbehind: true,
      alias: "punctuation"
    },
    list: {
      // * item
      // + item
      // - item
      // 1. item
      pattern: /(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,
      lookbehind: true,
      alias: "punctuation"
    },
    "url-reference": {
      // [id]: http://example.com "Optional title"
      // [id]: http://example.com 'Optional title'
      // [id]: http://example.com (Optional title)
      // [id]: <http://example.com> "Optional title"
      pattern: /!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
      inside: {
        variable: {
          pattern: /^(!?\[)[^\]]+/,
          lookbehind: true
        },
        string: /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
        punctuation: /^[\[\]!:]|[<>]/
      },
      alias: "url"
    },
    bold: {
      // **strong**
      // __strong__
      // allow one nested instance of italic text using the same delimiter
      pattern: t(/\b__(?:(?!_)<inner>|_(?:(?!_)<inner>)+_)+__\b|\*\*(?:(?!\*)<inner>|\*(?:(?!\*)<inner>)+\*)+\*\*/.source),
      lookbehind: true,
      greedy: true,
      inside: {
        content: {
          pattern: /(^..)[\s\S]+(?=..$)/,
          lookbehind: true,
          inside: {}
          // see below
        },
        punctuation: /\*\*|__/
      }
    },
    italic: {
      // *em*
      // _em_
      // allow one nested instance of bold text using the same delimiter
      pattern: t(/\b_(?:(?!_)<inner>|__(?:(?!_)<inner>)+__)+_\b|\*(?:(?!\*)<inner>|\*\*(?:(?!\*)<inner>)+\*\*)+\*/.source),
      lookbehind: true,
      greedy: true,
      inside: {
        content: {
          pattern: /(^.)[\s\S]+(?=.$)/,
          lookbehind: true,
          inside: {}
          // see below
        },
        punctuation: /[*_]/
      }
    },
    strike: {
      // ~~strike through~~
      // ~strike~
      // eslint-disable-next-line regexp/strict
      pattern: t(/(~~?)(?:(?!~)<inner>)+\2/.source),
      lookbehind: true,
      greedy: true,
      inside: {
        content: {
          pattern: /(^~~?)[\s\S]+(?=\1$)/,
          lookbehind: true,
          inside: {}
          // see below
        },
        punctuation: /~~?/
      }
    },
    "code-snippet": {
      // `code`
      // ``code``
      pattern: /(^|[^\\`])(?:``[^`\r\n]+(?:`[^`\r\n]+)*``(?!`)|`[^`\r\n]+`(?!`))/,
      lookbehind: true,
      greedy: true,
      alias: ["code", "keyword"]
    },
    url: {
      // [example](http://example.com "Optional title")
      // [example][id]
      // [example] [id]
      pattern: t(/!?\[(?:(?!\])<inner>)+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)|[ \t]?\[(?:(?!\])<inner>)+\])/.source),
      lookbehind: true,
      greedy: true,
      inside: {
        operator: /^!/,
        content: {
          pattern: /(^\[)[^\]]+(?=\])/,
          lookbehind: true,
          inside: {}
          // see below
        },
        variable: {
          pattern: /(^\][ \t]?\[)[^\]]+(?=\]$)/,
          lookbehind: true
        },
        url: {
          pattern: /(^\]\()[^\s)]+/,
          lookbehind: true
        },
        string: {
          pattern: /(^[ \t]+)"(?:\\.|[^"\\])*"(?=\)$)/,
          lookbehind: true
        }
      }
    }
  }), ["url", "bold", "italic", "strike"].forEach(function(p) {
    ["url", "bold", "italic", "strike", "code-snippet"].forEach(function(v) {
      p !== v && (r4.languages.markdown[p].inside.content.inside[v] = r4.languages.markdown[v]);
    });
  }), r4.hooks.add("after-tokenize", function(p) {
    if (p.language !== "markdown" && p.language !== "md")
      return;
    function v(k) {
      if (!(!k || typeof k == "string"))
        for (var S = 0, z = k.length; S < z; S++) {
          var T = k[S];
          if (T.type !== "code") {
            v(T.content);
            continue;
          }
          var _ = T.content[1], M = T.content[3];
          if (_ && M && _.type === "code-language" && M.type === "code-block" && typeof _.content == "string") {
            var b = _.content.replace(/\b#/g, "sharp").replace(/\b\+\+/g, "pp");
            b = (/[a-z][\w-]*/i.exec(b) || [""])[0].toLowerCase();
            var y = "language-" + b;
            M.alias ? typeof M.alias == "string" ? M.alias = [M.alias, y] : M.alias.push(y) : M.alias = [y];
          }
        }
    }
    v(p.tokens);
  }), r4.hooks.add("wrap", function(p) {
    if (p.type === "code-block") {
      for (var v = "", k = 0, S = p.classes.length; k < S; k++) {
        var z = p.classes[k], T = /language-(.+)/.exec(z);
        if (T) {
          v = T[1];
          break;
        }
      }
      var _ = r4.languages[v];
      if (_)
        p.content = r4.highlight(m(p.content), _, v);
      else if (v && v !== "none" && r4.plugins.autoloader) {
        var M = "md-" + (/* @__PURE__ */ new Date()).valueOf() + "-" + Math.floor(Math.random() * 1e16);
        p.attributes.id = M, r4.plugins.autoloader.loadLanguages(v, function() {
          var b = (void 0).getElementById(M);
          b && (b.innerHTML = r4.highlight(b.textContent, r4.languages[v], v));
        });
      }
    }
  });
  var o = RegExp(r4.languages.markup.tag.pattern.source, "gi"), u = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"'
  }, c = String.fromCodePoint || String.fromCharCode;
  function m(p) {
    var v = p.replace(o, "");
    return v = v.replace(/&(\w{1,8}|#x?[\da-f]{1,8});/gi, function(k, S) {
      if (S = S.toLowerCase(), S[0] === "#") {
        var z;
        return S[1] === "x" ? z = parseInt(S.slice(2), 16) : z = Number(S.slice(1)), c(z);
      } else {
        var T = u[S];
        return T || k;
      }
    }), v;
  }
  r4.languages.md = r4.languages.markdown;
})(Prism);
Prism.languages.objectivec = Prism.languages.extend("c", {
  string: {
    pattern: /@?"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
    greedy: true
  },
  keyword: /\b(?:asm|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|in|inline|int|long|register|return|self|short|signed|sizeof|static|struct|super|switch|typedef|typeof|union|unsigned|void|volatile|while)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,
  operator: /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/
});
delete Prism.languages.objectivec["class-name"];
Prism.languages.objc = Prism.languages.objectivec;
Prism.languages.ocaml = {
  comment: {
    pattern: /\(\*[\s\S]*?\*\)/,
    greedy: true
  },
  char: {
    pattern: /'(?:[^\\\r\n']|\\(?:.|[ox]?[0-9a-f]{1,3}))'/i,
    greedy: true
  },
  string: [
    {
      pattern: /"(?:\\(?:[\s\S]|\r\n)|[^\\\r\n"])*"/,
      greedy: true
    },
    {
      pattern: /\{([a-z_]*)\|[\s\S]*?\|\1\}/,
      greedy: true
    }
  ],
  number: [
    // binary and octal
    /\b(?:0b[01][01_]*|0o[0-7][0-7_]*)\b/i,
    // hexadecimal
    /\b0x[a-f0-9][a-f0-9_]*(?:\.[a-f0-9_]*)?(?:p[+-]?\d[\d_]*)?(?!\w)/i,
    // decimal
    /\b\d[\d_]*(?:\.[\d_]*)?(?:e[+-]?\d[\d_]*)?(?!\w)/i
  ],
  directive: {
    pattern: /\B#\w+/,
    alias: "property"
  },
  label: {
    pattern: /\B~\w+/,
    alias: "property"
  },
  "type-variable": {
    pattern: /\B'\w+/,
    alias: "function"
  },
  variant: {
    pattern: /`\w+/,
    alias: "symbol"
  },
  // For the list of keywords and operators,
  // see: http://caml.inria.fr/pub/docs/manual-ocaml/lex.html#sec84
  keyword: /\b(?:as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|match|method|module|mutable|new|nonrec|object|of|open|private|rec|sig|struct|then|to|try|type|val|value|virtual|when|where|while|with)\b/,
  boolean: /\b(?:false|true)\b/,
  "operator-like-punctuation": {
    pattern: /\[[<>|]|[>|]\]|\{<|>\}/,
    alias: "punctuation"
  },
  // Custom operators are allowed
  operator: /\.[.~]|:[=>]|[=<>@^|&+\-*\/$%!?~][!$%&*+\-.\/:<=>?@^|~]*|\b(?:and|asr|land|lor|lsl|lsr|lxor|mod|or)\b/,
  punctuation: /;;|::|[(){}\[\].,:;#]|\b_\b/
};
Prism.languages.python = {
  comment: {
    pattern: /(^|[^\\])#.*/,
    lookbehind: true,
    greedy: true
  },
  "string-interpolation": {
    pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
    greedy: true,
    inside: {
      interpolation: {
        // "{" <expression> <optional "!s", "!r", or "!a"> <optional ":" format specifier> "}"
        pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
        lookbehind: true,
        inside: {
          "format-spec": {
            pattern: /(:)[^:(){}]+(?=\}$)/,
            lookbehind: true
          },
          "conversion-option": {
            pattern: /![sra](?=[:}]$)/,
            alias: "punctuation"
          },
          rest: null
        }
      },
      string: /[\s\S]+/
    }
  },
  "triple-quoted-string": {
    pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
    greedy: true,
    alias: "string"
  },
  string: {
    pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
    greedy: true
  },
  function: {
    pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
    lookbehind: true
  },
  "class-name": {
    pattern: /(\bclass\s+)\w+/i,
    lookbehind: true
  },
  decorator: {
    pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
    lookbehind: true,
    alias: ["annotation", "punctuation"],
    inside: {
      punctuation: /\./
    }
  },
  keyword: /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
  builtin: /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
  boolean: /\b(?:False|None|True)\b/,
  number: /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
  operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
  punctuation: /[{}[\];(),.:]/
};
Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest = Prism.languages.python;
Prism.languages.py = Prism.languages.python;
Prism.languages.reason = Prism.languages.extend("clike", {
  string: {
    pattern: /"(?:\\(?:\r\n|[\s\S])|[^\\\r\n"])*"/,
    greedy: true
  },
  // 'class-name' must be matched *after* 'constructor' defined below
  "class-name": /\b[A-Z]\w*/,
  keyword: /\b(?:and|as|assert|begin|class|constraint|do|done|downto|else|end|exception|external|for|fun|function|functor|if|in|include|inherit|initializer|lazy|let|method|module|mutable|new|nonrec|object|of|open|or|private|rec|sig|struct|switch|then|to|try|type|val|virtual|when|while|with)\b/,
  operator: /\.{3}|:[:=]|\|>|->|=(?:==?|>)?|<=?|>=?|[|^?'#!~`]|[+\-*\/]\.?|\b(?:asr|land|lor|lsl|lsr|lxor|mod)\b/
});
Prism.languages.insertBefore("reason", "class-name", {
  char: {
    pattern: /'(?:\\x[\da-f]{2}|\\o[0-3][0-7][0-7]|\\\d{3}|\\.|[^'\\\r\n])'/,
    greedy: true
  },
  // Negative look-ahead prevents from matching things like String.capitalize
  constructor: /\b[A-Z]\w*\b(?!\s*\.)/,
  label: {
    pattern: /\b[a-z]\w*(?=::)/,
    alias: "symbol"
  }
});
delete Prism.languages.reason.function;
(function(r4) {
  for (var e = /\/\*(?:[^*/]|\*(?!\/)|\/(?!\*)|<self>)*\*\//.source, t = 0; t < 2; t++)
    e = e.replace(/<self>/g, function() {
      return e;
    });
  e = e.replace(/<self>/g, function() {
    return /[^\s\S]/.source;
  }), r4.languages.rust = {
    comment: [
      {
        pattern: RegExp(/(^|[^\\])/.source + e),
        lookbehind: true,
        greedy: true
      },
      {
        pattern: /(^|[^\\:])\/\/.*/,
        lookbehind: true,
        greedy: true
      }
    ],
    string: {
      pattern: /b?"(?:\\[\s\S]|[^\\"])*"|b?r(#*)"(?:[^"]|"(?!\1))*"\1/,
      greedy: true
    },
    char: {
      pattern: /b?'(?:\\(?:x[0-7][\da-fA-F]|u\{(?:[\da-fA-F]_*){1,6}\}|.)|[^\\\r\n\t'])'/,
      greedy: true
    },
    attribute: {
      pattern: /#!?\[(?:[^\[\]"]|"(?:\\[\s\S]|[^\\"])*")*\]/,
      greedy: true,
      alias: "attr-name",
      inside: {
        string: null
        // see below
      }
    },
    // Closure params should not be confused with bitwise OR |
    "closure-params": {
      pattern: /([=(,:]\s*|\bmove\s*)\|[^|]*\||\|[^|]*\|(?=\s*(?:\{|->))/,
      lookbehind: true,
      greedy: true,
      inside: {
        "closure-punctuation": {
          pattern: /^\||\|$/,
          alias: "punctuation"
        },
        rest: null
        // see below
      }
    },
    "lifetime-annotation": {
      pattern: /'\w+/,
      alias: "symbol"
    },
    "fragment-specifier": {
      pattern: /(\$\w+:)[a-z]+/,
      lookbehind: true,
      alias: "punctuation"
    },
    variable: /\$\w+/,
    "function-definition": {
      pattern: /(\bfn\s+)\w+/,
      lookbehind: true,
      alias: "function"
    },
    "type-definition": {
      pattern: /(\b(?:enum|struct|trait|type|union)\s+)\w+/,
      lookbehind: true,
      alias: "class-name"
    },
    "module-declaration": [
      {
        pattern: /(\b(?:crate|mod)\s+)[a-z][a-z_\d]*/,
        lookbehind: true,
        alias: "namespace"
      },
      {
        pattern: /(\b(?:crate|self|super)\s*)::\s*[a-z][a-z_\d]*\b(?:\s*::(?:\s*[a-z][a-z_\d]*\s*::)*)?/,
        lookbehind: true,
        alias: "namespace",
        inside: {
          punctuation: /::/
        }
      }
    ],
    keyword: [
      // https://github.com/rust-lang/reference/blob/master/src/keywords.md
      /\b(?:Self|abstract|as|async|await|become|box|break|const|continue|crate|do|dyn|else|enum|extern|final|fn|for|if|impl|in|let|loop|macro|match|mod|move|mut|override|priv|pub|ref|return|self|static|struct|super|trait|try|type|typeof|union|unsafe|unsized|use|virtual|where|while|yield)\b/,
      // primitives and str
      // https://doc.rust-lang.org/stable/rust-by-example/primitives.html
      /\b(?:bool|char|f(?:32|64)|[ui](?:8|16|32|64|128|size)|str)\b/
    ],
    // functions can technically start with an upper-case letter, but this will introduce a lot of false positives
    // and Rust's naming conventions recommend snake_case anyway.
    // https://doc.rust-lang.org/1.0.0/style/style/naming/README.html
    function: /\b[a-z_]\w*(?=\s*(?:::\s*<|\())/,
    macro: {
      pattern: /\b\w+!/,
      alias: "property"
    },
    constant: /\b[A-Z_][A-Z_\d]+\b/,
    "class-name": /\b[A-Z]\w*\b/,
    namespace: {
      pattern: /(?:\b[a-z][a-z_\d]*\s*::\s*)*\b[a-z][a-z_\d]*\s*::(?!\s*<)/,
      inside: {
        punctuation: /::/
      }
    },
    // Hex, oct, bin, dec numbers with visual separators and type suffix
    number: /\b(?:0x[\dA-Fa-f](?:_?[\dA-Fa-f])*|0o[0-7](?:_?[0-7])*|0b[01](?:_?[01])*|(?:(?:\d(?:_?\d)*)?\.)?\d(?:_?\d)*(?:[Ee][+-]?\d+)?)(?:_?(?:f32|f64|[iu](?:8|16|32|64|size)?))?\b/,
    boolean: /\b(?:false|true)\b/,
    punctuation: /->|\.\.=|\.{1,3}|::|[{}[\];(),:]/,
    operator: /[-+*\/%!^]=?|=[=>]?|&[&=]?|\|[|=]?|<<?=?|>>?=?|[@?]/
  }, r4.languages.rust["closure-params"].inside.rest = r4.languages.rust, r4.languages.rust.attribute.inside.string = r4.languages.rust.string;
})(Prism);
(function(r4) {
  r4.languages.sass = r4.languages.extend("css", {
    // Sass comments don't need to be closed, only indented
    comment: {
      pattern: /^([ \t]*)\/[\/*].*(?:(?:\r?\n|\r)\1[ \t].+)*/m,
      lookbehind: true,
      greedy: true
    }
  }), r4.languages.insertBefore("sass", "atrule", {
    // We want to consume the whole line
    "atrule-line": {
      // Includes support for = and + shortcuts
      pattern: /^(?:[ \t]*)[@+=].+/m,
      greedy: true,
      inside: {
        atrule: /(?:@[\w-]+|[+=])/
      }
    }
  }), delete r4.languages.sass.atrule;
  var e = /\$[-\w]+|#\{\$[-\w]+\}/, t = [
    /[+*\/%]|[=!]=|<=?|>=?|\b(?:and|not|or)\b/,
    {
      pattern: /(\s)-(?=\s)/,
      lookbehind: true
    }
  ];
  r4.languages.insertBefore("sass", "property", {
    // We want to consume the whole line
    "variable-line": {
      pattern: /^[ \t]*\$.+/m,
      greedy: true,
      inside: {
        punctuation: /:/,
        variable: e,
        operator: t
      }
    },
    // We want to consume the whole line
    "property-line": {
      pattern: /^[ \t]*(?:[^:\s]+ *:.*|:[^:\s].*)/m,
      greedy: true,
      inside: {
        property: [
          /[^:\s]+(?=\s*:)/,
          {
            pattern: /(:)[^:\s]+/,
            lookbehind: true
          }
        ],
        punctuation: /:/,
        variable: e,
        operator: t,
        important: r4.languages.sass.important
      }
    }
  }), delete r4.languages.sass.property, delete r4.languages.sass.important, r4.languages.insertBefore("sass", "punctuation", {
    selector: {
      pattern: /^([ \t]*)\S(?:,[^,\r\n]+|[^,\r\n]*)(?:,[^,\r\n]+)*(?:,(?:\r?\n|\r)\1[ \t]+\S(?:,[^,\r\n]+|[^,\r\n]*)(?:,[^,\r\n]+)*)*/m,
      lookbehind: true,
      greedy: true
    }
  });
})(Prism);
Prism.languages.scss = Prism.languages.extend("css", {
  comment: {
    pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
    lookbehind: true
  },
  atrule: {
    pattern: /@[\w-](?:\([^()]+\)|[^()\s]|\s+(?!\s))*?(?=\s+[{;])/,
    inside: {
      rule: /@[\w-]+/
      // See rest below
    }
  },
  // url, compassified
  url: /(?:[-a-z]+-)?url(?=\()/i,
  // CSS selector regex is not appropriate for Sass
  // since there can be lot more things (var, @ directive, nesting..)
  // a selector must start at the end of a property or after a brace (end of other rules or nesting)
  // it can contain some characters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
  // the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
  // can "pass" as a selector- e.g: proper#{$erty})
  // this one was hard to do, so please be careful if you edit this one :)
  selector: {
    // Initial look-ahead is used to prevent matching of blank selectors
    pattern: /(?=\S)[^@;{}()]?(?:[^@;{}()\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/,
    inside: {
      parent: {
        pattern: /&/,
        alias: "important"
      },
      placeholder: /%[-\w]+/,
      variable: /\$[-\w]+|#\{\$[-\w]+\}/
    }
  },
  property: {
    pattern: /(?:[-\w]|\$[-\w]|#\{\$[-\w]+\})+(?=\s*:)/,
    inside: {
      variable: /\$[-\w]+|#\{\$[-\w]+\}/
    }
  }
});
Prism.languages.insertBefore("scss", "atrule", {
  keyword: [
    /@(?:content|debug|each|else(?: if)?|extend|for|forward|function|if|import|include|mixin|return|use|warn|while)\b/i,
    {
      pattern: /( )(?:from|through)(?= )/,
      lookbehind: true
    }
  ]
});
Prism.languages.insertBefore("scss", "important", {
  // var and interpolated vars
  variable: /\$[-\w]+|#\{\$[-\w]+\}/
});
Prism.languages.insertBefore("scss", "function", {
  "module-modifier": {
    pattern: /\b(?:as|hide|show|with)\b/i,
    alias: "keyword"
  },
  placeholder: {
    pattern: /%[-\w]+/,
    alias: "selector"
  },
  statement: {
    pattern: /\B!(?:default|optional)\b/i,
    alias: "keyword"
  },
  boolean: /\b(?:false|true)\b/,
  null: {
    pattern: /\bnull\b/,
    alias: "keyword"
  },
  operator: {
    pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|not|or)(?=\s)/,
    lookbehind: true
  }
});
Prism.languages.scss.atrule.inside.rest = Prism.languages.scss;
Prism.languages.solidity = Prism.languages.extend("clike", {
  "class-name": {
    pattern: /(\b(?:contract|enum|interface|library|new|struct|using)\s+)(?!\d)[\w$]+/,
    lookbehind: true
  },
  keyword: /\b(?:_|anonymous|as|assembly|assert|break|calldata|case|constant|constructor|continue|contract|default|delete|do|else|emit|enum|event|external|for|from|function|if|import|indexed|inherited|interface|internal|is|let|library|mapping|memory|modifier|new|payable|pragma|private|public|pure|require|returns?|revert|selfdestruct|solidity|storage|struct|suicide|switch|this|throw|using|var|view|while)\b/,
  operator: /=>|->|:=|=:|\*\*|\+\+|--|\|\||&&|<<=?|>>=?|[-+*/%^&|<>!=]=?|[~?]/
});
Prism.languages.insertBefore("solidity", "keyword", {
  builtin: /\b(?:address|bool|byte|u?int(?:8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?|string|bytes(?:[1-9]|[12]\d|3[0-2])?)\b/
});
Prism.languages.insertBefore("solidity", "number", {
  version: {
    pattern: /([<>]=?|\^)\d+\.\d+\.\d+\b/,
    lookbehind: true,
    alias: "number"
  }
});
Prism.languages.sol = Prism.languages.solidity;
Prism.languages.sql = {
  comment: {
    pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|(?:--|\/\/|#).*)/,
    lookbehind: true
  },
  variable: [
    {
      pattern: /@(["'`])(?:\\[\s\S]|(?!\1)[^\\])+\1/,
      greedy: true
    },
    /@[\w.$]+/
  ],
  string: {
    pattern: /(^|[^@\\])("|')(?:\\[\s\S]|(?!\2)[^\\]|\2\2)*\2/,
    greedy: true,
    lookbehind: true
  },
  identifier: {
    pattern: /(^|[^@\\])`(?:\\[\s\S]|[^`\\]|``)*`/,
    greedy: true,
    lookbehind: true,
    inside: {
      punctuation: /^`|`$/
    }
  },
  function: /\b(?:AVG|COUNT|FIRST|FORMAT|LAST|LCASE|LEN|MAX|MID|MIN|MOD|NOW|ROUND|SUM|UCASE)(?=\s*\()/i,
  // Should we highlight user defined functions too?
  keyword: /\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|AUTO_INCREMENT|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR(?:ACTER|SET)?|CHECK(?:POINT)?|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMNS?|COMMENT|COMMIT(?:TED)?|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS(?:TABLE)?|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|CYCLE|DATA(?:BASES?)?|DATE(?:TIME)?|DAY|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DELIMITERS?|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE|ELSE(?:IF)?|ENABLE|ENCLOSED|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPED?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|HOUR|IDENTITY(?:COL|_INSERT)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|INVOKER|ISOLATION|ITERATE|JOIN|KEYS?|KILL|LANGUAGE|LAST|LEAVE|LEFT|LEVEL|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|LOOP|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MINUTE|MODE|MODIFIES|MODIFY|MONTH|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL|NATURAL|NCHAR|NEXT|NO|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREPARE|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READS?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEAT(?:ABLE)?|REPLACE|REPLICATION|REQUIRE|RESIGNAL|RESTORE|RESTRICT|RETURN(?:ING|S)?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SECOND|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|SQL|START(?:ING)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED|TEXT(?:SIZE)?|THEN|TIME(?:STAMP)?|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNLOCK|UNPIVOT|UNSIGNED|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?|YEAR)\b/i,
  boolean: /\b(?:FALSE|NULL|TRUE)\b/i,
  number: /\b0x[\da-f]+\b|\b\d+(?:\.\d*)?|\B\.\d+\b/i,
  operator: /[-+*\/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|DIV|ILIKE|IN|IS|LIKE|NOT|OR|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,
  punctuation: /[;[\]()`,.]/
};
(function(r4) {
  var e = {
    pattern: /(\b\d+)(?:%|[a-z]+)/,
    lookbehind: true
  }, t = {
    pattern: /(^|[^\w.-])-?(?:\d+(?:\.\d+)?|\.\d+)/,
    lookbehind: true
  }, a = {
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
      lookbehind: true
    },
    url: {
      pattern: /\burl\((["']?).*?\1\)/i,
      greedy: true
    },
    string: {
      pattern: /("|')(?:(?!\1)[^\\\r\n]|\\(?:\r\n|[\s\S]))*\1/,
      greedy: true
    },
    interpolation: null,
    // See below
    func: null,
    // See below
    important: /\B!(?:important|optional)\b/i,
    keyword: {
      pattern: /(^|\s+)(?:(?:else|for|if|return|unless)(?=\s|$)|@[\w-]+)/,
      lookbehind: true
    },
    hexcode: /#[\da-f]{3,6}/i,
    color: [
      /\b(?:AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGr[ae]y|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGr[ae]y|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGr[ae]y|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gr[ae]y|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGr[ae]y|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGr[ae]y|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGr[ae]y|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Transparent|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)\b/i,
      {
        pattern: /\b(?:hsl|rgb)\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*\)\B|\b(?:hsl|rgb)a\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?\s*,\s*(?:0|0?\.\d+|1)\s*\)\B/i,
        inside: {
          unit: e,
          number: t,
          function: /[\w-]+(?=\()/,
          punctuation: /[(),]/
        }
      }
    ],
    entity: /\\[\da-f]{1,8}/i,
    unit: e,
    boolean: /\b(?:false|true)\b/,
    operator: [
      // We want non-word chars around "-" because it is
      // accepted in property names.
      /~|[+!\/%<>?=]=?|[-:]=|\*[*=]?|\.{2,3}|&&|\|\||\B-\B|\b(?:and|in|is(?: a| defined| not|nt)?|not|or)\b/
    ],
    number: t,
    punctuation: /[{}()\[\];:,]/
  };
  a.interpolation = {
    pattern: /\{[^\r\n}:]+\}/,
    alias: "variable",
    inside: {
      delimiter: {
        pattern: /^\{|\}$/,
        alias: "punctuation"
      },
      rest: a
    }
  }, a.func = {
    pattern: /[\w-]+\([^)]*\).*/,
    inside: {
      function: /^[^(]+/,
      rest: a
    }
  }, r4.languages.stylus = {
    "atrule-declaration": {
      pattern: /(^[ \t]*)@.+/m,
      lookbehind: true,
      inside: {
        atrule: /^@[\w-]+/,
        rest: a
      }
    },
    "variable-declaration": {
      pattern: /(^[ \t]*)[\w$-]+\s*.?=[ \t]*(?:\{[^{}]*\}|\S.*|$)/m,
      lookbehind: true,
      inside: {
        variable: /^\S+/,
        rest: a
      }
    },
    statement: {
      pattern: /(^[ \t]*)(?:else|for|if|return|unless)[ \t].+/m,
      lookbehind: true,
      inside: {
        keyword: /^\S+/,
        rest: a
      }
    },
    // A property/value pair cannot end with a comma or a brace
    // It cannot have indented content unless it ended with a semicolon
    "property-declaration": {
      pattern: /((?:^|\{)([ \t]*))(?:[\w-]|\{[^}\r\n]+\})+(?:\s*:\s*|[ \t]+)(?!\s)[^{\r\n]*(?:;|[^{\r\n,]$(?!(?:\r?\n|\r)(?:\{|\2[ \t])))/m,
      lookbehind: true,
      inside: {
        property: {
          pattern: /^[^\s:]+/,
          inside: {
            interpolation: a.interpolation
          }
        },
        rest: a
      }
    },
    // A selector can contain parentheses only as part of a pseudo-element
    // It can span multiple lines.
    // It must end with a comma or an accolade or have indented content.
    selector: {
      pattern: /(^[ \t]*)(?:(?=\S)(?:[^{}\r\n:()]|::?[\w-]+(?:\([^)\r\n]*\)|(?![\w-]))|\{[^}\r\n]+\})+)(?:(?:\r?\n|\r)(?:\1(?:(?=\S)(?:[^{}\r\n:()]|::?[\w-]+(?:\([^)\r\n]*\)|(?![\w-]))|\{[^}\r\n]+\})+)))*(?:,$|\{|(?=(?:\r?\n|\r)(?:\{|\1[ \t])))/m,
      lookbehind: true,
      inside: {
        interpolation: a.interpolation,
        comment: a.comment,
        punctuation: /[{},]/
      }
    },
    func: a.func,
    string: a.string,
    comment: {
      pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
      lookbehind: true,
      greedy: true
    },
    interpolation: a.interpolation,
    punctuation: /[{}()\[\];:.]/
  };
})(Prism);
Prism.languages.swift = {
  comment: {
    // Nested comments are supported up to 2 levels
    pattern: /(^|[^\\:])(?:\/\/.*|\/\*(?:[^/*]|\/(?!\*)|\*(?!\/)|\/\*(?:[^*]|\*(?!\/))*\*\/)*\*\/)/,
    lookbehind: true,
    greedy: true
  },
  "string-literal": [
    // https://docs.swift.org/swift-book/LanguageGuide/StringsAndCharacters.html
    {
      pattern: RegExp(
        /(^|[^"#])/.source + "(?:" + /"(?:\\(?:\((?:[^()]|\([^()]*\))*\)|\r\n|[^(])|[^\\\r\n"])*"/.source + "|" + /"""(?:\\(?:\((?:[^()]|\([^()]*\))*\)|[^(])|[^\\"]|"(?!""))*"""/.source + ")" + /(?!["#])/.source
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        interpolation: {
          pattern: /(\\\()(?:[^()]|\([^()]*\))*(?=\))/,
          lookbehind: true,
          inside: null
          // see below
        },
        "interpolation-punctuation": {
          pattern: /^\)|\\\($/,
          alias: "punctuation"
        },
        punctuation: /\\(?=[\r\n])/,
        string: /[\s\S]+/
      }
    },
    {
      pattern: RegExp(
        /(^|[^"#])(#+)/.source + "(?:" + /"(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|\r\n|[^#])|[^\\\r\n])*?"/.source + "|" + /"""(?:\\(?:#+\((?:[^()]|\([^()]*\))*\)|[^#])|[^\\])*?"""/.source + ")\\2"
      ),
      lookbehind: true,
      greedy: true,
      inside: {
        interpolation: {
          pattern: /(\\#+\()(?:[^()]|\([^()]*\))*(?=\))/,
          lookbehind: true,
          inside: null
          // see below
        },
        "interpolation-punctuation": {
          pattern: /^\)|\\#+\($/,
          alias: "punctuation"
        },
        string: /[\s\S]+/
      }
    }
  ],
  directive: {
    // directives with conditions
    pattern: RegExp(
      /#/.source + "(?:" + (/(?:elseif|if)\b/.source + "(?:[ 	]*" + /(?:![ \t]*)?(?:\b\w+\b(?:[ \t]*\((?:[^()]|\([^()]*\))*\))?|\((?:[^()]|\([^()]*\))*\))(?:[ \t]*(?:&&|\|\|))?/.source + ")+") + "|" + /(?:else|endif)\b/.source + ")"
    ),
    alias: "property",
    inside: {
      "directive-name": /^#\w+/,
      boolean: /\b(?:false|true)\b/,
      number: /\b\d+(?:\.\d+)*\b/,
      operator: /!|&&|\|\||[<>]=?/,
      punctuation: /[(),]/
    }
  },
  literal: {
    pattern: /#(?:colorLiteral|column|dsohandle|file(?:ID|Literal|Path)?|function|imageLiteral|line)\b/,
    alias: "constant"
  },
  "other-directive": {
    pattern: /#\w+\b/,
    alias: "property"
  },
  attribute: {
    pattern: /@\w+/,
    alias: "atrule"
  },
  "function-definition": {
    pattern: /(\bfunc\s+)\w+/,
    lookbehind: true,
    alias: "function"
  },
  label: {
    // https://docs.swift.org/swift-book/LanguageGuide/ControlFlow.html#ID141
    pattern: /\b(break|continue)\s+\w+|\b[a-zA-Z_]\w*(?=\s*:\s*(?:for|repeat|while)\b)/,
    lookbehind: true,
    alias: "important"
  },
  keyword: /\b(?:Any|Protocol|Self|Type|actor|as|assignment|associatedtype|associativity|async|await|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic|else|enum|extension|fallthrough|fileprivate|final|for|func|get|guard|higherThan|if|import|in|indirect|infix|init|inout|internal|is|isolated|lazy|left|let|lowerThan|mutating|none|nonisolated|nonmutating|open|operator|optional|override|postfix|precedencegroup|prefix|private|protocol|public|repeat|required|rethrows|return|right|safe|self|set|some|static|struct|subscript|super|switch|throw|throws|try|typealias|unowned|unsafe|var|weak|where|while|willSet)\b/,
  boolean: /\b(?:false|true)\b/,
  nil: {
    pattern: /\bnil\b/,
    alias: "constant"
  },
  "short-argument": /\$\d+\b/,
  omit: {
    pattern: /\b_\b/,
    alias: "keyword"
  },
  number: /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
  // A class name must start with an upper-case letter and be either 1 letter long or contain a lower-case letter.
  "class-name": /\b[A-Z](?:[A-Z_\d]*[a-z]\w*)?\b/,
  function: /\b[a-z_]\w*(?=\s*\()/i,
  constant: /\b(?:[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
  // Operators are generic in Swift. Developers can even create new operators (e.g. +++).
  // https://docs.swift.org/swift-book/ReferenceManual/zzSummaryOfTheGrammar.html#ID481
  // This regex only supports ASCII operators.
  operator: /[-+*/%=!<>&|^~?]+|\.[.\-+*/%=!<>&|^~?]+/,
  punctuation: /[{}[\]();,.:\\]/
};
Prism.languages.swift["string-literal"].forEach(function(r4) {
  r4.inside.interpolation.inside = Prism.languages.swift;
});
Prism.languages.wasm = {
  comment: [
    /\(;[\s\S]*?;\)/,
    {
      pattern: /;;.*/,
      greedy: true
    }
  ],
  string: {
    pattern: /"(?:\\[\s\S]|[^"\\])*"/,
    greedy: true
  },
  keyword: [
    {
      pattern: /\b(?:align|offset)=/,
      inside: {
        operator: /=/
      }
    },
    {
      pattern: /\b(?:(?:f32|f64|i32|i64)(?:\.(?:abs|add|and|ceil|clz|const|convert_[su]\/i(?:32|64)|copysign|ctz|demote\/f64|div(?:_[su])?|eqz?|extend_[su]\/i32|floor|ge(?:_[su])?|gt(?:_[su])?|le(?:_[su])?|load(?:(?:8|16|32)_[su])?|lt(?:_[su])?|max|min|mul|neg?|nearest|or|popcnt|promote\/f32|reinterpret\/[fi](?:32|64)|rem_[su]|rot[lr]|shl|shr_[su]|sqrt|store(?:8|16|32)?|sub|trunc(?:_[su]\/f(?:32|64))?|wrap\/i64|xor))?|memory\.(?:grow|size))\b/,
      inside: {
        punctuation: /\./
      }
    },
    /\b(?:anyfunc|block|br(?:_if|_table)?|call(?:_indirect)?|data|drop|elem|else|end|export|func|get_(?:global|local)|global|if|import|local|loop|memory|module|mut|nop|offset|param|result|return|select|set_(?:global|local)|start|table|tee_local|then|type|unreachable)\b/
  ],
  variable: /\$[\w!#$%&'*+\-./:<=>?@\\^`|~]+/,
  number: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/,
  punctuation: /[()]/
};
(function(r4) {
  var e = /[*&][^\s[\]{},]+/, t = /!(?:<[\w\-%#;/?:@&=+$,.!~*'()[\]]+>|(?:[a-zA-Z\d-]*!)?[\w\-%#;/?:@&=+$.~*'()]+)?/, a = "(?:" + t.source + "(?:[ 	]+" + e.source + ")?|" + e.source + "(?:[ 	]+" + t.source + ")?)", n = /(?:[^\s\x00-\x08\x0e-\x1f!"#%&'*,\-:>?@[\]`{|}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]|[?:-]<PLAIN>)(?:[ \t]*(?:(?![#:])<PLAIN>|:<PLAIN>))*/.source.replace(/<PLAIN>/g, function() {
    return /[^\s\x00-\x08\x0e-\x1f,[\]{}\x7f-\x84\x86-\x9f\ud800-\udfff\ufffe\uffff]/.source;
  }), i = /"(?:[^"\\\r\n]|\\.)*"|'(?:[^'\\\r\n]|\\.)*'/.source;
  function o(u, c) {
    c = (c || "").replace(/m/g, "") + "m";
    var m = /([:\-,[{]\s*(?:\s<<prop>>[ \t]+)?)(?:<<value>>)(?=[ \t]*(?:$|,|\]|\}|(?:[\r\n]\s*)?#))/.source.replace(/<<prop>>/g, function() {
      return a;
    }).replace(/<<value>>/g, function() {
      return u;
    });
    return RegExp(m, c);
  }
  r4.languages.yaml = {
    scalar: {
      pattern: RegExp(/([\-:]\s*(?:\s<<prop>>[ \t]+)?[|>])[ \t]*(?:((?:\r?\n|\r)[ \t]+)\S[^\r\n]*(?:\2[^\r\n]+)*)/.source.replace(/<<prop>>/g, function() {
        return a;
      })),
      lookbehind: true,
      alias: "string"
    },
    comment: /#.*/,
    key: {
      pattern: RegExp(/((?:^|[:\-,[{\r\n?])[ \t]*(?:<<prop>>[ \t]+)?)<<key>>(?=\s*:\s)/.source.replace(/<<prop>>/g, function() {
        return a;
      }).replace(/<<key>>/g, function() {
        return "(?:" + n + "|" + i + ")";
      })),
      lookbehind: true,
      greedy: true,
      alias: "atrule"
    },
    directive: {
      pattern: /(^[ \t]*)%.+/m,
      lookbehind: true,
      alias: "important"
    },
    datetime: {
      pattern: o(/\d{4}-\d\d?-\d\d?(?:[tT]|[ \t]+)\d\d?:\d{2}:\d{2}(?:\.\d*)?(?:[ \t]*(?:Z|[-+]\d\d?(?::\d{2})?))?|\d{4}-\d{2}-\d{2}|\d\d?:\d{2}(?::\d{2}(?:\.\d*)?)?/.source),
      lookbehind: true,
      alias: "number"
    },
    boolean: {
      pattern: o(/false|true/.source, "i"),
      lookbehind: true,
      alias: "important"
    },
    null: {
      pattern: o(/null|~/.source, "i"),
      lookbehind: true,
      alias: "important"
    },
    string: {
      pattern: o(i),
      lookbehind: true,
      greedy: true
    },
    number: {
      pattern: o(/[+-]?(?:0x[\da-f]+|0o[0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|\.inf|\.nan)/.source, "i"),
      lookbehind: true
    },
    tag: t,
    important: e,
    punctuation: /---|[:[\]{}\-,|>?]|\.\.\./
  }, r4.languages.yml = r4.languages.yaml;
})(Prism);
const ol = {
  key: 0,
  class: /* @__PURE__ */ normalizeClass(["notion-code"])
}, ul = {
  key: 1,
  class: /* @__PURE__ */ normalizeClass(["notion-code"])
}, cl = {
  name: "NotionCode"
}, dl = /* @__PURE__ */ defineComponent({
  ...cl,
  props: { overrideLang: String, overrideLangClass: String, ...oe },
  setup(r4) {
    const e = r4, { properties: t } = ue(e), a = computed(() => {
      var _a2, _b, _c, _d;
      return e.overrideLang || ((_d = (_c = (_b = (_a2 = t.value) == null ? void 0 : _a2.language) == null ? void 0 : _b[0]) == null ? void 0 : _c[0]) == null ? void 0 : _d.toLowerCase());
    }), n = computed(() => e.overrideLangClass || `language-${a.value}`), i = computed(() => a.value ? Vt == null ? void 0 : Vt.languages[a.value] : false), o = computed(() => {
      var _a2;
      return (_a2 = t.value) == null ? void 0 : _a2.title.map((u) => u == null ? void 0 : u[0]).join("");
    });
    return (u, c) => i.value ? (openBlock(), createElementBlock("div", ol, [
      createVNode(ll, { language: a.value }, {
        default: withCtx(() => [
          createTextVNode(toDisplayString(o.value), 1)
        ]),
        _: 1
      }, 8, ["language"])
    ])) : (openBlock(), createElementBlock("div", ul, [
      createElementVNode("pre", null, [
        createElementVNode("div", {
          class: normalizeClass(n.value)
        }, toDisplayString(o.value), 3)
      ])
    ]));
  }
}), hl = { key: 0 }, ml = {
  name: "NotionEquation"
}, pl = /* @__PURE__ */ defineComponent({
  ...ml,
  props: { ...oe },
  setup(r4) {
    const e = r4, { properties: t, pass: a } = ue(e), n = computed(() => {
      var _a2, _b;
      return (_b = (_a2 = t.value.title) == null ? void 0 : _a2[0]) == null ? void 0 : _b[0];
    });
    return (i, o) => e.katex ? (openBlock(), createElementBlock("div", hl, [
      createVNode(ln, { expression: n.value }, null, 8, ["expression"])
    ])) : (openBlock(), createBlock(dl, mergeProps({ key: 1 }, unref(a), {
      overrideLang: "latex",
      overrideLangClass: "language-latex"
    }), null, 16));
  }
}), fl = ["src", "allow"], gl = {
  name: "NotionAsset"
}, vl = /* @__PURE__ */ defineComponent({
  ...gl,
  props: { ...oe },
  setup(r4) {
    const e = r4, { properties: t, f: a, format: n } = ue(e), i = computed(() => {
      var _a2, _b;
      return a.value.display_source ?? ((_b = (_a2 = t.value) == null ? void 0 : _a2.source) == null ? void 0 : _b[0]);
    }), o = computed(() => {
      let u = a.value.block_width == 1 || a.value.block_height == 1 ? 1 / a.value.block_aspect_ratio : `${a.value.block_width} / ${a.value.block_height} `;
      return {
        width: n.value.block_full_width ? "calc(100vw - 46px)" : n.value.block_page_width ? "100%" : `${a.value.block_width}px`,
        height: a.value.block_height == 1 ? "auto" : `${a.value.block_height}px`,
        maxWidth: "100%",
        position: "relative",
        aspectRatio: a.value.block_height == 1 ? u : void 0
      };
    });
    return (u, c) => i.value ? (openBlock(), createElementBlock("div", {
      key: 0,
      style: normalizeStyle(o.value)
    }, [
      createElementVNode("iframe", {
        class: "notion-asset-object-fit",
        src: i.value,
        allow: e.embedAllow
      }, null, 8, fl)
    ], 4)) : createCommentVNode("", true);
  }
}), bl = ["alt", "src"], yl = ["alt", "src"], wl = {
  name: "NotionImage"
}, xl = /* @__PURE__ */ defineComponent({
  ...wl,
  props: { ...oe },
  setup(r4) {
    const e = r4, { caption: t, properties: a, block: n, f: i } = ue(e), o = computed(() => {
      var _a2;
      return (_a2 = t == null ? void 0 : t.value) == null ? void 0 : _a2[0][0];
    }), u = computed(() => {
      var _a2;
      return e.mapImageUrl((_a2 = a.value) == null ? void 0 : _a2.source[0][0], n.value);
    }), c = computed(() => {
      let p = i.value.block_width == 1 || i.value.block_height == 1 ? 1 / i.value.block_aspect_ratio : `${i.value.block_width} / ${i.value.block_height} `;
      return {
        width: `${i.value.block_width}px`,
        height: "100%",
        maxWidth: "100%",
        position: "relative",
        aspectRatio: p
      };
    }), m = computed(() => ({
      width: i.value.block_width == 1 ? "100%" : `${i.value.block_width}px`,
      height: i.value.block_height == 1 ? "100%" : `${i.value.block_height}px`
    }));
    return (p, v) => unref(i).block_aspect_ratio ? (openBlock(), createElementBlock("div", {
      key: 0,
      style: normalizeStyle(c.value)
    }, [
      createElementVNode("img", {
        class: "notion-image-inset",
        alt: o.value || "Notion image",
        src: u.value
      }, null, 8, bl)
    ], 4)) : (openBlock(), createElementBlock("img", {
      key: 1,
      alt: o.value,
      src: u.value,
      style: normalizeStyle(m.value)
    }, null, 12, yl));
  }
});
const ot = "undefined" < "u";
function jt(r4) {
  return getCurrentScope() ? (onScopeDispose(r4), true) : false;
}
function kl(r4, e = 1e3, t = {}) {
  const {
    immediate: a = true,
    immediateCallback: n = false
  } = t;
  let i = null;
  const o = ref(false);
  function u() {
    i && (clearInterval(i), i = null);
  }
  function c() {
    o.value = false, u();
  }
  function m() {
    unref(e) <= 0 || (o.value = true, n && r4(), u(), i = setInterval(r4, unref(e)));
  }
  if (isRef(e)) {
    const p = watch(e, () => {
      o.value && ot;
    });
    jt(p);
  }
  return jt(c), {
    isActive: o,
    pause: c,
    resume: m
  };
}
const Sl = void 0, ea = typeof globalThis < "u" ? globalThis : typeof global < "u" ? global : typeof self < "u" ? self : {}, ta = "__vueuse_ssr_handlers__";
ea[ta] = ea[ta] || {};
function Al(r4, e = {}) {
  const {
    immediate: t = true,
    window: a = Sl
  } = e, n = ref(false);
  let i = null;
  function o() {
    !n.value || !a || (r4(), i = a.requestAnimationFrame(o));
  }
  function u() {
    !n.value && a && (n.value = true, o());
  }
  function c() {
    n.value = false, i != null && a && (a.cancelAnimationFrame(i), i = null);
  }
  return t && u(), jt(c), {
    isActive: n,
    pause: c,
    resume: u
  };
}
var Tl = Object.defineProperty, ra = Object.getOwnPropertySymbols, _l = Object.prototype.hasOwnProperty, El = Object.prototype.propertyIsEnumerable, aa = (r4, e, t) => e in r4 ? Tl(r4, e, { enumerable: true, configurable: true, writable: true, value: t }) : r4[e] = t, Ml = (r4, e) => {
  for (var t in e || (e = {}))
    _l.call(e, t) && aa(r4, t, e[t]);
  if (ra)
    for (var t of ra(e))
      El.call(e, t) && aa(r4, t, e[t]);
  return r4;
};
function zl(r4 = {}) {
  const {
    controls: e = false,
    interval: t = "requestAnimationFrame"
  } = r4, a = ref(/* @__PURE__ */ new Date()), n = () => a.value = /* @__PURE__ */ new Date(), i = t === "requestAnimationFrame" ? Al(n, { immediate: true }) : kl(n, t, { immediate: true });
  return e ? Ml({
    now: a
  }, i) : a;
}
var na;
(function(r4) {
  r4.UP = "UP", r4.RIGHT = "RIGHT", r4.DOWN = "DOWN", r4.LEFT = "LEFT", r4.NONE = "NONE";
})(na || (na = {}));
var Nl = Object.defineProperty, ut = Object.getOwnPropertySymbols, un = Object.prototype.hasOwnProperty, cn = Object.prototype.propertyIsEnumerable, ia = (r4, e, t) => e in r4 ? Nl(r4, e, { enumerable: true, configurable: true, writable: true, value: t }) : r4[e] = t, Cl = (r4, e) => {
  for (var t in e || (e = {}))
    un.call(e, t) && ia(r4, t, e[t]);
  if (ut)
    for (var t of ut(e))
      cn.call(e, t) && ia(r4, t, e[t]);
  return r4;
}, Dl = (r4, e) => {
  var t = {};
  for (var a in r4)
    un.call(r4, a) && e.indexOf(a) < 0 && (t[a] = r4[a]);
  if (r4 != null && ut)
    for (var a of ut(r4))
      e.indexOf(a) < 0 && cn.call(r4, a) && (t[a] = r4[a]);
  return t;
};
const sa = [
  { max: 6e4, value: 1e3, name: "second" },
  { max: 276e4, value: 6e4, name: "minute" },
  { max: 72e6, value: 36e5, name: "hour" },
  { max: 5184e5, value: 864e5, name: "day" },
  { max: 24192e5, value: 6048e5, name: "week" },
  { max: 28512e6, value: 2592e6, name: "month" },
  { max: 1 / 0, value: 31536e6, name: "year" }
], Rl = {
  justNow: "just now",
  past: (r4) => r4.match(/\d/) ? `${r4} ago` : r4,
  future: (r4) => r4.match(/\d/) ? `in ${r4}` : r4,
  month: (r4, e) => r4 === 1 ? e ? "last month" : "next month" : `${r4} month${r4 > 1 ? "s" : ""}`,
  year: (r4, e) => r4 === 1 ? e ? "last year" : "next year" : `${r4} year${r4 > 1 ? "s" : ""}`,
  day: (r4, e) => r4 === 1 ? e ? "yesterday" : "tomorrow" : `${r4} day${r4 > 1 ? "s" : ""}`,
  week: (r4, e) => r4 === 1 ? e ? "last week" : "next week" : `${r4} week${r4 > 1 ? "s" : ""}`,
  hour: (r4) => `${r4} hour${r4 > 1 ? "s" : ""}`,
  minute: (r4) => `${r4} minute${r4 > 1 ? "s" : ""}`,
  second: (r4) => `${r4} second${r4 > 1 ? "s" : ""}`
}, Il = (r4) => r4.toISOString().slice(0, 10);
function Bl(r4, e = {}) {
  const {
    controls: t = false,
    max: a,
    updateInterval: n = 3e4,
    messages: i = Rl,
    fullDateFormatter: o = Il
  } = e, { abs: u, round: c } = Math, m = zl({ interval: n, controls: true }), { now: p } = m, v = Dl(m, ["now"]);
  function k(_, M) {
    var b;
    const y = +M - +_, E = u(y);
    if (E < 6e4)
      return i.justNow;
    if (typeof a == "number" && E > a)
      return o(new Date(_));
    if (typeof a == "string") {
      const N = (b = sa.find((C) => C.name === a)) == null ? void 0 : b.max;
      if (N && E > N)
        return o(new Date(_));
    }
    for (const N of sa)
      if (E < N.max)
        return z(y, N);
  }
  function S(_, M, b) {
    const y = i[_];
    return typeof y == "function" ? y(M, b) : y.replace("{0}", M.toString());
  }
  function z(_, M) {
    const b = c(u(_) / M.value), y = _ > 0, E = S(M.name, b, y);
    return S(y ? "past" : "future", E, y);
  }
  const T = computed(() => k(new Date(unref(r4)), unref(p.value)));
  return t ? Cl({
    timeAgo: T
  }, v) : T;
}
const Ol = { class: "notion-google-drive" }, Ll = ["href"], $l = { class: "notion-google-drive-preview" }, Fl = ["src", "alt"], Pl = { className: "notion-google-drive-body" }, ql = { className: "notion-google-drive-body-title" }, Hl = { className: "notion-google-drive-body-modified-time" }, Gl = { className: "notion-google-drive-body-source" }, Ul = { className: "notion-google-drive-body-source-domain" }, Vl = {
  name: "NotionGoogleDrive"
}, jl = /* @__PURE__ */ defineComponent({
  ...Vl,
  props: { ...oe },
  setup(r4) {
    const e = r4, { format: t, block: a } = ue(e), o = computed(() => t.value.drive_properties), u = (m) => {
      if (!m)
        return;
      const p = new URLSearchParams({
        table: "block",
        id: a.value.value.id,
        cache: "v2"
      });
      return "https://www.notion.so/image/" + encodeURIComponent(m) + "?" + p;
    }, c = (m) => {
      if (m)
        return new URL(m).hostname;
    };
    return (m, p) => (openBlock(), createElementBlock("div", Ol, [
      createElementVNode("a", {
        rel: "noopener noreferrer",
        target: "_blank",
        href: o.value.url,
        class: "notion-google-drive-link"
      }, [
        createElementVNode("div", $l, [
          createElementVNode("img", {
            src: u(o.value.thumbnail),
            alt: o.value.title
          }, null, 8, Fl)
        ]),
        createElementVNode("div", Pl, [
          createElementVNode("div", ql, toDisplayString(o.value.title), 1),
          createElementVNode("div", Hl, " Last modified " + toDisplayString(o.value.user_name ? `by ${o.value.user_name} ` : "") + " " + toDisplayString(unref(Bl)(o.value.modified_time).value), 1),
          createElementVNode("div", Gl, [
            createElementVNode("div", {
              className: "notion-google-drive-body-source-icon",
              style: normalizeStyle({ backgroundImage: "url(" + o.value.icon + ")" })
            }, null, 4),
            createElementVNode("div", Ul, toDisplayString(c(o.value.url)), 1)
          ])
        ])
      ], 8, Ll)
    ]));
  }
}), Yl = {
  key: 3,
  class: "notion-image-caption"
}, Wl = {
  name: "NotionFigure"
}, Xl = /* @__PURE__ */ defineComponent({
  ...Wl,
  props: { ...oe },
  setup(r4) {
    const e = r4, { pass: t, caption: n, isType: i } = ue(e);
    return (o, u) => (openBlock(), createElementBlock("figure", {
      class: "notion-asset-wrapper",
      style: normalizeStyle([unref(i)("image") ? "width:100%" : ""])
    }, [
      unref(i)("image") ? (openBlock(), createBlock(xl, normalizeProps(mergeProps({ key: 0 }, unref(t))), null, 16)) : unref(i)(["embed", "video", "figma", "maps"]) ? (openBlock(), createBlock(vl, normalizeProps(mergeProps({ key: 1 }, unref(t))), null, 16)) : unref(i)("drive") ? (openBlock(), createBlock(jl, normalizeProps(mergeProps({ key: 2 }, unref(t))), null, 16)) : createCommentVNode("", true),
      unref(n) ? (openBlock(), createElementBlock("figcaption", Yl, [
        createVNode(we, mergeProps({ text: unref(n) }, unref(t)), null, 16, ["text"])
      ])) : createCommentVNode("", true)
    ], 4));
  }
}), Zl = ["id"], Kl = ["id"], Jl = ["id"], Ql = {
  name: "NotionHeaderRenderer"
}, la = /* @__PURE__ */ defineComponent({
  ...Ql,
  props: { ...oe },
  setup(r4) {
    const e = r4, { type: t, title: a, pass: n, block: i } = ue(e);
    return (o, u) => unref(t) === "header" ? (openBlock(), createElementBlock("h1", {
      key: 0,
      class: "notion-h1",
      id: unref(i).value.id
    }, [
      createVNode(we, mergeProps({ text: unref(a) }, unref(n)), null, 16, ["text"])
    ], 8, Zl)) : unref(t) === "sub_header" ? (openBlock(), createElementBlock("h2", {
      key: 1,
      class: "notion-h2",
      id: unref(i).value.id
    }, [
      createVNode(we, mergeProps({ text: unref(a) }, unref(n)), null, 16, ["text"])
    ], 8, Kl)) : unref(t) === "sub_sub_header" ? (openBlock(), createElementBlock("h3", {
      key: 2,
      class: "notion-h3",
      id: unref(i).value.id
    }, [
      createVNode(we, mergeProps({ text: unref(a) }, unref(n)), null, 16, ["text"])
    ], 8, Jl)) : createCommentVNode("", true);
  }
}), eo = {
  key: 0,
  class: "notion-toggle"
}, to = {
  name: "NotionHeader"
}, ro = /* @__PURE__ */ defineComponent({
  ...to,
  props: { ...oe },
  setup(r4) {
    const e = r4, { pass: n, block: i, format: o } = ue(e);
    return (u, c) => {
      var _a2;
      return ((_a2 = unref(o)) == null ? void 0 : _a2.toggleable) ? (openBlock(), createElementBlock("details", eo, [
        createElementVNode("summary", null, [
          createVNode(la, mergeProps({ class: "notion-h" }, unref(n)), null, 16)
        ]),
        createElementVNode("div", null, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(i).value.content, (m, p) => (openBlock(), createBlock(ft, mergeProps({ ref_for: true }, unref(n), {
            key: m,
            level: unref(n).level + 1,
            "content-id": m,
            "content-index": p
          }), null, 16, ["level", "content-id", "content-index"]))), 128))
        ])
      ])) : (openBlock(), createBlock(la, normalizeProps(mergeProps({ key: 1 }, unref(n))), null, 16));
    };
  }
}), ao = {
  key: 0,
  class: "notion-list notion-list-disc"
}, no = {
  key: 1,
  class: "notion-list notion-list-numbered"
}, io = {
  name: "NotionNestedList"
}, Rt = /* @__PURE__ */ defineComponent({
  ...io,
  props: { ...oe },
  setup(r4) {
    const e = r4, { type: a } = ue(e);
    return (n, i) => unref(a) === "bulleted_list" ? (openBlock(), createElementBlock("ul", ao, [
      renderSlot(n.$slots, "default")
    ])) : (openBlock(), createElementBlock("ol", no, [
      renderSlot(n.$slots, "default")
    ]));
  }
}), so = {
  key: 0,
  class: "notion-list notion-list-disc"
}, lo = ["start"], oo = { key: 2 }, uo = {
  name: "NotionList"
}, co = /* @__PURE__ */ defineComponent({
  ...uo,
  props: { ...oe },
  setup(r4) {
    const e = r4, { block: t, type: a, title: n, pass: i } = ue(e), o = computed(() => {
      var _a2, _b, _c;
      return e.blockMap ? ((_c = (_b = (_a2 = t.value) == null ? void 0 : _a2.value) == null ? void 0 : _b.format) == null ? void 0 : _c.list_start_index) || bn(t.value.value.id, e.blockMap) : 0;
    }), u = computed(() => {
      var _a2;
      return a.value != ((_a2 = e.blockMap) == null ? void 0 : _a2[t.value.value.parent_id].value.type);
    });
    return (c, m) => u.value && unref(a) === "bulleted_list" ? (openBlock(), createElementBlock("ul", so, [
      createElementVNode("li", null, [
        createVNode(we, mergeProps({ text: unref(n) }, unref(i)), null, 16, ["text"])
      ]),
      unref(t).value.content ? (openBlock(), createBlock(Rt, normalizeProps(mergeProps({ key: 0 }, unref(i))), {
        default: withCtx(() => [
          renderSlot(c.$slots, "default")
        ]),
        _: 3
      }, 16)) : createCommentVNode("", true)
    ])) : u.value && unref(a) === "numbered_list" ? (openBlock(), createElementBlock("ol", {
      key: 1,
      class: "notion-list notion-list-numbered",
      start: o.value
    }, [
      createElementVNode("li", null, [
        createVNode(we, mergeProps({ text: unref(n) }, unref(i)), null, 16, ["text"])
      ]),
      unref(t).value.content ? (openBlock(), createBlock(Rt, mergeProps({
        key: 0,
        class: [c.level == 1 ? "notion-list-flat" : ""]
      }, unref(i)), {
        default: withCtx(() => [
          renderSlot(c.$slots, "default")
        ]),
        _: 3
      }, 16, ["class"])) : createCommentVNode("", true)
    ], 8, lo)) : (openBlock(), createElementBlock("span", oo, [
      createElementVNode("li", {
        class: normalizeClass([c.level != 1 ? "notion-list-indent" : ""])
      }, [
        createVNode(we, mergeProps({ text: unref(n) }, unref(i)), null, 16, ["text"])
      ], 2),
      unref(t).value.content ? (openBlock(), createBlock(Rt, normalizeProps(mergeProps({ key: 0 }, unref(i))), {
        default: withCtx(() => [
          renderSlot(c.$slots, "default")
        ]),
        _: 3
      }, 16)) : createCommentVNode("", true)
    ]));
  }
}), ho = ["alt", "src"], mo = { class: "notion-title" }, po = {
  key: 1,
  class: "notion"
}, fo = { class: "notion-page-icon" }, go = { class: "notion-page-text" }, vo = ["target", "href"], bo = { class: "notion-page-icon" }, yo = { class: "notion-page-text" }, wo = {
  name: "NotionPage"
}, xo = /* @__PURE__ */ defineComponent({
  ...wo,
  props: { ...oe },
  setup(r4) {
    const e = r4, { format: t, title: a, block: n, pass: i, hasPageLinkOptions: o, pageLinkProps: u } = ue(e), c = computed(() => ({ objectPosition: `center ${(1 - (t.value.page_cover_position || 0.5)) * 100}%` })), m = computed(() => {
      var _a2;
      let p = ((_a2 = n.value.value.format) == null ? void 0 : _a2.page_font) || "";
      if (p == "serif")
        return { fontFamily: "Lyon-Text, Georgia, ui-serif, serif" };
      if (p == "mono")
        return { fontFamily: "iawriter-mono, Nitti, Menlo, Courier, monospace" };
    });
    return (p, v) => {
      var _a2;
      return e.level === 0 && e.fullPage ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: "notion",
        style: normalizeStyle(m.value)
      }, [
        unref(t) && unref(t).page_cover ? (openBlock(), createElementBlock("img", {
          key: 0,
          class: "notion-page-cover",
          style: normalizeStyle(c.value),
          alt: unref(rt)(unref(a)),
          src: e.mapImageUrl(unref(t).page_cover, unref(n))
        }, null, 12, ho)) : createCommentVNode("", true),
        createElementVNode("main", {
          class: normalizeClass([
            "notion-page",
            unref(t) && !unref(t).page_cover && "notion-page-offset",
            unref(t) && unref(t).page_full_width && "notion-full-width",
            unref(t) && unref(t).page_small_text && "notion-small-text"
          ])
        }, [
          createVNode(tt, mergeProps(unref(i), { big: "" }), null, 16),
          createElementVNode("div", mo, [
            createVNode(we, mergeProps({ text: unref(a) }, unref(i)), null, 16, ["text"])
          ]),
          renderSlot(p.$slots, "default")
        ], 2)
      ], 4)) : e.level === 0 ? (openBlock(), createElementBlock("main", po, [
        renderSlot(p.$slots, "default")
      ])) : unref(o) ? (openBlock(), createBlock(resolveDynamicComponent((_a2 = e.pageLinkOptions) == null ? void 0 : _a2.component), mergeProps({
        key: 2,
        class: "notion-page-link"
      }, unref(u)(unref(n).value.id)), {
        default: withCtx(() => [
          createElementVNode("div", fo, [
            createVNode(tt, normalizeProps(guardReactiveProps(unref(i))), null, 16)
          ]),
          createElementVNode("div", go, [
            createVNode(we, mergeProps({ text: unref(a) }, unref(i)), null, 16, ["text"])
          ])
        ]),
        _: 1
      }, 16)) : (openBlock(), createElementBlock("a", {
        key: 3,
        class: "notion-page-link",
        target: e.pageLinkTarget,
        href: e.mapPageUrl(unref(n).value.id)
      }, [
        createElementVNode("div", bo, [
          createVNode(tt, normalizeProps(guardReactiveProps(unref(i))), null, 16)
        ]),
        createElementVNode("div", yo, [
          createVNode(we, mergeProps({ text: unref(a) }, unref(i)), null, 16, ["text"])
        ])
      ], 8, vo));
    };
  }
}), ko = {
  key: 0,
  class: "notion-quote"
}, So = {
  name: "NotionQuote"
}, Ao = /* @__PURE__ */ defineComponent({
  ...So,
  props: { ...oe },
  setup(r4) {
    const e = r4, { properties: t, title: a, pass: n } = ue(e);
    return (i, o) => unref(t) ? (openBlock(), createElementBlock("blockquote", ko, [
      createVNode(we, mergeProps({ text: unref(a) }, unref(n)), null, 16, ["text"])
    ])) : createCommentVNode("", true);
  }
}), To = {
  name: "NotionTable"
}, _o = { class: "notion-simple-table-wrapper" }, Eo = { class: "notion-simple-table" };
function Mo(r4, e, t, a, n, i) {
  return openBlock(), createElementBlock("div", _o, [
    createElementVNode("table", Eo, [
      createElementVNode("tbody", null, [
        renderSlot(r4.$slots, "default")
      ])
    ])
  ]);
}
const zo = /* @__PURE__ */ pr(To, [["render", Mo]]), No = { class: "notion-simple-table-row" }, Co = { class: "notion-simple-table-cell-text" }, Do = {
  name: "NotionTableRow"
}, Ro = /* @__PURE__ */ defineComponent({
  ...Do,
  props: { ...oe },
  setup(r4) {
    const e = r4, { parent: t, properties: a, pass: n } = ue(e), {
      table_block_column_header: i,
      table_block_row_header: o,
      table_block_column_order: u
    } = t.value.value.format, c = (p) => a.value[p], m = (p) => i && e.contentIndex == 0 || o && p == 0;
    return (p, v) => (openBlock(), createElementBlock("tr", No, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(u), (k, S) => (openBlock(), createElementBlock("td", {
        key: S,
        class: "notion-simple-table-data"
      }, [
        createElementVNode("div", {
          class: normalizeClass({ "notion-simple-table-header": m(S) })
        }, [
          createElementVNode("div", Co, [
            createVNode(we, mergeProps({
              text: c(k),
              ref_for: true
            }, unref(n)), null, 16, ["text"])
          ])
        ], 2)
      ]))), 128))
    ]));
  }
}), Io = {
  key: 1,
  class: "notion-blank"
}, Bo = {
  name: "NotionText"
}, Oo = /* @__PURE__ */ defineComponent({
  ...Bo,
  props: { ...oe },
  setup(r4) {
    const e = r4, { properties: t, title: a, pass: n, blockColorClass: i } = ue(e);
    return (o, u) => unref(t) ? (openBlock(), createElementBlock("p", {
      key: 0,
      class: normalizeClass(["notion-text", unref(i)()])
    }, [
      createVNode(we, mergeProps({ text: unref(a) }, unref(n)), null, 16, ["text"])
    ], 2)) : (openBlock(), createElementBlock("div", Io, " "));
  }
}), Lo = { class: "notion-to-do-item" }, $o = ["value", "checked"], Fo = {
  name: "NotionTodo"
}, Po = /* @__PURE__ */ defineComponent({
  ...Fo,
  props: { ...oe },
  setup(r4) {
    const e = r4, { title: t, properties: a, pass: n } = ue(e), i = computed(() => {
      var _a2, _b;
      return ((_b = (_a2 = a.value) == null ? void 0 : _a2.checked) == null ? void 0 : _b[0]) == "Yes";
    });
    return (o, u) => (openBlock(), createElementBlock("label", Lo, [
      createElementVNode("input", {
        type: "checkbox",
        class: "notion-property-checkbox",
        value: i.value,
        checked: i.value,
        disabled: "true"
      }, null, 8, $o),
      createElementVNode("label", {
        class: normalizeClass({ "notion-to-do-checked": i.value })
      }, [
        createVNode(we, mergeProps({ text: unref(t) }, unref(n)), null, 16, ["text"])
      ], 2)
    ]));
  }
}), qo = { class: "notion-toggle" }, Ho = {
  name: "NotionToggle"
}, Go = /* @__PURE__ */ defineComponent({
  ...Ho,
  props: { ...oe },
  setup(r4) {
    const e = r4, { title: t, pass: a } = ue(e);
    return (n, i) => (openBlock(), createElementBlock("details", qo, [
      createElementVNode("summary", null, [
        createVNode(we, mergeProps({ text: unref(t) }, unref(a)), null, 16, ["text"])
      ]),
      createElementVNode("div", null, [
        renderSlot(n.$slots, "default")
      ])
    ]));
  }
}), Uo = {
  name: "NotionTableOfContentItem"
}, Vo = /* @__PURE__ */ defineComponent({
  ...Uo,
  props: { text: Object, level: { type: Number, default: 0 } },
  setup(r4) {
    const e = r4, t = computed(() => e.text ? e.text.map((n) => n[0]).join("") : ""), a = computed(() => ({
      paddingLeft: 1.5 * e.level + "rem"
    }));
    return (n, i) => (openBlock(), createElementBlock("span", {
      class: "notion-table-of-contents-item",
      style: normalizeStyle(a.value)
    }, toDisplayString(t.value), 5));
  }
}), jo = { class: "notion-table-of-contents" }, Yo = ["target", "href"], Wo = {
  name: "NotionTableOfContent"
}, Xo = /* @__PURE__ */ defineComponent({
  ...Wo,
  props: { ...oe },
  setup(r4) {
    const e = r4, { parent: a } = ue(e), o = ["header", "sub_header", "sub_sub_header"], u = computed(() => {
      if (!e.blockMap)
        return;
      let c = [];
      return Object.entries(e.blockMap).forEach(([m, p]) => {
        if (o.includes(p.value.type) && p.value.parent_id == a.value.value.id) {
          let v = 0;
          if (c.length) {
            let k = c[c.length - 1];
            p.value.type == "header" || (p.value.type == "sub_header" ? v = 1 : p.value.type == k.value.type ? v = k.level : p.value.type != k.value.type && (v = k.level + 1));
          }
          c.push({ ...p, level: v });
        }
      }), c;
    });
    return console.log(u), (c, m) => (openBlock(), createElementBlock("div", jo, [
      (openBlock(true), createElementBlock(Fragment, null, renderList(u.value, (p) => (openBlock(), createElementBlock("a", {
        class: "notion-page-link",
        target: e.pageLinkTarget,
        href: `#${p.value.id}`
      }, [
        createVNode(Vo, {
          text: p.value.properties.title,
          level: p.level
        }, null, 8, ["text", "level"])
      ], 8, Yo))), 256))
    ]));
  }
}), Zo = {
  name: "NotionSyncBlock"
}, Ko = { class: "notion-sync-block" };
function Jo(r4, e, t, a, n, i) {
  return openBlock(), createElementBlock("div", Ko, [
    renderSlot(r4.$slots, "default")
  ]);
}
const Qo = /* @__PURE__ */ pr(Zo, [["render", Jo]]), e1 = {
  name: "NotionSyncPointerBlock"
}, t1 = /* @__PURE__ */ defineComponent({
  ...e1,
  props: { ...oe },
  setup(r4) {
    const e = r4, { block: t, pass: a } = ue(e), n = computed(
      () => {
        var _a2, _b;
        return ((_b = (_a2 = t.value.value.format) == null ? void 0 : _a2.transclusion_reference_pointer) == null ? void 0 : _b.id) ?? "";
      }
    );
    return (i, o) => (openBlock(), createBlock(ft, mergeProps(unref(a), {
      key: n.value,
      level: unref(a).level + 1,
      "content-id": n.value
    }), null, 16, ["level", "content-id"]));
  }
}), r1 = {
  key: 0,
  style: { width: "100%" }
}, a1 = {
  key: 10,
  class: "notion-row"
}, n1 = {
  key: 20,
  class: "notion-hr"
}, i1 = /* @__PURE__ */ defineComponent({
  __name: "block",
  props: { ...oe },
  setup(r4) {
    const e = defineAsyncComponent(() => Promise.resolve().then(function () { return codeC6fe9438CrHmEpvo; })), t = defineAsyncComponent(() => import('./tweet-b529a487-dS5dwUNk.mjs')), a = r4, { pass: n, type: i, format: o, isType: u } = ue(a);
    return xn.includes(i.value) || console.warn(`${i.value.toUpperCase()} is not implemented yet`), (c, m) => unref(u)("page") ? (openBlock(), createElementBlock("div", r1, [
      createVNode(xo, mergeProps({ class: "notion-page-content" }, unref(n)), {
        default: withCtx(() => [
          renderSlot(c.$slots, "default")
        ]),
        _: 3
      }, 16)
    ])) : unref(u)(["header", "sub_header", "sub_sub_header"]) ? (openBlock(), createBlock(ro, normalizeProps(mergeProps({ key: 1 }, unref(n))), null, 16)) : unref(u)("bookmark") ? (openBlock(), createBlock(Gs, normalizeProps(mergeProps({ key: 2 }, unref(n))), null, 16)) : unref(u)("callout") ? (openBlock(), createBlock(el, normalizeProps(mergeProps({ key: 3 }, unref(n))), null, 16)) : unref(u)("code") ? (openBlock(), createBlock(unref(e), normalizeProps(mergeProps({ key: 4 }, unref(n))), null, 16)) : unref(u)("equation") ? (openBlock(), createBlock(pl, normalizeProps(mergeProps({ key: 5 }, unref(n))), null, 16)) : unref(u)("text") ? (openBlock(), createBlock(Oo, normalizeProps(mergeProps({ key: 6 }, unref(n))), null, 16)) : unref(u)("quote") ? (openBlock(), createBlock(Ao, normalizeProps(mergeProps({ key: 7 }, unref(n))), null, 16)) : unref(u)("to_do") ? (openBlock(), createBlock(Po, normalizeProps(mergeProps({ key: 8 }, unref(n))), null, 16)) : unref(u)("toggle") ? (openBlock(), createBlock(Go, normalizeProps(mergeProps({ key: 9 }, unref(n))), {
      default: withCtx(() => [
        renderSlot(c.$slots, "default")
      ]),
      _: 3
    }, 16)) : unref(u)("column_list") ? (openBlock(), createElementBlock("div", a1, [
      renderSlot(c.$slots, "default")
    ])) : unref(u)("column") ? (openBlock(), createBlock(rl, {
      key: 11,
      format: unref(o)
    }, {
      default: withCtx(() => [
        renderSlot(c.$slots, "default")
      ]),
      _: 3
    }, 8, ["format"])) : unref(u)(["bulleted_list", "numbered_list"]) ? (openBlock(), createBlock(co, normalizeProps(mergeProps({ key: 12 }, unref(n))), {
      default: withCtx(() => [
        renderSlot(c.$slots, "default")
      ]),
      _: 3
    }, 16)) : unref(u)(["image", "embed", "figma", "video", "audio", "drive", "maps"]) ? (openBlock(), createBlock(Xl, normalizeProps(mergeProps({ key: 13 }, unref(n))), null, 16)) : unref(u)("table") ? (openBlock(), createBlock(zo, normalizeProps(mergeProps({ key: 14 }, unref(n))), {
      default: withCtx(() => [
        renderSlot(c.$slots, "default")
      ]),
      _: 3
    }, 16)) : unref(u)("table_row") ? (openBlock(), createBlock(Ro, normalizeProps(mergeProps({ key: 15 }, unref(n))), null, 16)) : unref(u)("table_of_contents") ? (openBlock(), createBlock(Xo, normalizeProps(mergeProps({ key: 16 }, unref(n))), null, 16)) : unref(u)("transclusion_container") ? (openBlock(), createBlock(Qo, { key: 17 }, {
      default: withCtx(() => [
        renderSlot(c.$slots, "default")
      ]),
      _: 3
    })) : unref(u)("transclusion_reference") ? (openBlock(), createBlock(t1, normalizeProps(mergeProps({ key: 18 }, unref(n))), null, 16)) : unref(u)("tweet") ? (openBlock(), createBlock(unref(t), normalizeProps(mergeProps({ key: 19 }, unref(n))), null, 16)) : unref(u)("divider") ? (openBlock(), createElementBlock("hr", n1)) : createCommentVNode("", true);
  }
}), s1 = {
  name: "NotionRenderer"
}, ft = /* @__PURE__ */ defineComponent({
  ...s1,
  props: { ...oe },
  setup(r4) {
    const e = r4, { pass: t, block: a } = ue(e);
    return (n, i) => {
      const o = resolveComponent("NotionRenderer", true);
      return unref(a) ? (openBlock(), createBlock(i1, normalizeProps(mergeProps({ key: 0 }, unref(t))), {
        default: withCtx(() => [
          (openBlock(true), createElementBlock(Fragment, null, renderList(unref(a).value.content, (u, c) => (openBlock(), createBlock(o, mergeProps({ ref_for: true }, unref(t), {
            key: u,
            level: unref(t).level + 1,
            "content-id": u,
            "content-index": c
          }), null, 16, ["level", "content-id", "content-index"]))), 128))
        ]),
        _: 1
      }, 16)) : createCommentVNode("", true);
    };
  }
}), l1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NotionRenderer: ft
}, Symbol.toStringTag, { value: "Module" }));
const o1 = async (r4, e = "https://api.vue-notion.workers.dev/v1") => await fetch(`${e}/table/${r4}`).then((t) => t.json()).then((t) => t).catch((t) => t), u1 = async (r4, e = "https://api.vue-notion.workers.dev/v1") => await fetch(`${e}/page/${r4}`).then((t) => t.json()).then((t) => t).catch((t) => t);
const p1 = {
  install: (r4) => {
    Object.entries(l1).forEach(([e, t]) => {
      r4.component(e, t);
    });
  }
};
const plugin_5OmN3oYlYDpWBkwO2WrioDOMlLKqhn9DMr_r3c0kVos = /* @__PURE__ */ defineNuxtPlugin(({ vueApp }) => {
  const notion = { getPageBlocks: u1, getPageTable: o1 };
  vueApp.use(p1);
  return {
    provide: {
      notion
    }
  };
});
const preference = "system";
const plugin_server_9Ca9_HhnjAGwBWpwAydRauMHxWoxTDY60BrArRnXN_A = /* @__PURE__ */ defineNuxtPlugin((nuxtApp) => {
  var _a2;
  const colorMode = ((_a2 = nuxtApp.ssrContext) == null ? void 0 : _a2.islandContext) ? ref({}) : useState("color-mode", () => reactive({
    preference,
    value: preference,
    unknown: true,
    forced: false
  })).value;
  const htmlAttrs = {};
  {
    useHead({ htmlAttrs });
  }
  useRouter().afterEach((to2) => {
    const forcedColorMode = to2.meta.colorMode;
    if (forcedColorMode && forcedColorMode !== "system") {
      colorMode.value = htmlAttrs["data-color-mode-forced"] = forcedColorMode;
      colorMode.forced = true;
    } else if (forcedColorMode === "system") {
      console.warn("You cannot force the colorMode to system at the page level.");
    }
  });
  nuxtApp.provide("colorMode", colorMode);
});
function prepareMeta({ title, description, url, image, keywords }, rest) {
  const meta = [];
  if (title)
    meta.push(
      {
        name: "og:title",
        content: title
      },
      {
        name: "twitter:title",
        content: title
      }
    );
  if (description)
    meta.push(
      {
        name: "description",
        content: description
      },
      {
        name: "og:description",
        content: description
      },
      {
        name: "twitter:description",
        content: description
      }
    );
  if (url)
    meta.push({
      name: "og:url",
      content: url
    });
  if (image)
    meta.push(
      {
        name: "og:image",
        content: image
      },
      {
        name: "twitter:image",
        content: image
      }
    );
  const defaultKeywords = [
    "python",
    "django",
    "developer",
    "portfolio",
    "docker",
    "graphql",
    "elasticsearch"
  ];
  if (keywords)
    meta.push({
      name: "keywords",
      content: `${typeof keywords === "object" ? keywords.join(",") : keywords}, ${defaultKeywords.join(", ")}`
    });
  else
    meta.push({
      name: "keywords",
      content: defaultKeywords.join(", ")
    });
  if (typeof rest === "object")
    rest.forEach((item) => {
      const { name, content, ...rest2 } = item;
      meta.push({ name, content, ...rest2 });
    });
  if (meta.length === 0) return [];
  else
    return meta.map((item) => {
      if (item.name && !item.property) item.property = item.name;
      if ((item.name || item.property) && !item.hid)
        item.hid = item.name || item.property;
      return item;
    });
}
const util_ZL9mWCwJPjanf_Q5YO5UQZceEp4wHJHjUK9_nxv0Xkw = /* @__PURE__ */ defineNuxtPlugin(() => {
  return {
    provide: {
      prepareMeta
    }
  };
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin,
  _0_siteConfig_tU0SxKrPeVRXWcGu2sOnIfhNDbYiKNfDCvYZhRueG0Q,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4,
  plugin_5OmN3oYlYDpWBkwO2WrioDOMlLKqhn9DMr_r3c0kVos,
  plugin_server_9Ca9_HhnjAGwBWpwAydRauMHxWoxTDY60BrArRnXN_A,
  util_ZL9mWCwJPjanf_Q5YO5UQZceEp4wHJHjUK9_nxv0Xkw
];
const layouts = {
  default: defineAsyncComponent(() => import('./default-BI-8Todd.mjs').then((m) => m.default || m))
};
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h$1(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? (route == null ? void 0 : route.meta.layout) ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = layout.value && layout.value in layouts;
      const transitionProps = (route == null ? void 0 : route.meta.layoutTransition) ?? appLayoutTransition;
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(hasLayout && transitionProps, {
        default: () => h$1(Suspense, { suspensible: true, onResolve: () => {
          nextTick(done);
        } }, {
          default: () => h$1(
            LayoutProvider,
            {
              layoutProps: mergeProps(context.attrs, { ref: layoutRef }),
              key: layout.value || void 0,
              name: layout.value,
              shouldProvide: !props.name,
              isRenderingNewLayout: (name) => {
                return name !== previouslyRenderedLayout && name === layout.value;
              },
              hasTransition: !!transitionProps
            },
            context.slots
          )
        })
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        isCurrent: (route) => name === (route.meta.layout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      var _a2, _b;
      if (!name || typeof name === "string" && !(name in layouts)) {
        return (_b = (_a2 = context.slots).default) == null ? void 0 : _b.call(_a2);
      }
      return h$1(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h$1(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_1 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h$1(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h$1(Suspense, { suspensible: true }, {
            default() {
              return h$1(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h$1(slotContent[0]) : h$1(Fragment, void 0, slotContent);
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLayout = __nuxt_component_0;
  const _component_NuxtPage = __nuxt_component_1;
  _push(ssrRenderComponent(_component_NuxtLayout, _attrs, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtPage)
        ];
      }
    }),
    _: 1
  }, _parent));
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/pages/runtime/app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-B_i3bEPz.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-Q0iDZmdX.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    var _a2;
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      (_a2 = nuxt.payload).error || (_a2.error = createError(error));
    }
    if (ssrContext == null ? void 0 : ssrContext._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);

const codeC6fe9438CrHmEpvo = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: dl
}, Symbol.toStringTag, { value: 'Module' }));

export { _export_sfc as _, useRuntimeConfig as a, ue as b, useRouter as c, dl as d, entry$1 as default, useNuxtApp as e, nuxtLinkDefaults as f, asyncDataDefaults as g, createError as h, fetchDefaults as i, useRequestFetch as j, useState as k, __nuxt_component_1 as l, useRoute as m, navigateTo as n, oe as o, resolveRouteObject as r, useHead as u };
//# sourceMappingURL=server.mjs.map
