import { ISSUE } from "@/graphql";
import { Issue } from "@/models";
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
  byProcess: state => processId =>
    state.all.filter(o => o.processId === processId),
  byStage: state => stageId => state.all.filter(o => o.stageId === stageId),
  byOperation: state => operationId =>
    state.all.filter(o => o.operationId === operationId),
  byPhase: state => phaseId => state.all.filter(o => o.phaseId === phaseId),
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
      mutation: ISSUE.create
      /* update(cache, result) {
                const { issueFindAll } = cache.readQuery({ query: ISSUE.findAll });
                cache.writeQuery({
                    query: ISSUE.findAll,
                    data: { issueFindAll: issueFindAll.concat([result.data.issueCreate]) },
                });
            } */
    });
    const role = new Issue().deserialize(result.data.issueCreate);
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async update(context, form) {
    const result = await form.mutate({
      mutation: ISSUE.update,
      variables: {
        id: form.id
      }
    });
    const role = new Issue().deserialize(result.data.issueUpdate);
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async changeStatus(context, form) {
    const result = await form.mutate({
      mutation: ISSUE.changeStatus
    });
    const role = new Issue().deserialize(result.data.issueChangeStatus);
    context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async delete(context, form) {
    context.commit("REMOVE_ITEM", form);
    const result = await form.mutate({
      mutation: ISSUE.delete,
      variables: {
        id: form.id
      }
    });
    context.dispatch("findAll", {
      force: true
    });
    // await context.dispatch('findAll', { force: true });
    console.log(result.data);
    return result.data.issueDelete;
  },

  async check(context, form) {
    console.log(form);
    const result = await form.mutate({
      mutation: ISSUE.check,
      variables: {
        checked: form.checked
      }
    });
    // await context.dispatch('findAll', { force: true });
    return result.data.issueCheck;
  },

  async deleteMany(context, form) {
    form.ids.map(id => {
      context.commit("REMOVE_ITEM", {
        id
      });
    });

    const result = await form.mutate({
      mutation: ISSUE.deleteMany,
      variables: {
        ids: form.ids
      }
    });
    context.dispatch("findAll", {
      force: true
    });
    // await context.dispatch('findAll', { force: true });
    return result.data.issueDeleteMany;
  },

  async findByProcess(context, filter) {
    if (!context.state.loadedProcess.includes(filter.id) || filter.force) {
      const query = apolloClient.watchQuery({
        query: ISSUE.findAll,
        variables: {
          filter: {
            where: {
              and: [
                {
                  field: "process_id",
                  value: filter.id
                }
              ]
            }
          }
        }
      });
      const { result } = await queryToPromise(query);
      console.log(result);
      result.data.issueFindAll.map(o => {
        context.commit("SET_ITEM", new Issue().deserialize(o));
      });
    }
  },

  async findByStage(context, filter) {
    if (!context.state.loadedStages.includes(filter.id) || filter.force) {
      const query = apolloClient.watchQuery({
        query: ISSUE.findAll,
        variables: {
          filter: {
            where: {
              and: [
                {
                  field: "parent_type",
                  value: "stage"
                },
                {
                  field: "parent_id",
                  value: filter.id
                }
              ]
            }
          }
        }
      });
      const { result } = await queryToPromise(query);
      result.data.issueFindAll.map(o => {
        context.commit("SET_ITEM", new Issue().deserialize(o));
      });
      return context.getters.all.filter(o => o.stageId === filter.id);
    }
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
        /* const { data } = await apolloClient.watchquery({
                    query: ISSUE.findAll,
                    variables: { filter: filter }
                }); */
        const query = apolloClient.watchQuery({
          query: ISSUE.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        console.log(result);
        const results = result.data.issueFindAll.map(cr => {
          return new Issue().deserialize(cr);
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
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
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
