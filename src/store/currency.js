import {
    apolloClient
} from '@/plugins/apollo/client';
import {
    CURRENCY
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
    all: state => state.all,
}



const actions = {

    async findAll(context, filter = null) {
        try {
            filter = filter || {
                orderBy: ["name"]
            };
            const response = await apolloClient.query({
                query: CURRENCY.findAll,
                variables: {
                    filter
                },
                fetchPolicy: 'default',
            });
            context.commit("SET_ALL", response.data.currencyFindAll);
            return context.getters.all;
        } catch (ex) {
            console.info(ex);
        }
    }

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