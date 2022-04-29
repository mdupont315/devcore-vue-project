const initialState = () => {
    return {
        layers: []
    }
};


const state = initialState();



const getters = {
    layers: state => state.layers,
    current: state => state.layers.length > 0 ? state.layers[state.layers.length - 1] : null,
}



const actions = {

    addLayer(context, layer) {
        context.commit('ADD_LAYER', layer);
    },
    removeLayer(context, layer) {
        context.commit('REMOVE_LAYER', layer);
    }

}


const mutations = {
    RESET_STATE(state) {
        Object.assign(state, initialState());
        return state;
    },
    ADD_LAYER(state, value) {
        state.layers.push(value);
    },
    REMOVE_LAYER(state, value) {
        state.layers = state.layers.filter(v => v != value);
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}