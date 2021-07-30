import { IssueEffect } from "@/models";
import { ISSUE_EFFECT } from "@/graphql";
import { ISSUE_EFFECT_TEMPLATE } from "@/graphql";
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
    const role = new IssueEffect().deserialize(result.data.issueEffectCreate);
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async update(context, form) {
    console.log("CREATED");
    console.log(form);
    const result = await form.mutate({
      mutation: ISSUE_EFFECT.update,
      variables: {
        id: form.id
      }
    });
    const role = new IssueEffect().deserialize(
      result.data.issueEffectUpdate
    );
    await context.dispatch("findAll", {
      force: true
    });
    return role;
  },

  async delete(context, form) {
    const result = await form.mutate({
      mutation: ISSUE_EFFECT.delete,
      variables: {
        id: form.id
      }
    });

    context.dispatch("findAll", {
      force: true
    });
    return result.data.issueEffectDelete;
  },

  async createTemplate(context, form) {
    console.log("CREATED");
    console.log(form);
    const result = await form.mutate({
      mutation: ISSUE_EFFECT_TEMPLATE.create
    });
    const template = new IssueEffect().deserialize(
      result.data.issueEffectTemplateCreate
    );
    context.commit("SET_TEMPLATE", template);
 /*    context.commit("findById", {

    }) */
    console.log(template);
    return template;
  },

  async updateTemplate(context, form) {
    const result = await form.mutate({
      mutation: ISSUE_EFFECT_TEMPLATE.update,
      variables: {
        id: form.id
      }
    });
    const template = new IssueEffect().deserialize(
      result.data.issueEffectUpdateTemplate
    );
    context.dispatch("findAll", {
      force: true
    });
    console.log(template);
    return template;
  },

  async deleteTemplate(context, form) {
    const result = await form.mutate({
      mutation: ISSUE_EFFECT_TEMPLATE.deleteTemplate,
      variables: {
        id: form.id
      }
    });
    return result.data.issueEffectTemplateDelete;
  },

  async deleteManyTemplate(context, form) {
    const result = await form.mutate({
      mutation: ISSUE_EFFECT_TEMPLATE.deleteManyTemplate,
      variables: {
        ids: form.ids
      }
    });

    return result.data.issueEffectTemplateDeleteMany;
  },

  async findById(context, filter) {
    const currentItem = context.state.all.find(o => o.id === filter.id);
    const force = filter.force || false;

    if (!currentItem || force || !currentItem.loaded) {
      try {
        const query = apolloClient.watchQuery({
          query: ISSUE_EFFECT.findById,
          variables: filter
        });
        const { result } = await queryToPromise(query);
        const template = new IssueEffect().deserialize(
          result.data.issueEffectFindById
        );
        console.log(template);
        context.commit("SET_ITEM", template);
        return template;
      } finally {
        filter.busy = false;
      }
    }
    return currentItem;
  },

  async findAll(context, { filter = null, force = false } = {}) {
    console.log("FINDALL!");
    console.log(context.getters.all.length);
    console.log(force);
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
          query: ISSUE_EFFECT.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        console.log(result);
        const results = result.data.issueEffectFindAll.map(cr => {
          return new IssueEffect().deserialize(cr);
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
  SET_TEMPLATE(state, value) {
    console.log(state, value);
    const index = state.all.findIndex(el => el.id === value.effectId);
    if (index > -1) {
      state.all[index].templates = [...state.all[index].templates, value];
    }
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
