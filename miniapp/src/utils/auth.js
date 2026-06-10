export function getOpenid() {
  let openid = localStorage.getItem('openid')
  if (!openid) {
    openid = 'wx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    localStorage.setItem('openid', openid)
  }
  return openid
}
