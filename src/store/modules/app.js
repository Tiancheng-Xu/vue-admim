import { Login } from "@/api/login";
import {
  setToKen,
  removeToKen,
  setUserName,
  getUserName,
  removeUserName
} from "@/utils/app";
const state = {
  isCollapse: JSON.parse(sessionStorage.getItem("isCollapse")) || false,
  to_ken: "",
  username: getUserName() || ""
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
  },
  SET_TOKEN(state, value) {
    state.to_ken = value;
  },
  SET_USERNAME(state, value) {
    state.username = value;
  }
};

const actions = {
  // 可以回调处理事情
  login(content, repuestData) {
    return new Promise((resolve, reject) => {
      Login(repuestData)
        .then(response => {
          let data = response.data.data;
          content.commit("SET_TOKEN", data.token);
          content.commit("SET_USERNAME", data.username);
          setToKen(data.token);
          setUserName(data.username);
          // token、username
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
  exit({ commit }) {
    return new Promise((resolve, reject) => {
      removeToKen();
      removeUserName();
      commit("SET_TOKEN", "");
      commit("SET_USERNAME", "");
      resolve();
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
