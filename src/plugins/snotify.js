import Vue from 'vue'
import Snotify, {
    SnotifyPosition
} from 'vue-snotify'

const options = {
    toast: {
        timeout: 5000,
        position: SnotifyPosition.rightTop
    }
}

Vue.use(Snotify, options)
