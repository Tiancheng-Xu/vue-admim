import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

import Layout from "@/views/Layout";

const routes = [
  {
    path: "/",
    redirect: "login",
    hidden: true,
    meata: {
      name: "主页"
    }
  },
  {
    path: "/login",
    name: "Login",
    hidden: true,
    meta: { name: "登录" },
    component: () => import("../views/Login/index.vue")
  },
  {
    path: "/console",
    name: "Console",
    redirect: "index",
    meta: {
      name: "控制台",
      icon: "console"
    },
    component: Layout,
    children: [
      {
        path: "/index",
        name: "Index",
        meta: {
          keepAlive: true,
          name: "首页"
        },
        component: () => import("../views/Console/index.vue")
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

export default router;
