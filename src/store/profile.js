const initialState = () => {
    return {
        loading: false,
    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
}



const actions = {
    async update() {

    },

}


const mutations = {

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}