import { IDEA } from "@/graphql";
import { Idea } from "@/models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";
import EventBus from "@/lib/eventbus";

const initialState = () => {
  return {
    ideaInEdit: null,
    loading: false,
    files: [],
    all: [],
    filter: null,
    loadedProcess: []
  };
};

const state = initialState();

const getters = {
  ideaInEdit: state => state.ideaInEdit,
  loading: state => state.loading,
  files: state => state.files,
  all: state => state.all,
  filter: state => state.filter,
  currentTab: state => state.tab,
  byProcess: state => processId =>
    state.all.filter(o => o.processId === processId),
  byStage: state => stageId =>
    state.all.filter(o => o.parentStructure.stageId === stageId),
  byOperation: state => operationId =>
    state.all.filter(o => o.parentStructure.operationId === operationId),
  byPhase: state => phaseId =>
    state.all.filter(o => o.parentStructure.phaseId === phaseId),
  filteredItems: state =>
    state.filter && state.filter.length > 3
      ? state.all.filter(i =>
          i.name.toLowerCase().includes(state.filter.toLowerCase())
        )
      : state.all
};

const actions = {

  async setIdeaInEdit(context, form) {
    EventBus.$emit("idea/currentIdea", {
      form
    });

    context.commit("SET_EDITING_IDEA", form);
  },

  async setIdeaTab(context, form) {
    console.log(form)
    EventBus.$emit("idea/currentTab", {
      form
    });

    context.commit("SET_CURRENT_TAB", form);
  },
  async create(context, form) {
    form.type = "PROCESS";
    const result = await form.mutate({
      mutation: IDEA.create
    });
    const role = new Idea().deserialize(result.data.ideaCreate);
    await context.dispatch('findAll', { force: true });
    return role;
  },

  async update(context, form) {

    form.type = "PROCESS";
    const result = await form.mutate({
      mutation: IDEA.update,
      variables: {
        id: form.id
      }
    });
    const idea = new Idea().deserialize(result.data.ideaUpdate);
    context.commit("SET_ITEM", idea);
    await context.dispatch('findAll', { force: true });
    return idea;
  },

  async setResources(context, form) {
    const result = await form.mutate({
      mutation: IDEA.setResources,
      variables: {
        id: form.id
      }
    });
   // const files = new Idea().deserialize(result.data.ideaUploadResources);
    context.commit("SET_FILES", result.data.ideaUploadResources);
  //  await context.dispatch('findAll', { force: true });
    return result.data.ideaUploadResources;
  },
  async removeResources(context, form) {
    const result = await form.mutate({
      mutation: IDEA.removeResources,
      variables: {
        id: form.id
      }
    });
    return result.data.ideaRemoveResources;
  },

  async changeStatus(context, form) {
    let ret = null;
    try {
      form.busy = true;
      const result = await form.mutate({
        mutation: IDEA.changeStatus,
        variables: {
          id: form.id,
          status: form.status
        }
      });
      ret = new Idea().deserialize(result.data.ideaChangeStatus);
      // context.dispatch('findAll', { force: true });
    } catch (e) {
      console.log(e);
    } finally {
      form.busy = false;
    }

    return ret;
  },

  async delete(context, form) {
    const result = await form.mutate({
      mutation: IDEA.delete,
      variables: {
        id: form.id
      }
    });
    context.commit("REMOVE_ITEM", form);
    // await context.dispatch('findAll', { force: true });
    return result.data.ideaDelete;
  },

  async deleteImprovement(context, form) {
    const result = await form.mutate({
      mutation: IDEA.deleteImprovement,
      variables: {
        id: form.improvement_id
      }
    });
    context.commit("REMOVE_IMPROVE_ITEM", form);
    // await context.dispatch('findAll', { force: true });
    return result.data.ideaDelete;
  },

  async closeFeedback(context, form) {
    const result = await form.mutate({
      mutation: IDEA.closeFeedback,
      variables: {
        id: form.ideaId
      }
    });
    const idea = new Idea().deserialize(result.data.ideaCloseFeedback);
    context.commit("SET_ITEM", idea);
    // await context.dispatch('findAll', { force: true });
    return result.data.ideaCloseFeedback;
  },

  async closeImprovementFeedback(context, form) {
    const result = await form.mutate({
      mutation: IDEA.closeImprovementFeedback,
      variables: {
        id: form.id,
        improvementIds: form.improvementIds
      }
    });
    const idea = new Idea().deserialize(
      result.data.ideaImprovementCloseFeedback
    );
    context.commit("SET_ITEM", idea);

    return result.data.ideaImprovementCloseFeedback;
  },

  async findById(context, filter) {
    const currentItem = context.state.all.find(o => o.id === filter.id);
    const force = filter.force || false;

    if (!currentItem || force || !currentItem.loaded) {
      try {
        const query = apolloClient.watchQuery({
          query: IDEA.findById,
          variables: filter
        });
        const { result } = await queryToPromise(query);
        const idea = new Idea().deserialize(result.data.ideaFindById);
        idea.loaded = true;
        context.commit("SET_ITEM", idea);
        return idea;
      } finally {
        filter.busy = false;
      }
    }
    return currentItem;
  },

  async findByProcess(context, filter) {
    if (!context.state.loadedProcess.includes(filter.id) || filter.force) {
      const query = apolloClient.watchQuery({
        query: IDEA.findAll,
        variables: {
          filter: {
            where: {
              and: [
                {
                  field: "process_id",
                  value: filter.id
                },
                {
                  field: "type",
                  value: "PROCESS"
                }
              ]
            }
          }
        }
      });
      const { result } = await queryToPromise(query);
      context.commit("REMOVE_BY_PROCESS", {
        id: filter.id
      });
      result.data.ideaFindAll.map(o => {
        context.commit("SET_ITEM", new Idea().deserialize(o));
      });
    }
  },

  async findAll(context, { filter = null, force = false } = {}) {
    if (context.getters.all.length === 0 || force) {
      filter = filter || {
        data: {
          orderBy: ["title"],
          where: {
            and: [
              {
                field: "type",
                value: "PROCESS"
              }
            ]
          }
        }
      };
      filter.busy = context.getters.all.length < 1;
      try {
        /* const { data } = await apolloClient.watchquery({
                    query: IDEA.findAll,
                    variables: { filter: filter }
                }); */
        const query = apolloClient.watchQuery({
          query: IDEA.findAll,
          variables: {
            filter: filter.data
          }
        });
        const { result } = await queryToPromise(query);
        const results = result.data.ideaFindAll.map(cr => {
          return new Idea().deserialize(cr);
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
  SET_EDITING_IDEA(state, value) {
    state.ideaInEdit = value;
  },
  SET_CURRENT_TAB(state, value) {
    state.currentTab = value.tab;
  },
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
  SET_ALL(state, value) {
    state.all = value;
  },
  SET_FILES(state, value) {
    state.files = value;
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
  REMOVE_BY_PROCESS(state, value) {
    state.all = state.all.filter(o => o.processId != value.id);
  },
  REMOVE_ITEM(state, value) {
    state.all = state.all.filter(o => o.id != value.id);
  },
  REMOVE_IMPROVE_ITEM(state, value) {
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all[index]["improvements"].filter(
        imp => imp.id !== value.improvement_id
      );
      state.all = [...state.all];
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
