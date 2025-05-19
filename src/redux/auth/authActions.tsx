import { AppDispatch } from '../store';
import { authStart, authSuccess, authFailure } from './authSlice';

// Mock example with fetch
export const signIn = (email: string, password: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(authStart());
    // Replace with your API call
    const response = await fetch('/api/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    dispatch(authSuccess(data));
  } catch (error: any) {
    dispatch(authFailure(error.message));
  }
};

export const signUp = (name: string, email: string, password: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(authStart());
    const response = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Sign up failed');
    dispatch(authSuccess(data));
  } catch (error: any) {
    dispatch(authFailure(error.message));
  }
};
