import {
    PROCESS_STAGE
} from '@/graphql';
import {
    ProcessStage
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
        filter: null,
        current: null,
    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
    all: state => state.all,
    filter: state => state.filter,
    current: state => state.current,
    filteredItems: state => state.filter && state.filter.length > 3 ? state.all.filter(i => i.name.toLowerCase().includes(state.filter.toLowerCase())) : state.all,
}



const actions = {
    async create(context, form) {
        try {
            const result = await form.mutate({
                mutation: PROCESS_STAGE.create,
            });
            form.busy = true;
            const processStage = new ProcessStage().deserialize(result.data.processStageCreate);
            await context.dispatch('process/findById', {
                id: context.rootGetters["process/current"]("process").process.id,
                force: true
            }, {
                root: true
            });
            return processStage;
        } finally {
            form.busy = false;
        }
    },

    async update(context, form) {
        try {
            const result = await form.mutate({
                mutation: PROCESS_STAGE.update,
                variables: {
                    id: form.id
                }
            });
            form.busy = true;
            const processStage = new ProcessStage().deserialize(result.data.processStageUpdate);
            await context.dispatch('process/findById', {
                id: context.rootGetters["process/current"]("process").process.id,
                force: true
            }, {
                root: true
            });
            return processStage;
        } finally {
            form.busy = false;
        }
    },

    async updateOrder(context, form) {
        form.showMessage = false;
        await form.mutate({
            mutation: PROCESS_STAGE.updateOrder,
            // variables: {
            //     id: form.id
            // }
        });
    },

    async delete(context, form) {
        try {
            const result = await form.mutate({
                mutation: PROCESS_STAGE.delete,
                variables: {
                    id: form.id
                }
            });
            form.busy = true;
            await context.dispatch('process/findById', {
                id: context.rootGetters["process/current"]("process").process.id,
                force: true
            }, {
                root: true
            });
            return result.data.processStageDelete;
        } finally {
            form.busy = false;
        }
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
                    query: PROCESS_STAGE.findAll,
                    variables: { filter: filter }
                }); */
                const query = apolloClient.watchQuery({
                    query: PROCESS_STAGE.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.processStageFindAll.map(cr => {
                    return new ProcessStage().deserialize(cr);
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
    },

    async setCurrentProcessStage(context, processStage) {
        context.commit('SET_CURRENT_PROCESS_STAGE', processStage);
    }

}


const mutations = {
    RESET_STATE(state) {
        Object.assign(state, initialState());
        return state;
    },
    SET_ALL(state, value) {
        state.all = value;
        if (!state.current) {
            state.current = state.all[0];
        }
    },
    SET_FILTER(state, value) {
        state.filter = value;
    },
    SET_CURRENT_PROCESS_STAGE(state, value) {
        state.current = value;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}