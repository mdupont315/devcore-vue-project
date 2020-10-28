const state = {
    currentExpandedItems: []
}

const getters = {
    currentExpandedItems: state => state.currentExpandedItems
}

const actions = {
    toggleItem(context, item) {
        context.commit('TOGGLE_ITEM', item)
    },
    activateItem(context, item) {
        context.commit('ACTIVATE_ITEM', item);
    }
}

const mutations = {
    TOGGLE_ITEM(state, item) {
        if (state.currentExpandedItems.some(({
                name
            }) => name === item.name)) {
            state.currentExpandedItems = [];
        } else {
            state.currentExpandedItems = [item];
        }

    },
    ACTIVATE_ITEM(state, item) {
        state.currentExpandedItems = [item];
    },
}


export default {
    namespaced: true,
    state: state,
    getters: getters,
    actions: actions,
    mutations: mutations
}