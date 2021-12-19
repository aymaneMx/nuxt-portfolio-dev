<template>
  <div class="mt-16">
    <div
      class="flex justify-center items-center text-base font-semibold text-gray-600 dark:text-gray-300"
    >
      <h2 class="text-center">{{ title }}</h2>
      <IconDoubleDown class="h-4 w-4" />
    </div>

    <div class="wrapper-small my-5">
      <div
        v-for="post of posts"
        :key="post.slug"
        class="project-card md:flex mt-10"
      >
        <div class="img max-w-lg md:max-w-sm mx-auto m-2">
          <nuxt-link :to="`/posts/${post.slug}`">
            <img
              :alt="post.title"
              :src="`${post.thumbnail[0].url}`"
              class="rounded-xl h-44 w-96 object-cover object-center"
            />
          </nuxt-link>
        </div>
        <div class="flex flex-col justify-between max-w-lg mx-auto">
          <div class="txt md:px-5 lg:px-0">
            <nuxt-link :to="`/posts/${post.slug}`">
              <h2
                class="text-xl font-semibold text-gray-800 dark:text-gray-100"
              >
                {{ post.title }}
              </h2>
            </nuxt-link>
            <p class="font-semibold text-gray-600 dark:text-gray-300 text-sm">
              {{ formatDate(post.created_at) }}
            </p>
            <div class="flex flex-col justify-between max-w-lg mx-auto"></div>
            <span
              v-for="tag of post.tags"
              :key="tag"
              class="font-semibold text-gray-600 bg-opacity-25 dark:bg-opacity-40 dark:text-gray-300 text-sm rounded bg-gray-200 dark:bg-primary mr-1 px-1"
            >
              #{{ tag }}
            </span>
            <p class="text-base text-gray-700 dark:text-gray-200 my-1">
              {{ post.description }}
            </p>
            <nuxt-link
              :to="`/posts/${post.slug}`"
              class="text-base font-semibold text-gray-700 dark:text-gray-200 my-3 hover:underline"
            >
              Read more >
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Blogs',
    },
    posts: {
      type: Array,
      default() {
        return []
      },
    },
  },
  methods: {
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString('en', options)
    },
  },
}
</script>
