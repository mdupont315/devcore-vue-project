import {
    TOOL_AREA
} from '@/graphql';
import {
    ToolArea
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
            mutation: TOOL_AREA.create,
            /*update(cache, result) {
                const { toolAreaFindAll } = cache.readQuery({ query: TOOL_AREA.findAll });
                cache.writeQuery({
                    query: TOOL_AREA.findAll,
                    data: { toolAreaFindAll: toolAreaFindAll.concat([result.data.toolAreaCreate]) },
                });
            }*/
        });
        const role = new ToolArea().deserialize(result.data.toolAreaCreate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: TOOL_AREA.update,
            variables: {
                id: form.id
            }
        });
        const role = new ToolArea().deserialize(result.data.toolAreaUpdate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: TOOL_AREA.delete
        });
        await context.dispatch('findAll', {
            force: true
        });
        return result.data.toolAreaDelete;
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
            try {
                /*const { data } = await apolloClient.watchquery({
                    query: TOOL_AREA.findAll,
                    variables: { filter: filter }
                });*/
                const query = apolloClient.watchQuery({
                    query: TOOL_AREA.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.toolAreaFindAll.map(cr => {
                    return new ToolArea().deserialize(cr);
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