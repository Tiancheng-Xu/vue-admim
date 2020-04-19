import { Login } from "@/api/login";
const state = {};

const getters = {};

const mutations = {};

const actions = {
  // 可以回调处理事情
  login(content, repuestData) {
    return new Promise((resolve, reject) => {
      Login(repuestData)
        .then(response => {
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
