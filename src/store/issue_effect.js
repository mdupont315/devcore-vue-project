import { IssueTemplate } from "@/models";
import { ISSUE_EFFECT } from "@/graphql";
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
    console.log("CREATED");
    console.log(form);
    const result = await form.mutate({
      mutation: ISSUE_EFFECT.create
    });
    const role = new IssueTemplate().deserialize(result.data.issueEffectCreate);
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async findAll(context, { filter = null, force = false } = {}) {
    console.log("FINDALL!");
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
          query: ISSUE_EFFECT.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        console.log(result);
        const results = result.data.issueEffectFindAll.map(cr => {
          return new IssueTemplate().deserialize(cr);
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
