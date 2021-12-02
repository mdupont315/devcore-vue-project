import {
    PROCESS_OPERATION
} from '@/graphql';
import {
    ProcessOperation
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
                mutation: PROCESS_OPERATION.create,
                /* update(cache, result) {
                    const { processOperationFindAll } = cache.readQuery({ query: PROCESS_OPERATION.findAll });
                    cache.writeQuery({
                        query: PROCESS_OPERATION.findAll,
                        data: { processOperationFindAll: processOperationFindAll.concat([result.data.processOperationCreate]) },
                    });
                } */
            });
            form.busy = true;
            const processOperation = new ProcessOperation().deserialize(result.data.processOperationCreate);
            await context.dispatch('process/findById', {
                id: context.rootGetters["process/current"]("process").process.id,
                force: true
            }, {
                root: true
            });
            return processOperation;
        } finally {
            form.busy = false;
        }
    },

    async update(context, form) {
        try {
            const result = await form.mutate({
                mutation: PROCESS_OPERATION.update,
                variables: {
                    id: form.id
                }
            });
            form.busy = true;
            const processOperation = new ProcessOperation().deserialize(result.data.processOperationUpdate);
            await context.dispatch('process/findById', {
                id: context.rootGetters["process/current"]("process").process.id,
                force: true
            }, {
                root: true
            });

            return processOperation;
        } finally {
            form.busy = false;
        }
    },

    async updateOrder(context, form) {
        form.showMessage = false;
        await form.mutate({
            mutation: PROCESS_OPERATION.updateOrder,
            // variables: {
            //     id: form.id
            // }
        });
    },

    async delete(context, form) {
        try {
            const result = await form.mutate({
                mutation: PROCESS_OPERATION.delete,
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
            return result.data.processOperationDelete;
        } finally {
            form.busy = false;
        }
    },

    async findAll(context, {
        filter = null,
        force = false
    } = {}) {
        if (context.rootGetters.all.length === 0 || force) {
            filter = filter || {
                data: {
                    orderBy: ["title"]
                }

            };
            filter.busy = context.rootGetters.all.length < 1;
            try {
                /* const { data } = await apolloClient.watchquery({
                    query: PROCESS_OPERATION.findAll,
                    variables: { filter: filter }
                }); */
                const query = apolloClient.watchQuery({
                    query: PROCESS_OPERATION.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.processOperationFindAll.map(cr => {
                    return new ProcessOperation().deserialize(cr);
                })
                context.commit("SET_ALL", results);
                return results;
            } finally {
                filter.busy = false;
            }
        }
        return context.rootGetters.all;
    },

    async filter(context, filter) {
        context.commit('SET_FILTER', filter);
    },

    async setCurrentProcessOperation(context, processOperation) {
        context.commit('SET_CURRENT_PROCESS_OPERATION', processOperation);
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
    SET_CURRENT_PROCESS_OPERATION(state, value) {
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
