<template>
  <div
    class="rounded-full cursor-pointer ml-5 bg-gray-100 p-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100 focus:outline-none"
    @click="switchTheme"
  >
    <IconSun v-if="getSelectedTheme === 'light'" class="h-5 w-5"/>
    <IconMoon v-else class="h-5 w-5"/>

  </div>
</template>

<script>

export default {
  computed: {
    /**
     * Returns the selected color mode value.
     * @returns {string} The color mode as "light" or "dark".
     */
    getSelectedTheme() {
      return this.$colorMode.value
    },
  },
  methods: {
    /**
     * Updates the color mode value.
     */
    switchTheme() {
      this.$colorMode.preference =
        this.getSelectedTheme === "dark" ? "light" : "dark"
    },
  },
}
</script>
