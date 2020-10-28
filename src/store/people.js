import {
    apolloClient
} from '@/plugins/apollo/client';
import {
    USER
} from '@/graphql';
import {
    PeopleReport
} from '@/models';

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
        filter = filter || {
            orderBy: ["firstName"]
        };
        const {
            data
        } = await apolloClient.query({
            query: USER.findAll,
            variables: {
                filter: filter
            },
            fetchPolicy: 'default',
        });
        context.commit("SET_ALL", data.userFindAll.map(p => {
            return new PeopleReport().deserialize(p)
        }));
        return context.getters.all;
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
    state: state,
    getters: getters,
    actions: actions,
    mutations: mutations
}