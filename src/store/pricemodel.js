import {
    PRICE_MODEL
} from '@/graphql';
import {
    PriceModel
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
        all: [{
                id: "ONE_TIME_PAYMENT",
                name: "ONE_TIME_PAYMENT"
            },
            {
                id: "LICENSE",
                name: "LICENSE"
            },
            {
                id: "PROJECT",
                name: "PROJECT"
            },
        ],
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
            mutation: PRICE_MODEL.create,
            /* update(cache, result) {
                const { priceModelFindAll } = cache.readQuery({ query: PRICE_MODEL.findAll });
                cache.writeQuery({
                    query: PRICE_MODEL.findAll,
                    data: { priceModelFindAll: priceModelFindAll.concat([result.data.priceModelCreate]) },
                });
            } */
        });
        const role = new PriceModel().deserialize(result.data.priceModelCreate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: PRICE_MODEL.update,
            variables: {
                id: form.id
            }
        });
        const role = new PriceModel().deserialize(result.data.priceModelUpdate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: PRICE_MODEL.delete
        });
        await context.dispatch('findAll', {
            force: true
        });
        return result.data.priceModelDelete;
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
                    query: PRICE_MODEL.findAll,
                    variables: { filter: filter }
                }); */
                const query = apolloClient.watchQuery({
                    query: PRICE_MODEL.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.priceModelFindAll.map(cr => {
                    return new PriceModel().deserialize(cr);
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