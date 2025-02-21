import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from 'axios';
import { RootState } from "@/app/store/store";

// 채팅 메시지 가져오기
export const fetchMessages = createAsyncThunk(
    "chat/fetchMessages",
    async ({ projectId }: { projectId: number }) => {

        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);

        // 시간 형식 변환
        const before = kstDate.toISOString().slice(0, 19);

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
            params: { projectId, before },
            withCredentials: true, 
        });

        console.log("📩 가져온 메시지:", response.data);
        return response.data;
    }
);


//안 읽은 메시지 갯수 가져오기
export const fetchUnreadCount = createAsyncThunk(
    "chat/fetchUnreadCount",
    async ({ projectId }: { projectId: number }) => {

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/unread`, {
            params: { projectId },
            withCredentials: true, 
        });

        console.log("📩 안 읽은 메시지:", response.data);
        return response.data;
    }
);

interface ChatMessage {
    content: string;
    createdAt: string;
    sender: { id: number; name: string };
    projectId: number;
    unreadCount: number;
}

interface ChatState {
    messages: ChatMessage[];
    unreadCount: number;
    status: "idle" | "loading" | "failed";
    error: string | null;
}

const initialState: ChatState = {
    messages: [],
    unreadCount: 0,
    status: 'idle',
    error: null,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.messages.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessages.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.status = "idle";
                state.messages = action.payload;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "메시지를 불러오는데 실패했습니다.";
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            });
    },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;