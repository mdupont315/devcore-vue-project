import {
    ROLE
} from '@/graphql';
import {
    Role
} from '@/models';
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
        filter: null
    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
    all: state => state.all,
    filter: state => state.filter,
    filteredItems: state => state.filter && state.filter.length > 3 ? state.all.filter(i => i.name.toLowerCase().includes(state.filter.toLowerCase())) : state.all,
}



const actions = {
    async create(context, form) {
        const result = await form.mutate({
            mutation: ROLE.create,
            /* update(cache, result) {
                const { roleFindAll } = cache.readQuery({ query: ROLE.findAll });
                cache.writeQuery({
                    query: ROLE.findAll,
                    data: { roleFindAll: roleFindAll.concat([result.data.roleCreate]) },
                });
            } */
        });
        const role = new Role().deserialize(result.data.roleCreate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: ROLE.update,
            variables: {
                id: form.id
            }
        });
        const role = new Role().deserialize(result.data.roleUpdate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: ROLE.delete
        });
        await context.dispatch('findAll', {
            force: true
        });
        return result.data.roleDelete;
    },

    async findAll(context, {
        filter = null,
        force = false
    } = {}) {
        if (context.getters.all.length === 0 || force) {
            filter = filter || {
                data: {
                    orderBy: ["name"]
                }

            };
            filter.busy = context.getters.all.length < 1;
            try {
                /* const { data } = await apolloClient.watchquery({
                    query: ROLE.findAll,
                    variables: { filter: filter }
                }); */
                const query = apolloClient.watchQuery({
                    query: ROLE.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.roleFindAll.map(cr => {
                    return new Role().deserialize(cr);
                })
                context.commit("SET_ALL", results);
                return results;
            } finally {
                filter.busy = false;
            }
        }
        return context.getters.all;
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
    state,
    getters,
    actions,
    mutations
}