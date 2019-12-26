import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'
const UsernameKey= 'vue_admin_template_username'
const PasswordKey = 'vue_admin_template_password'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getUsername() {
  return Cookies.get(UsernameKey)
}

export function setUsername(username) {
  console.log('setusername');
  return Cookies.set(UsernameKey, username)
}

export function removeUsername() {
  return Cookies.remove(UsernameKey)
}

export function getPassword() {
  return Cookies.get(PasswordKey)
}

export function setPassword(password) {
  return Cookies.set(PasswordKey, password)
}

export function removePassword() {
  return Cookies.remove(PasswordKey)
}