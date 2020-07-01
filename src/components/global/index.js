import Vue from 'vue'
import './Table';
import './Crud';

const requireContext = require.context('./', false, /.*\.(vue)$/)

requireContext.keys().forEach(file => {
    const Component = requireContext(file).default
    if (Component.name) {
        Vue.component(Component.name, Component)
    }
})