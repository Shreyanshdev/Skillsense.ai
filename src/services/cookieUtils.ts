// src/services/cookieUtils.ts
import Cookies from 'js-cookie'; // npm install js-cookie @types/js-cookie

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => {
  Cookies.set(name, value, options);
};

export const removeCookie = (name: string, options?: Cookies.CookieAttributes) => {
  Cookies.remove(name, options);
};