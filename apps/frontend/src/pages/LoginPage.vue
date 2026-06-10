<template>
  <section class="auth-page card">
    <header class="auth-header">
      <h1 class="auth-title">知识关系管理平台</h1>
      <p class="auth-subtitle">登录后即可管理图谱、节点关系与文档版本。</p>
    </header>

    <div class="auth-tabs">
      <button
        data-testid="tab-login"
        :class="['auth-tab-btn', tab === 'login' ? 'auth-tab-btn-active' : 'auth-tab-btn-inactive']"
        @click="tab = 'login'"
      >
        登录
      </button>
      <button
        data-testid="tab-register"
        :class="['auth-tab-btn', tab === 'register' ? 'auth-tab-btn-active' : 'auth-tab-btn-inactive']"
        @click="tab = 'register'"
      >
        注册
      </button>
    </div>

    <form v-if="tab === 'login'" class="auth-form" @submit.prevent="submitLogin">
      <div class="auth-field">
        <label>用户名</label>
        <input data-testid="login-username" v-model.trim="loginForm.username" class="auth-input" />
      </div>
      <div class="auth-field">
        <label>密码</label>
        <input data-testid="login-password" v-model="loginForm.password" class="auth-input" type="password" />
      </div>
      <p v-if="errorMsg" class="error-text auth-error" data-testid="auth-error">{{ errorMsg }}</p>
      <button data-testid="login-submit" class="btn btn-primary auth-submit" type="submit">登录</button>
    </form>

    <form v-else class="auth-form" @submit.prevent="submitRegister">
      <div class="auth-field">
        <label>用户名</label>
        <input data-testid="register-username" v-model.trim="registerForm.username" class="auth-input" />
      </div>
      <div class="auth-field">
        <label>邮箱</label>
        <input data-testid="register-email" v-model.trim="registerForm.email" class="auth-input" type="email" />
      </div>
      <div class="auth-field">
        <label>密码</label>
        <input data-testid="register-password" v-model="registerForm.password" class="auth-input" type="password" />
      </div>
      <div class="auth-field">
        <label>确认密码</label>
        <input
          data-testid="register-confirm-password"
          v-model="registerForm.confirm_password"
          class="auth-input"
          type="password"
        />
      </div>
      <p v-if="errorMsg" class="error-text auth-error" data-testid="auth-error">{{ errorMsg }}</p>
      <button data-testid="register-submit" class="btn btn-primary auth-submit" type="submit">注册</button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { getErrorMessage } from '@/utils/error';

const router = useRouter();
const authStore = useAuthStore();

const tab = ref('login');
const errorMsg = ref('');

const loginForm = reactive({ username: '', password: '' });
const registerForm = reactive({ username: '', email: '', password: '', confirm_password: '' });

const submitLogin = async () => {
  errorMsg.value = '';
  if (!loginForm.username || !loginForm.password) {
    errorMsg.value = '请填写用户名和密码';
    return;
  }
  try {
    await authStore.login(loginForm);
    await authStore.fetchMe();
    await router.push('/');
  } catch (error) {
    errorMsg.value = getErrorMessage(error, '登录失败');
  }
};

const submitRegister = async () => {
  errorMsg.value = '';
  if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.confirm_password) {
    errorMsg.value = '请完整填写注册信息';
    return;
  }
  if (registerForm.password !== registerForm.confirm_password) {
    errorMsg.value = '两次输入的密码不一致';
    return;
  }
  try {
    await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    });
    tab.value = 'login';
    loginForm.username = registerForm.username;
    loginForm.password = registerForm.password;
    registerForm.email = '';
    registerForm.confirm_password = '';
  } catch (error) {
    errorMsg.value = getErrorMessage(error, '注册失败');
  }
};
</script>
