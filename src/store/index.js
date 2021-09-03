import Vue from "vue";
import Vuex from "vuex";
import { apolloProvider } from "../plugins/apollo/client";
import { TEST_QUERY } from "../graphql";
import app from "./app";
import auth from "./auth";
import profile from "./profile";
import currency from "./currency";
import company from "./company";
import companyRole from "./company_role";
import process from "./process";
import processStage from "./processstage";
import processOperation from "./processoperation";
import processPhase from "./processphase";
import user from "./user";
import role from "./role";
import toolArea from "./toolarea";
import tool from "./tool";
import toolModule from "./toolModule";
import toolCategory from "./toolcategory";
import companyTool from "./companytool";
import companyToolPrice from "./companytoolprice";
import companyToolModule from "./compantoolmodule";
import productCategory from "./productcategory";
import priceModel from "./pricemodel";
import idea from "./idea";
import issue from "./issue";
import toolIdea from "./tool_idea";
import project from "./project";
import product from "./product";
import nav from "./nav";
import layers from "./layers";
import people from "./people";
import report from "./report";
import analysis from "./analysis";
import milestone from "./milestone";
import issueEffect from "./issue_effect";
import ideaIssueReply from "./idea_issue_reply";

import EventBus from "@/lib/eventbus";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    test: null,
    loading: false
  },
  getters: {
    test: state => state.test,
    loading: state => state.loading
  },
  mutations: {
    setTest(state, data) {
      state.test = data;
    },
    setLoading(state, loading) {
      state.loading = loading;
    }
  },
  actions: {
    async testQuery({ commit }) {
      const query = apolloProvider.defaultClient.watchQuery({
        query: TEST_QUERY
      });
      query.subscribe(o => {
        commit("setLoading", o.loading);
        if (!o.loading) {
          commit("setTest", o.data.test);
        }
      });
      return query;
    }
  },
  modules: {
    app,
    nav,
    layers,
    auth,
    profile,
    currency,
    tool,
    toolModule,
    toolCategory,
    company,
    companyRole,
    user,
    role,
    toolArea,
    companyTool,
    companyToolModule,
    companyToolPrice,
    priceModel,
    productCategory,
    product,
    process,
    processStage,
    processOperation,
    processPhase,
    idea,
    issue,
    toolIdea,
    project,
    people,
    report,
    analysis,
    milestone,
    issueEffect,
    ideaIssueReply
  }
});

function resetStates() {
  store.commit("company/RESET_STATE");
  store.commit("companyRole/RESET_STATE");
  store.commit("user/RESET_STATE");
  store.commit("role/RESET_STATE");
  store.commit("toolArea/RESET_STATE");
  store.commit("toolCategory/RESET_STATE");
  store.commit("companyTool/RESET_STATE");
  store.commit("companyToolModule/RESET_STATE");
  store.commit("priceModel/RESET_STATE");
  store.commit("productCategory/RESET_STATE");
  store.commit("product/RESET_STATE");
  store.commit("process/RESET_STATE");
  store.commit("processStage/RESET_STATE");
  store.commit("processOperation/RESET_STATE");
  store.commit("processPhase/RESET_STATE");
  store.commit("idea/RESET_STATE");
  store.commit("issue/RESET_STATE");
  store.commit("toolIdea/RESET_STATE");
  store.commit("project/RESET_STATE");
  store.commit("people/RESET_STATE");
  store.commit("analysis/RESET_STATE");
}

EventBus.$on("auth/LOGIN", resetStates);
EventBus.$on("auth/LOGOUT", resetStates);

export default store;
