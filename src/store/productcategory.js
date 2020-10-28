import {
    PRODUCT_CATEGORY
} from '@/graphql';
import {
    ProductCategory
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
            mutation: PRODUCT_CATEGORY.create,
            /*update(cache, result) {
                const { productCategoryFindAll } = cache.readQuery({ query: PRODUCT_CATEGORY.findAll });
                cache.writeQuery({
                    query: PRODUCT_CATEGORY.findAll,
                    data: { productCategoryFindAll: productCategoryFindAll.concat([result.data.productCategoryCreate]) },
                });
            }*/
        });
        const role = new ProductCategory().deserialize(result.data.productCategoryCreate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async update(context, form) {
        const result = await form.mutate({
            mutation: PRODUCT_CATEGORY.update,
            variables: {
                id: form.id
            }
        });
        const role = new ProductCategory().deserialize(result.data.productCategoryUpdate);
        await context.dispatch('findAll', {
            force: true
        });
        return role;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: PRODUCT_CATEGORY.delete
        });
        await context.dispatch('findAll', {
            force: true
        });
        return result.data.productCategoryDelete;
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
                    query: PRODUCT_CATEGORY.findAll,
                    variables: { filter: filter }
                });*/
                const query = apolloClient.watchQuery({
                    query: PRODUCT_CATEGORY.findAll,
                    variables: {
                        filter: filter.data
                    }
                })
                const {
                    result
                } = await queryToPromise(query);
                const results = result.data.productCategoryFindAll.map(cr => {
                    return new ProductCategory().deserialize(cr);
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