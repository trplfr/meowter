export const tokenCheckRange = 120

export const getToken = () => localStorage.getItem('accessToken')
export const clearToken = () => localStorage.removeItem('accessToken')
export const setToken = token => localStorage.setItem('accessToken', token)
