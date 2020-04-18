import { Login } from "@/api/login";
const state = {
  isCollapse: JSON.parse(sessionStorage.getItem("isCollapse")) || false
};

const getters = {
  isCollapse: state => state.isCollapse
};

const mutations = {
  // 必须的  同步 没有回调处理事情
  SET_COLLAPSE(state) {
    state.isCollapse = !state.isCollapse;
    // html5本地储存
    sessionStorage.setItem("isCollapse", JSON.stringify(state.isCollapse));
  }
};

const actions = {
  // 可以回调处理事情
  login({ commit }, repuestData) {
    return new Promise((resolve, reject) => {
      Login(repuestData)
        .then(response => {
          let data = response.data.data;
          // 普通的
          // content.commit('SET_TOKEN', data.toKen);
          // content.commit('SET_USERNAME', data.username);
          // 解构的
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
