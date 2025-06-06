// src/redux/slices/chatSlice.ts
import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export type Message = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
};

interface ChatState {
  messages: Message[];
}

const initialState: ChatState = {
  messages: [],
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: {
      reducer(state, action: PayloadAction<Message>) {
        state.messages.push(action.payload);
      },
      prepare({ sender, text }: { sender: 'user' | 'assistant'; text: string }) {
        return {
          payload: {
            id: nanoid(),
            sender,
            text,
          },
        };
      },
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
