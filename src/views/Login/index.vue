<!--3.0版本-->
<template>
  <div id="login">
    <div class="login-wrap">
      <ul class="menu-tab">
        <li
          v-for="item in menuTab"
          :key="item.id"
          :class="{ current: item.current }"
          @click="toggleMenu(item)"
        >
          {{ item.txt }}
        </li>
      </ul>
      <!--表单 start-->
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="loginForm"
        class="login-form"
        size="medium"
      >
        <el-form-item prop="username" class="item-from">
          <label for="username">邮箱</label>
          <el-input
            id="username"
            type="text"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password" class="item-from">
          <label for="password">密码</label>
          <el-input
            id="password"
            type="password"
            v-model="ruleForm.password"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item
          prop="passwords"
          class="item-from"
          v-show="model === 'register'"
        >
          <label>重复密码</label>
          <el-input
            type="password"
            v-model="ruleForm.passwords"
            autocomplete="off"
            minlength="6"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="code" class="item-from">
          <label>验证码</label>
          <el-row :gutter="10">
            <el-col :span="15">
              <el-input
                v-model="ruleForm.code"
                minlength="6"
                maxlength="6"
              ></el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                type="success"
                class="block"
                @click="getSms"
                :disabled="codeButton.status"
                >{{ codeButton.text }}</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            class="block"
            @click="submitForm('loginform')"
            :disabled="loginButtonStatus"
            >{{ model === "login" ? "登录" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
      <!--表单 end-->
    </div>
  </div>
</template>

<script>
//base64、md5、sha1
import sha1 from "js-sha1";
import { GetSms, Login, Register } from "@/api/login";
import {
  reactive,
  ref,
  isRef,
  toRefs,
  onMounted,
  watch
} from "@vue/composition-api";
import {
  stripscript,
  validateEmail,
  validatePass,
  validateVCode
} from "@/utils/validate.js";

export default {
  name: "login",
  // setup(props, context){
  /**
     *attrs: (...) == this.$attrs
      emit: (...) == this.$emit
      listeners: (...) == this.$listeners
      parent: (...) == this.$parent
      refs: (...) == this.$refs
      root: (...) == this
      */
  setup(props, { refs, root }) {
    /*********************************************************************************************************************
     * 声明数据
     */
    // 这里面放置data数据、生命周期、自定义的函数
    // data
    // 验证用户名
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入邮箱"));
      } else if (validateEmail(value)) {
        callback(new Error("邮箱格式不正确"));
      } else {
        callback(); //true
      }
    };
    // 验证密码
    let validatePassword = (rule, value, callback) => {
      // 过滤后的数据
      ruleForm.password = stripscript(value);
      value = ruleForm.password;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6至20位数字+字母"));
      } else {
        callback();
      }
    };
    //验证重复密码
    let validatePasswords = (rule, value, callback) => {
      //如果模块值未login,直接通过
      if (model.value === "login") {
        callback();
      }
      // 过滤后的数据
      ruleForm.passwords = stripscript(value);
      value = ruleForm.passwords;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (validatePass(value)) {
        callback(new Error("密码为6至20位数字+字母"));
      } else if (value != ruleForm.password) {
        callback(new Error("重复密码和密码不一致"));
      } else {
        callback();
      }
    };
    // 验证验证码
    let validateCode = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("请输入验证码"));
      } else if (validateVCode(value)) {
        return callback(new Error("验证码格式有误"));
      } else {
        callback();
      }
    };
    /**
     * 声明数据
     */
    // 菜单
    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);

    //模块值
    const model = ref("login");

    //验证码按钮
    const codeButton = reactive({
      text: "获取验证码",
      status: false
    });

    //登录按钮禁用状态
    const loginButtonStatus = ref(true);

    //倒计时
    const timer = ref(null);

    //表单绑定数据
    const ruleForm = reactive({
      username: "",
      password: "",
      passwords: "",
      code: ""
    });

    //表单的验证
    const rules = reactive({
      username: [{ validator: validateUsername, trigger: "blur" }],
      password: [{ validator: validatePassword, trigger: "blur" }],
      passwords: [{ validator: validatePasswords, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }]
    });
    /**
     * 声明函数
     */
    const toggleMenu = data => {
      //重置获取验证码定时器
      clearInterval(timer.value);
      menuTab.forEach(elem => {
        elem.current = false;
      });
      //高光
      data.current = true;
      //修改模块值
      model.value = data.type;
      resetForm();
      //重置验证码按钮状态文本
      clearCountDown();
      //登录注册按钮不可用
      loginButtonStatus.value = true;
    };
    /**
     * 获取验证码
     */
    const getSms = () => {
      // 进行提示
      if (ruleForm.username == "") {
        root.$message({ message: "邮箱不能为空！", type: "error" });
        return false;
      }
      if (validateEmail(ruleForm.username)) {
        root.$message({ message: "邮箱格式有误，请重新输入！", type: "error" });
        return false;
      }
      //获取验证码
      let data = {
        username: ruleForm.username,
        module: model.value
      };
      //修改验证码按钮文本
      codeButton.text = "发送中";
      //禁用验证码按钮
      codeButton.status = true;
      //  调定时器,倒计时
      countDown(60);
      // 延时多长时间
      setTimeout(() => {
        GetSms(data)
          .then(response => {
            let message = response.data.message;
            root.$message({ message: message, type: "success" });
            //  启用登录注册按钮
            loginButtonStatus.value = false;
          })
          .catch(error => {});
      }, 3000);
    };
    /**
     * 提交表单
     */
    const submitForm = formName => {
      refs.loginForm.validate(valid => {
        if (valid) {
          model.value == "login" ? login() : register();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    /**
     * 登录
     */
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        module: model.value
      };
      Login(requestData)
        .then(response => {
          root.$router.push({
            name: "Console"
          });
        })
        .catch(error => {});
    };
    /**
     * 注册
     */
    const register = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.password),
        code: ruleForm.code,
        module: model.value
      };
      Register(requestData)
        .then(response => {
          root.$message({
            message: response.data.message,
            type: "success"
          });
          toggleMenu(menuTab[0]);
          clearCountDown();
        })
        .catch(error => {
          alert(error);
        });
    };
    /**
     * 倒计时
     */
    const countDown = number => {
      if (timer.value) {
        clearInterval(timer.value);
      }
      //setTimeout 只执行一次
      // setTimeout(() => {
      //   console.log("setTimeout");
      // }, 1000);
      //setInterval 不断执行，条件停止
      //判断定时器是否存在，存在则清除
      if (timer.value) clearInterval(timer.value);
      let time = number;
      timer.value = setInterval(() => {
        time--;
        if (time === 0) {
          clearInterval(timer.value);
          codeButton.text = "再次获取";
          codeButton.status = false;
        } else {
          codeButton.text = `倒计时${time}秒`;
        }
      }, 1000);
    };
    /**
     * 清除倒计时
     */
    const clearCountDown = () => {
      //还原验证码按钮默认状态
      codeButton.status = false;
      codeButton.text = "获取验证码";
    };
    /**
     * 重置表单
     */
    const resetForm = () => {
      refs.loginForm.resetFields();
    };

    /**
     * 生命周期
     */
    // 挂载完成后
    onMounted(() => {});
    return {
      menuTab,
      codeButton,
      loginButtonStatus,
      model,
      timer,
      ruleForm,
      rules,
      toggleMenu,
      getSms,
      submitForm
    };
  }
};
</script>

<style lang="scss" scoped>
#login {
  height: 100vh;
  background-color: #344a5f;
}
.login-wrap {
  width: 330px;
  margin: auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    font-size: 14px;
    color: #fff;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
.login-form {
  margin-top: 29px;
  label {
    display: block;
    margin-bottom: 3px;
    font-size: 14px;
    color: #fff;
  }
  .item-from {
    margin-bottom: 20px;
  }
  .block {
    display: block;
    width: 100%;
  }
  .login-btn {
    margin-top: 19px;
  }
}
</style>
