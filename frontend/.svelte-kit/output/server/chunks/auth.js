import { w as writable } from "./index2.js";
const createAuthStore = () => {
  const storedToken = null;
  const initial = {
    user: null,
    token: storedToken,
    isAuthenticated: !!storedToken
  };
  const { subscribe, set, update } = writable(initial);
  return {
    subscribe,
    login: (user, token) => {
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      set({ user: null, token: null, isAuthenticated: false });
    },
    updateUser: (user) => {
      update((state) => ({ ...state, user }));
    }
  };
};
const auth = createAuthStore();
export {
  auth as a
};
