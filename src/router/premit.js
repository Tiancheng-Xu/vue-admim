import router from "./index";
import store from "@/store/index";
import { getToKen, removeToKen, removeUserName } from "@/utils/app";

const whiteRouter = ["/login"]; //indexOf方法，判断数组中是否存在指定对象，如果不存在，则返回-1
//路由守卫
router.beforeEach((to, from, next) => {
  if (getToKen()) {
    if (to.path === "/login") {
      removeToKen();
      removeUserName();
      store.commmit("app/SET_TOKEN", "");
      store.commmit("app/SET_USERNAME", "");
      next();
    } else {
      next();
    }
    //路由动态添加，分配菜单，每个角色分配不同的菜单
    console.log("存在cookie");
    next();
  } else {
    console.log("不存在cookie");
    if (whiteRouter.indexOf(to.path) !== -1) {
      next();
    } else {
      next("/login");
    }
  }
});
