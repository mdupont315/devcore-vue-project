import {
    COMPANY_TOOL_PRICE
} from '@/graphql';
import {
    CompanyToolPrice
} from '@/models';
import {
    AppStorage
} from '@/lib/appstorage';

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
            mutation: COMPANY_TOOL_PRICE.create
        });
        const tool = new CompanyToolPrice().deserialize(result.data.companyToolPriceCreate);

        return tool;
    },



    async update(context, form) {
        const result = await form.mutate({
            mutation: COMPANY_TOOL_PRICE.update,
            variables: {
                id: form.id
            }
        });
        const tool = new CompanyToolPrice().deserialize(result.data.companyToolPriceUpdate);

        return tool;
    },

    async delete(context, form) {
        const result = await form.mutate({
            mutation: COMPANY_TOOL_PRICE.delete
        });

        return result.data.companyToolPriceDelete;
    },

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
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}