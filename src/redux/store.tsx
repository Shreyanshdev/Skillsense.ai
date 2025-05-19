import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import formReducer from './formSlice';
import loadingReducer from './loadingSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    form: formReducer,
    loading: loadingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
