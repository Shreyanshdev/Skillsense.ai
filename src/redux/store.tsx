import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import formReducer from './formSlice';
import loadingReducer from './loadingSlice';
import testReducer from './slices/testSlice';
import chatReducer from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    form: formReducer,
    loading: loadingReducer,
    test: testReducer,
    chat:chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
