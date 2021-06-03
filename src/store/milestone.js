import { MILESTONE } from "@/graphql";
import { Milestone } from "@/models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";

const initialState = () => {
  return {
    loading: false,
    all: [],
    filter: null,
    loadedProcess: [],
    loadedStages: []
  };
};

const state = initialState();

const getters = {
  loading: state => state.loading,
  all: state => state.all,
  filter: state => state.filter,
  filteredItems: state =>
    state.filter && state.filter.length > 3
      ? state.all.filter(i =>
          i.description.toLowerCase().includes(state.filter.toLowerCase())
        )
      : state.all
};

const actions = {
  async create(context, form) {
    const result = await form.mutate({
      mutation: MILESTONE.create
    });
    const role = new Milestone().deserialize(result.data.milestoneCreate);
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async update(context, form) {
    const result = await form.mutate({
      mutation: MILESTONE.update,
      variables: {
        id: form.id
      }
    });
    const role = new Milestone().deserialize(result.data.milestoneUpdate);
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async reward(context, form) {
    const result = await form.mutate({
      mutation: MILESTONE.reward,
      variables: {
        rewarded: form.rewarded
      }
    });
    await context.dispatch("findAll", {
      force: true
    });
    return result.data.milestoneReward;
  },

  async delete(context, form) {
    context.commit("REMOVE_ITEM", form);
    const result = await form.mutate({
      mutation: MILESTONE.delete,
      variables: {
        id: form.id
      }
    });
    context.dispatch("findAll", {
      force: true
    });
    // await context.dispatch('findAll', { force: true });
    console.log(result.data);
    return result.data.milestoneDelete;
  },

  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters.all.length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["createdAt"],
          where: {
            and: []
          }
        }
      };
      filter.busy = context.getters.all.length < 1;
      try {
        const query = apolloClient.watchQuery({
          query: MILESTONE.findAll,
          variables: {
            filter: filter.data
          }
        });
        console.log(query);
        const { result } = await queryToPromise(query);
        console.log(result);
        const results = result.data.milestoneFindAll.map(cr => {
          return new Milestone().deserialize(cr);
        });
        context.commit("SET_ALL", results);
        return results;
      } finally {
        filter.busy = false;
      }
    }
    return context.getters.all;
  },

  async filter(context, filter) {
    context.commit("SET_FILTER", filter);
  }
};

const mutations = {
  SET_ALL(state, value) {
    state.all = value;
  },
  REMOVE_ITEM(state, value) {
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all.splice(index, 1);
      state.all = [...state.all];
    }
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
  SET_FILTER(state, value) {
    state.filter = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
