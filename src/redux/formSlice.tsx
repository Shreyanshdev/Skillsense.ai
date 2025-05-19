// store/formSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
  name: string;
  email: string;
  password: string;
  resume: File | null;
}

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
  resume: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setResume(state, action: PayloadAction<File | null>) {
      state.resume = action.payload;
    },
    resetForm(state) {
      state.name = '';
      state.email = '';
      state.password = '';
      state.resume = null;
    },
  },
});

export const { setName, setEmail, setPassword, setResume, resetForm } = formSlice.actions;
export default formSlice.reducer;
