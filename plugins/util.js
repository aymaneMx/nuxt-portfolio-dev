/* Import plugins */
import prepareMeta from './utils/prepareMeta'

/* Export and provide plugin */
export default defineNuxtPlugin(() => {
  return {
    provide: {
      prepareMeta: prepareMeta,
    },
  }
})
