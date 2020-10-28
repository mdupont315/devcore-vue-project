
import {
    Company
} from '@/models';
import { COMPANY } from '../graphql';
import {
    queryToPromise
} from '../lib/utils';
import {
    apolloClient
} from '../plugins/apollo/client';

const initialState = () => {
    return {
        loading: false,
        all: [],
        filter: null,

    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
    all: state => state.all,
    filter: state => state.filter,
    filteredItems: state => state.filter && state.filter.length > 3 ? state.all.filter(i => i.name.toLowerCase().includes(state.filter.toLowerCase()) ) : state.all,
}



const actions = {
    async create(context, form) {
        const result = await form.mutate({
            mutation: COMPANY.create,
            /*update(cache, result) {
                const { userFindAll } = cache.readQuery({ query: USER.findAll });
                cache.writeQuery({
                    query: USER.findAll,
                    data: { userFindAll: userFindAll.concat([result.data.userCreate]) },
                });
            }*/
        });
        const company = new Company().deserialize(result.data.companyCreate);
        await context.dispatch('findAll', {
            force: true
        });
        return company;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: COMPANY.update,
            variables: {
                id: form.id
            }
        });
        await context.dispatch('findAll', {
            force: true
        });
        const company = new Company().deserialize(result.data.companyUpdate);
        return company;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: COMPANY.delete
        });
        await context.dispatch('findAll', {
            force: true
        });
        return result.data.companyDelete;
    },

 
    async findAll(context, {
        filter = null,
        force = false
    } = {}) {
        if (context.getters['all'].length === 0 || force) {
            filter = filter || {
                data: {
                    orderBy: ["name"]
                }

            };
            filter.busy = context.getters['all'].length < 1;
            /*const { data } = await apolloClient.watchquery({
                query: USER.findAll,
                variables: { filter: filter }
            });*/
            try {
                const query = apolloClient.watchQuery({
                    query: COMPANY.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.companyFindAll.map(cr => {
                    return new Company().deserialize(cr);
                })
                context.commit("SET_ALL", results);
                return results;
            } finally {
                filter.busy = false;
            }
        }
        return context.getters['all'];
    },

    async filter(context, filter) {
        context.commit('SET_FILTER', filter);
    }

}


const mutations = {
    RESET_STATE(state) {
        Object.assign(state, initialState());
        return state;
    },
    SET_ALL(state, value) {
        state.all = value;
    },
    SET_FILTER(state, value) {
        state.filter = value;
    }
}

export default {
    namespaced: true,
    state: state,
    getters: getters,
    actions: actions,
    mutations: mutations
}