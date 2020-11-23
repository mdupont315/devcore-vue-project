const initialState = () => {
  return {
    activeTab: "general"
  };
};

const state = initialState();

const getters = {
  activeTab: state => state.activeTab
};

const mutations = {
  SET_ACTIVE_TAB(state, activeTab) {
    state.activeTab = activeTab;
  },
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  }
};

const actions = {
  async setActiveTab(context, activeTab) {
    context.commit("SET_ACTIVE_TAB", activeTab);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
