import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import formReducer from './slices/formSlice';
import loadingReducer from './slices/loadingSlice';
import testReducer from './slices/testSlice';
import chatReducer from './slices/chatSlice';
import resumeReducer from './slices/resumeSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    form: formReducer,
    loading: loadingReducer,
    test: testReducer,
    chat:chatReducer,
    resume:resumeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
