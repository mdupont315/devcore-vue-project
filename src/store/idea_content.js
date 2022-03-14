import { IDEA_CONTENT } from "@/graphql";
import { IdeaContent } from "@/models";

const initialState = () => {
  return {
    ideaInEdit: null,
    loading: false,
    all: [],
    filter: null,
    loadedProcess: []
  };
};

const state = initialState();

const getters = {
  loading: state => state.loading,
  all: state => state.all,
  filter: state => state.filter
};

const actions = {
  async create(context, form) {
    console.log("IDEA CONTENT!")
    console.log(form)
    const result = await form.mutate({
      mutation: IDEA_CONTENT.create
    });
    const ideaContent = new IdeaContent().deserialize(result.data.ideaContentCreate);
    return ideaContent;
  },

  async update(context, form) {
    const result = await form.mutate({
      mutation: IDEA_CONTENT.update,
      variables: {
        id: form.id
      }
    });
    const ideaContent = new IdeaContent().deserialize(result.data.ideaContentUpdate);
    context.commit("SET_ITEM", ideaContent);
    return ideaContent;
  },

  async filter(context, filter) {
    context.commit("SET_FILTER", filter);
  }
};

const mutations = {
  SET_FILTER(state, value) {
    state.filter = value;
  },
  SET_ALL(state, value) {
    state.all = value;
  },
  SET_ITEM(state, value) {
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all[index] = value;
      state.all = [...state.all];
    } else {
      state.all.push(value);
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
