import api from "./api";

export const saveToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const isLoggedIn = (): boolean => {
  return !!getToken();
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};