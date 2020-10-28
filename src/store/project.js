import {
    PROJECT
} from '@/graphql';
import {
    Project
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
        loadedProcess: [],
    }
};

const state = initialState();



const getters = {
    loading: state => state.loading,
    all: state => state.all.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)),
    filter: state => state.filter,
    byProcess: state => processId => state.all.filter(o => o.processId === processId),
    byStage: state => stageId => state.all.filter(o => o.stageId === stageId),
    byOperation: state => operationId => state.all.filter(o => o.operationId === operationId),
    byPhase: state => phaseId => state.all.filter(o => o.phaseId === phaseId),
    filteredItems: state => state.filter && state.filter.length > 3 ? state.all.filter(i => i.name.toLowerCase().includes(state.filter.toLowerCase())) : state.all,
    filteredByprocess: (state) => {
        return (processId) => {
            return (state.filter && state.filter.length > 3 ? state.all.filter(i => i.processId === processId && (i.name.toLowerCase().includes(state.filter.toLowerCase()))) : state.all.filter(o => o.processId === processId));
        }
    }
}



const actions = {
    async create(context, form) {
        const result = await form.mutate({
            mutation: PROJECT.create,
            /*update(cache, result) {
                const { projectFindAll } = cache.readQuery({ query: PROJECT.findAll });
                cache.writeQuery({
                    query: PROJECT.findAll,
                    data: { projectFindAll: projectFindAll.concat([result.data.projectCreate]) },
                });
            }*/
        });
        const project = new Project().deserialize(result.data.projectCreate);
        //await context.dispatch('process/refreshCurrent', "projects", { root: true });
        context.commit("SET_ITEM", project);
        return project;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: PROJECT.update,
            variables: {
                id: form.id
            }
        });
        const project = new Project().deserialize(result.data.projectUpdate);
        //await context.dispatch('project/refreshCurrent', "projects", { root: true });
        context.commit("SET_ITEM", project);
        return project;
    },

    async changeStatus(context, form) {
        const result = await form.mutate({
            mutation: PROJECT.changeStatus,
            variables: {
                id: form.id,
                status: form.status
            }
        });
        const project = new Project().deserialize(result.data.projectChangeStatus);
        await context.dispatch('process/refreshCurrent', "projects", {
            root: true
        });
        context.commit("SET_ITEM", project);
        return project;
    },

    async delete(context, form) {
        const item = context.state.all.find(i => i.id === form.id);
        context.commit("REMOVE_ITEM", form.id);
        try {
            const result = await form.mutate({
                mutation: PROJECT.delete,
                variables: {
                    id: form.id
                }
            });
            //await context.dispatch('process/refreshCurrent', "projects", { root: true });

            return result.data.projectDelete;
        } catch (ex) {
            context.commit("SET_ITEM", item);
        }
    },

    async nextStage(context, form) {
        const result = await form.mutate({
            mutation: PROJECT.nextStage,
            variables: {
                id: form.id
            }
        });
        const project = new Project().deserialize(result.data.projectNextStage);
        context.commit("SET_ITEM", project);
        await context.dispatch('process/refreshCurrent', "projects", {
            root: true
        });
        return project;
    },

    async completeStage(context, form) {
        const result = await form.mutate({
            mutation: PROJECT.completeStage,
            variables: {
                id: form.id,
                stageId: form.stageId,
            }
        });
        const project = new Project().deserialize(result.data.projectCompleteStage);
        context.commit("SET_ITEM", project);
        await context.dispatch('process/refreshCurrent', "projects", {
            root: true
        });
        return project;
    },


    async findByProcess(context, filter) {
        try {
            if (!context.state.loadedProcess.includes(filter.id) || filter.force) {
                context.commit("SET_LOADING", true);
                const query = apolloClient.watchQuery({
                    query: PROJECT.findAll,
                    variables: {
                        filter: {
                            where: {
                                field: "process_id",
                                value: filter.id
                            },
                            orderBy: ['name']
                        }
                    }
                });
                const {
                    result
                } = await queryToPromise(query);
                context.commit("UNLOAD_PROCESS", filter.id);
                result.data.projectFindAll.map(o => {
                    context.commit("SET_ITEM", new Project().deserialize(o));
                });
                context.commit("LOAD_PROCESS", filter.id);
            }
            return context.getters.byProcess(filter.id);
        } finally {
            context.commit("SET_LOADING", false);
        }
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
                    query: PROJECT.findAll,
                    variables: { filter: filter }
                });*/
                const query = apolloClient.watchQuery({
                    query: PROJECT.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.projectFindAll.map(cr => {
                    return new Project().deserialize(cr);
                })
                context.commit("SET_ALL", results);
                return results;
            } finally {
                filter.busy = false;
            }
        }
        return context.getters['all'];
    },

    async findById(context, filter) {
        const currentItem = context.state.all.find(o => o.id === filter.id);
        const force = filter.force || false;

        if (!currentItem || force || !currentItem.loaded) {
            filter.busy = true;
            try {
                const query = apolloClient.watchQuery({
                    query: PROJECT.findById,
                    variables: filter
                });
                const {
                    result
                } = await queryToPromise(query);
                const project = new Project().deserialize(result.data.projectFindById);
                project.loaded = true;
                context.commit('SET_ITEM', project);
                return project;
            } finally {
                filter.busy = false;
            }
        }
        return currentItem;
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
    SET_LOADING(state, value) {
        state.loading = value;
    },
    SET_ALL(state, value) {
        state.all = value;
    },
    UNLOAD_PROCESS(state, value) {
        state.loadedProcess = state.loadedProcess.filter(o => o != value);
        state.all = state.all.filter(o => o.processId != value);
    },
    LOAD_PROCESS(state, value) {
        state.loadedProcess.push(value);
    },
    SET_ITEM(state, value) {
        const index = state.all.findIndex(el => el.id === value.id);
        if (index > -1) {
            state.all[index] = value;
            state.all = [...state.all];

        } else {
            state.all.push(value);
        }
    },
    REMOVE_ITEM(state, id) {
        state.all = state.all.filter(o => o.id != id);
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