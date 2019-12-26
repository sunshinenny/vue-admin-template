import axios from 'axios'; // 引入axios
import QS from 'qs'; // 引入qs模块，用来序列化post类型的数据，后面会提到
// vant的toast提示框组件，大家可根据自己的ui组件更改。
import Vue from 'vue';
import {
  Message
} from 'element-ui'
Vue.prototype.$message = Message;
// import { Toast } from 'mint-ui';


// const baseURL = 'http://10.176.8.221:8001/';// Windows开发
// const baseURL = 'http://localhost:8002/'; // Mac开发
const baseURL = "http://193.112.129.74:8002/" // 服务器部署
export {
  baseURL
};
// 环境的切换
if (process.env.NODE_ENV == 'development') {
  axios.defaults.baseURL = baseURL;
} else if (process.env.NODE_ENV == 'debug') {
  axios.defaults.baseURL = baseURL;
} else if (process.env.NODE_ENV == 'production') {
  axios.defaults.baseURL = baseURL;
}
axios.defaults.timeout = 60000

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
// axios.defaults.headers.post['Content-Type'] = 'multipart/form-data'

// 先导入vuex,因为我们要使用到里面的状态对象
// 此时的Vuex为目录形式
import store from '@/store';
import Cookies from 'js-cookie'
import {
  getToken,
  removeToken,
  getUsername
} from "@/utils/auth.js"
// import {
//   param
// } from '_change-case@3.1.0@change-case';

// 请求拦截器
axios.interceptors.request.use(
  config => {
    if (getUsername() != "" && getUsername() != undefined) {
      config.headers['editor'] = getUsername()
    }
    // if (config.method === "post") {
    //   config.data = QS.stringify(config.data);
    // }
    // 每次发送请求之前判断vuex中是否存在token
    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
    const token = Cookies.get("Admin-Token")
    token && (config.headers.Authorization = token);
    return config;
  },
  error => {
    return Promise.error(error);
  })
// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (response.status === 200) {
      return Promise.resolve(response);
    } else {
      return Promise.reject(response);
    }
  },
  // 服务器状态码不是2开头的的情况
  // 这里可以跟你们的后台开发人员协商好统一的错误状态码
  // 然后根据返回的状态码进行一些操作，例如登录过期提示，错误提示等等
  // 下面列举几个常见的操作，其他需求可自行扩展
  error => {
    if (error.response.status == 500 && error.response.msg.indexOf("expired") != -1) {
      // 代表token超时
      // 返回到登陆页面
      router.replace({
        path: '/login',
        query: {
          redirect: router.currentRoute.fullPath
        }
      });
    }
    if (error.response.status) {
      switch (error.response.status) {
        // 499: 未登录 // 自定义的错误码
        // 未登录则跳转登录页面，并携带当前页面的路径
        // 在登录成功后返回当前页面，这一步需要在登录页操作。
        case 499: {
          this.$message('非法操作，请登录');
          router.replace({
            path: '/login',
            query: {
              redirect: router.currentRoute.fullPath
            }
          })
        };
        break;
        // 403 token过期
        // 登录过期对用户进行提示
        // 清除本地token和清空vuex中token对象
        // 跳转登录页面
      case 403:
        // Toast({
        //     message: '登录过期，请重新登录',
        //     position: 'bottom',
        //     duration: 1000
        // });
        this.$message('登陆过期,请重新登陆');
        // 清除token
        removeToken();
        // store.commit('loginSuccess', null);
        // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
        setTimeout(() => {
          router.replace({
            path: '/login',
            query: {
              redirect: router.currentRoute.fullPath
            }
          });
        }, 1000);
        break;

        // 404请求不存在
      case 404:
        // Toast({
        //     message: '网络请求不存在',
        //     position: 'bottom',
        //     duration: 1000
        // });
        this.$message('网络请求不存在');
        break;
        // 其他错误，直接抛出错误提示
      default:
        // Toast({
        //     message: error.response.data.message,
        //     duration: 1500,
        //     forbidClick: true
        // });
        // Toast({
        //     message: error.response.data.message,
        //     position: 'bottom',
        //     duration: 1000
        // });
        this.$message('这是一条消息提示');
      }
      return Promise.reject(error.response);
    }
  })
/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: params
    }).then(res => {
      resolve(res.data);
    }).catch(err => {
      reject(err.data)
    })
  });
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params, headers) {
  console.log(params,"http post function");
  return new Promise((resolve, reject) => {
    console.log('http post function promise');
    console.log(QS.stringify(params), "QS.stringify(params)");
    axios.post(url, QS.stringify(params), {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      })
      .then(res => {
        console.log('http post function return resolve');
        resolve(res.data);
      })
      .catch(err => {
        reject(err.data)
      })
  });
}

/**
 * JSON方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function json(url, params, headers) {
  return new Promise((resolve, reject) => {
    axios.post(url, QS.stringify(params), {
        'Content-Type': 'application/json; charset=utf-8',
        'dataType': 'json'
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err.data)
      })
  });
}

/**
 * upload方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function upload(url, params, headers) {
  return new Promise((resolve, reject) => {
    axios.post(url, params, {
        'Content-Type': ':multipart/form-data;'
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err.data)
      })
  });
}

/**
 * upload方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function download(url, params, headers) {
  return new Promise((resolve, reject) => {
    axios.post(url, QS.stringify(params), {
        responseType: "blob"
      })
      .then(res => {
        // 此处的参数和其他方法不同,原因：需要使用返回值自带的方法
        resolve(res);
      })
      .catch(err => {
        reject(err.data)
      })
  });
}
