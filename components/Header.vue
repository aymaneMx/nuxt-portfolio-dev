<template>
  <div>
    <nav class="wrapper py-6 dark:bg-gray-900">
      <div class="px-10 flex justify-between items-center">
        <div class="logo">
          <nuxt-link to="/">

            <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">{{ $config.devLogo }}</h1>
          </nuxt-link>
        </div>

        <div class="flex flex-row">
          <nuxt-link class="nav-link" to="/posts">Blog</nuxt-link>
          <nuxt-link class="nav-link" to="/about">About</nuxt-link>
          <ColorSwitcher/>
        </div>
      </div>
    </nav>
  </div>
</template>


<script>
export default {
  data() {
    return {
      isOpen: false
    }
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen
    },
  }
}
</script>

<style>
.mobile-link {
  @apply block px-3 py-2 text-lg text-gray-900 rounded-md text-white font-medium text-center;
}

.nav-link {
  @apply ml-5 font-medium text-center text-lg text-gray-700 dark:text-gray-200 dark:hover:text-primary hover:text-primary m-auto;
}
</style>
