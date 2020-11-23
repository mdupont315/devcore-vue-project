import {
    apolloClient
} from '@/plugins/apollo/client';
import {
    TOOL
} from '@/graphql';

const initialState = () => {
    return {
        loading: false,
        all: [],

    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
    all: state => state.all.sort((a, b) => {
        return a.tool.name > b.tool.name ? -1 : 1;
    }),

}



const actions = {

    async findAll(context, filter = null) {
        filter = filter || {
            orderBy: ["name"]
        };
        const {
            data
        } = await apolloClient.query({
            query: TOOL.findAll,
            variables: {
                filter
            },
            fetchPolicy: 'default',
        });
        context.commit("SET_ALL", data.toolFindAll);
        return data.toolFindAll;
    },

}


const mutations = {
    RESET_STATE(state) {
        Object.assign(state, initialState());
        return state;
    },
    SET_ALL(state, value) {
        state.all = value;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}