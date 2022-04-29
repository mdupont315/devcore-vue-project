import Vue from 'vue'
import Snotify, {
    SnotifyPosition
} from 'vue-snotify'

const options = {
    toast: {
        timeout: 3000,
        position: SnotifyPosition.rightTop
    }
}

Vue.use(Snotify, options)
