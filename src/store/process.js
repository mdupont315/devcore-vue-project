import { PROCESS } from "@/graphql";
import { Process } from "@/models";
import { queryToPromise } from "../lib/utils";
import { apolloClient } from "../plugins/apollo/client";
import { AppStorage } from "@/lib/appstorage";
import EventBus from "@/lib/eventbus";

const initialState = () => {
  return {
    loading: false,
    loaded: false,
    all: [],
    filter: null,
    storage: AppStorage.get("CURRENT_PROCESS", {}),
    currentSection: null,
    sectionsLoaded: {}
  };
};
function loadCurrent(state, section) {
  const current = {
    process: null,
    stage: null,
    operation: null,
    phase: null
  };

  if (!section) {
    current.process = null;

    return current;
  }
  state.storage[section] = state.storage[section] || {};

  console.log("@loadCurrent");
  console.log(state.storage);

  if (state.storage[section].processId) {
    current.process = state.all.find(
      p => p.id === state.storage[section].processId
    );
  }
  if (!current.process && state.all.length > 0) {
    console.log("NO CURRENT PROCESS!");
    const mostRecentSectionModified = state.storage["latestModify"];

    console.log(mostRecentSectionModified);

    if (mostRecentSectionModified && mostRecentSectionModified.processId) {
      console.log(mostRecentSectionModified.processId);
      current.process = state.all.find(
        p => p.id == mostRecentSectionModified.processId
      );
    }
    //  else {
    //   current.process = state.all[0];
    // }
  }

  if (current.process && current.process.loaded) {
    console.log("1!");
    if (state.storage[section].stageId) {
      current.stage = current.process.stages.find(
        i => i.id === state.storage[section].stageId
      );
    }
    if (state.storage[section].operationId) {
      current.operation = current.stage
        ? current.stage.operations.find(
            i => i.id === state.storage[section].operationId
          )
        : null;
    }
    if (state.storage[section].phaseId) {
      current.phase = current.operation
        ? current.operation.phases.find(
            i => i.id === state.storage[section].phaseId
          )
        : null;
    }
  } else {
    console.log("2!");

    current.stage = null;
    current.operation = null;
    current.phase = null;
  }
  return current;
}

const state = initialState();

const getters = {
  loading: state => state.loading,
  all: state => state.all,
  filter: state => state.filter,
  currentSection: state => state.currentSection,
  current: state => {
    return section => {
      return loadCurrent(state, section);
    };
  },
  filteredItems: state =>
    state.filter && state.filter.length > 3
      ? state.all.filter(i => {
          return i.title.toLowerCase().includes(state.filter.toLowerCase());
        })
      : state.all
};

const actions = {
  async create(context, form) {
    try {
      form.busy = true;
      const result = await form.mutate({
        mutation: PROCESS.create
      });
      const process = new Process().deserialize(result.data.processCreate);
      process.loaded = true;
      context.commit("SET_ITEM", process);
      return process;
    } finally {
      form.busy = false;
    }
  },

  async update(context, form) {
    try {
      form.busy = true;
      const result = await form.mutate({
        mutation: PROCESS.update,
        variables: {
          id: form.id
        }
      });
      const process = new Process().deserialize(result.data.processUpdate);
      process.loaded = true;
      context.commit("SET_ITEM", process);
      return process;
    } finally {
      form.busy = false;
    }
  },

  async delete(context, form) {
    const result = await form.mutate({
      mutation: PROCESS.delete,
      variables: { id: form.id }
    });
    await context.dispatch("findAll", {
      force: true
    });
    return result.data.processDelete;
  },

  async findAll(context, { filter = null, force = false } = {}) {
    filter = filter || {
      data: {
        orderBy: ["title"]
      }
    };

    try {
      if (!context.state.loading) {
        if (!context.state.loaded || force) {
          context.commit("SET_LOADING", true);

          filter.busy = true;

          const query = apolloClient.watchQuery({
            query: PROCESS.findAll,
            variables: {
              filter: filter.data,
              withStages: true
            }
          });
          const { result } = await queryToPromise(query);

          const results = result.data.processFindAll.map(r => {
            return new Process().deserialize(r);
          });
          context.commit("SET_ALL", results);
          context.commit("SET_LOADED", true);
        }
      }
    } finally {
      context.commit("SET_LOADING", false);
      filter.busy = false;
    }
  },

  async refreshCurrent(context, section) {
    if (
      context.getters.current(section) &&
      context.getters.current(section).process
    ) {
      return context.dispatch("findById", {
        id: context.getters.current(section).process.id,
        force: true
      });
    }
  },

  async findById(context, filter) {
    const currentItem = context.state.all.find(o => o.id === filter.id);
    const force = filter.force || false;

    if (!currentItem || force || !currentItem.loaded) {
      try {
        const query = apolloClient.watchQuery({
          query: PROCESS.findById,
          variables: filter
        });
        const { result } = await queryToPromise(query);
        const process = new Process().deserialize(result.data.processFindById);
        process.loaded = true;
        context.commit("SET_ITEM", process);
        context.commit("CHECK_CURRENT_PROCESS");
        return process;
      } finally {
        filter.busy = false;
      }
    }
    return currentItem;
  },

  async filter(context, filter) {
    context.commit("SET_FILTER", filter);
  },

  async setCurrentSection(context, section) {
    context.commit("SET_CURRENT_SECTION", section);
  },

  async setCurrentProcess(
    context,
    { section, process, stage, operation, phase }
  ) {
    console.log({ section, process, stage, operation, phase });
    context.commit("SET_CURRENT_PROCESS", {
      section,
      process,
      stage,
      operation,
      phase
    });
    EventBus.$emit("process/changeCurrent", {
      section,
      process,
      stage,
      operation,
      phase
    });
  }
};

const mutations = {
  RESET_STATE(state) {
    Object.assign(state, initialState());
    return state;
  },
  SET_LOADING(state, value) {
    state.loading = value;
  },
  SET_LOADED(state, value) {
    state.loaded = value;
  },
  SET_ALL(state, value) {
    state.all = value;
  },
  SET_SECTION_LOADED(state, value) {
    state.sectionsLoaded[value.section] = value.loaded;
  },
  SET_ITEM(state, value) {
    console.log("state");
    console.log(state);
    const index = state.all.findIndex(el => el.id === value.id);
    if (index > -1) {
      state.all[index] = value;
      state.all = [...state.all];
    } else {
      state.all.push(value);
    }
  },
  SET_CURRENT_SECTION(state, section) {
    state.currentSection = section;
  },
  SET_FILTER(state, value) {
    state.filter = value;
  },

  CHECK_CURRENT_PROCESS(state) {
    const current = loadCurrent(state, state.currentSection);
    const currentStorage = state.storage[state.currentSection] || {};

    // state.current[section] = current;

    AppStorage.set(
      "CURRENT_PROCESS",
      Object.assign(AppStorage.get("CURRENT_PROCESS", {}), {
        [state.currentSection]: {
          processId: current.process
            ? current.process.id
            : currentStorage.processId,
          stageId: current.stage ? current.stage.id : currentStorage.stageId,
          operationId: current.operation
            ? current.operation.id
            : currentStorage.operationId,
          phaseId: current.phase ? current.phase.id : currentStorage.phaseId
        }
      })
    );
    state.storage = AppStorage.get("CURRENT_PROCESS");
  },
  SET_CURRENT_PROCESS(state, { section, process, stage, operation, phase }) {
    console.log("SETTING PROCESS!");
    console.log(state);
    console.log("process: ");
    console.log(process);
    console.log("localstorage");
    console.log(AppStorage.get("CURRENT_PROCESS"));
    AppStorage.set(
      "CURRENT_PROCESS",
      Object.assign(AppStorage.get("CURRENT_PROCESS", {}), {
        latestModify: {
          timestamp: new Date(),
          section: section,
          processId: process
        },
        [section]: {
          processId: process ? process.id : null,
          stageId: stage ? stage.id : null,
          operationId: operation ? operation.id : null,
          phaseId: phase ? phase.id : null
        }
      })
    );
    state.storage = AppStorage.get("CURRENT_PROCESS");
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
