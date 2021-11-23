<template>
  <div class="wrapper flex flex-wrap text-base text-center m-3 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
    <a
      aria-label="Github"
      class="social-link hover:text-primary mx-3" :href=$config.devGithubLink>
      <IconGithub class="h-6 w-6"/>
    </a>

    <a
      aria-label="Twitter"
      class="social-link hover:text-primary mx-3" :href=$config.devTwitterLink>
      <IconTwitter class="h-6 w-6"/>
    </a>

    <a
aria-label="LinkedIn"
       class="social-link hover:text-primary mx-3" :href=$config.devLinkedinLink>
      <IconLinkedin class="h-6 w-6"/>
    </a>
  </div>
</template>
