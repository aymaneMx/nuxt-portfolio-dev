/* Import plugins */
import prepareMeta from "./utils/prepareMeta"

/* Export and inject plugin */
const Util = (_, inject) => {
  inject("prepareMeta", prepareMeta)
}

export default Util
