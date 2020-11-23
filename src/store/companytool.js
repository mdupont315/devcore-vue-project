import {
    COMPANY_TOOL
} from '@/graphql';
import {
    CompanyTool
} from '@/models';
import {
    queryToPromise
} from '../lib/utils';
import {
    apolloClient
} from '../plugins/apollo/client';
import {
    AppStorage
} from '@/lib/appstorage';
import EventBus from '@/lib/eventbus';

const initialState = () => {
    return {
        loading: false,
        all: [],
        filter: null,
        storage: AppStorage.get('CURRENT_TOOL', {

        }),
    }
};



function loadCurrent(state, section) {
    let current = null;
    if (!section) {
        return current;
    }
    state.storage[section] = state.storage[section] || {};

    if (state.storage[section].toolId) {
        current = state.all.find(p => p.toolId === state.storage[section].toolId);
    }
    return current;
}


const state = initialState();



const getters = {
    loading: state => state.loading,
    current: (state) => {
        return (section) => {
            return loadCurrent(state, section);
        }
    },
    all: state => state.all,
    filter: state => state.filter,
    filteredItems: state => state.filter && state.filter.length > 3 ? state.all.filter(i => i.name.toLowerCase().includes(state.filter.toLowerCase())) : state.all,
}



const actions = {
    async create(context, form) {
        const result = await form.mutate({
            mutation: COMPANY_TOOL.create
        });
        const tool = new CompanyTool().deserialize(result.data.companyToolCreate);
        if (tool.parentId) {
            await context.dispatch('findAll', {
                force: true
            });
        }
        return tool;
    },

    async changeStatus(context, form) {
        const result = await form.mutate({
            mutation: COMPANY_TOOL.changeStatus,
        });
        const tool = new CompanyTool().deserialize(result.data.companyToolChangeStatus);
        // await context.dispatch('findAll', { force: true });
        return tool;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: COMPANY_TOOL.update,
            variables: {
                id: form.id
            }
        });
        const tool = new CompanyTool().deserialize(result.data.companyToolUpdate);
        if (tool.parentId) {
            await context.dispatch('findAll', {
                force: true
            });
        }
        return tool;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: COMPANY_TOOL.delete
        });
        // if (tool.parentId) {
        // await context.dispatch('findAll', { force: true });
        // }
        context.commit("REMOVE_ITEM", form);
        return result.data.companyToolDelete;
    },

    async findAll(context, {
        filter = null,
        force = false
    } = {}) {
        if (context.getters.all.length === 0 || force) {
            filter = filter || {
                data: {
                    // orderBy: ["name"]
                }

            };
            filter.busy = context.getters.all.length < 1;
            try {
                const query = apolloClient.watchQuery({
                    query: COMPANY_TOOL.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.companyToolFindAll.map(cr => {
                    return new CompanyTool().deserialize(cr);
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
                query: COMPANY_TOOL.findById,
                variables: {
                    id: filter.id
                }
            });
            const {
                result
            } = await queryToPromise(query);
            const companyTool = new CompanyTool().deserialize(result.data.companyToolFindById);

            context.commit('SET_ITEM', companyTool);
            return companyTool;
        } finally {
            filter.busy = false;
        }
    },

    async filter(context, filter) {
        context.commit('SET_FILTER', filter);
    },

    async refreshCurrent(context, section) {
        if (context.getters.current(section)) {
            return context.dispatch("findById", {
                id: context.getters.current(section).id,
                force: true
            })
        }

    },

    async setCurrent(context, {
        section,
        tool
    }) {
        context.commit('SET_CURRENT_TOOL', {
            section,
            tool
        });
        EventBus.$emit('companyTool/changeCurrent', {
            section,
            tool
        })
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
    REMOVE_ITEM(state, value) {
        state.all = state.all.filter(o => o.id != value.id);
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
    },
    SET_CURRENT_TOOL(state, {
        section,
        tool
    }) {
        AppStorage.set('CURRENT_TOOL', Object.assign(AppStorage.get('CURRENT_TOOL', {}), {
            [section]: {
                toolId: tool ? tool.id : null,
            }
        }));
        state.storage = AppStorage.get('CURRENT_TOOL');
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}