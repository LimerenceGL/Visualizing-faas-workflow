const state = {
  data: {"nodes": [], "edges": [], "combos": [], "groups": []},
  workflowName: ""
};

const mutations = {
  SET_DATA(state, newData) {
    state.data = newData;
  },
  SET_WORKFLOW_NAME(state, newName) {
    state.workflowName = newName;
  }
};

const actions = {
  setData({ commit }, newData) {
    commit('SET_DATA', newData);
  },
  setWorkflowName({ commit }, newName) {
    commit('SET_WORKFLOW_NAME', newName);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
