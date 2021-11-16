import { EXPERIENCE } from "@/graphql";
import { Experience } from "@/models";

const initialState = () => {
  return {
    loading: false,
    all: [],
    filter: null
  };
};

const state = initialState();

const getters = {
  loading: state => state.loading,
  all: state => state.all
};

const actions = {
  async update(context, form) {
    console.log("UPDATE STORE");
    const result = await form.mutate({
      mutation: EXPERIENCE.increaseUserExperience
    });
    const experience = new Experience().deserialize(
      result.data.increaseUserExperience
    );
    return experience;
  }
};

const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
