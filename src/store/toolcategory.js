import {
    TOOL_CATEGORY
} from '@/graphql';
import {
    ToolCategory
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
            mutation: TOOL_CATEGORY.create
        });
        const role = new ToolCategory().deserialize(result.data.toolCategoryCreate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: TOOL_CATEGORY.update,
            variables: {
                id: form.id
            }
        });
        const role = new ToolCategory().deserialize(result.data.toolCategoryUpdate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: TOOL_CATEGORY.delete
        });
        await context.dispatch('findAll', {
            force: true
        });
        return result.data.toolCategoryDelete;
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
                const query = apolloClient.watchQuery({
                    query: TOOL_CATEGORY.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.toolCategoryFindAll.map(cr => {
                    return new ToolCategory().deserialize(cr);
                })
                context.commit("SET_ALL", results);
                return results;
            } finally {
                filter.busy = false;
            }
        }
        return context.getters.all;
    },

    async findById(context, filter) {
        filter.busy = true;
        try {
            const query = apolloClient.watchQuery({
                query: TOOL_CATEGORY.findById,
                variables: {
                    id: filter.id
                }
            });
            const {
                result
            } = await queryToPromise(query);
            const toolCategory = new ToolCategory().deserialize(result.data.toolCategoryFindById);

            context.commit('SET_ITEM', toolCategory);
            return toolCategory;
        } finally {
            filter.busy = false;
        }
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
    SET_ITEM(state, value) {
        const index = state.all.findIndex(el => el.id === value.id);
        if (index > -1) {
            const copy = { ...state.all[index] };
            value._showDetails = copy._showDetails;
            state.all[index] = value;
            state.all = [...state.all];
        }
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