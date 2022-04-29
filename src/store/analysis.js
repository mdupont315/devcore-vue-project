const initialState = () => {
  return {
    activeTab: "general",
    analysisReady: true,
    selectedTabView: "savings",
    chartTimespan: [
      "Q3 2017",
      "Q4 2017",
      "Q1 2018",
      "Q2 2018",
      "Q3 2018",
      "Q4 2018",
      "Q1 2019"
    ],
    chartDatasets: [
      {
        label: "ISSUES",
        data: [1, 12, 14, 16, 19, 24, 27]
      },
      {
        label: "PEOPLE",
        data: [1, 9, 17, 22, 25, 31, 32]
      },
      {
        label: "PROCESS",
        data: [1, 12, 18, 24, 29, 33, 35]
      },
      {
        label: "TOOLS",
        data: [1, 14, 19, 26, 31, 35, 39]
      },
      {
        label: "IDEAS",
        data: [1, 18, 22, 27, 31, 34, 38]
      }
    ]
  };
};

const state = initialState();

const getters = {
  activeTab: state => state.activeTab,
  analysisReady: state => state.analysisReady,
  selectedTabView: state => state.selectedTabView,
  chartTimespan: state => state.chartTimespan,
  chartDatasets: state => state.chartDatasets,
};

const mutations = {
  SET_ANALYSIS_READY(state, readiness){
    state.analysisReady = readiness
  },
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
