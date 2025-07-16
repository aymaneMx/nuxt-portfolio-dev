import Vue from 'vue'
import { NotionRenderer } from 'vue-notion'

Vue.component('NotionRenderer', NotionRenderer)

export default ({ app }, inject) => {
  // Inject vue-notion functions
  inject('notion', require('vue-notion'))
}
