// import { login, logout, getInfo } from '@/api/user'
import {login,info} from '@/request/api.js'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUsername,setUsername,removeUsername} from '@/utils/auth'
import { getPassword,setPassword,removePassword } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  username:'',
  password:''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_USERNAME: (state, username)=>{
    state.username = username
  },
  SET_PASSWORD: (state, password)=>{
    state.password = password
  },
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    console.log('Store - login');
    const { username, password } = userInfo
    commit('SET_USERNAME',username)
    commit('SET_PASSWORD',password)
    setUsername(username)
    setPassword(password)
    console.log('1');
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        console.log('2.1');
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        console.log('2.2');
        resolve()
        console.log('2.3');
      }).catch(error => {
        console.log('2.1.1');
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    console.log('Store - Get Info');
    return new Promise((resolve, reject) => {
      info({username:getUsername(),password:getPassword()}).then(response => {
        const { data } = response
        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
        commit('SET_TOKEN', '')
        removeToken()
        removePassword()
        removeUsername()
        resetRouter()
        resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

