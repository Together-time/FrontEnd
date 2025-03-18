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

        return response.data;
    }
);

export interface ChatMessage {
    id: string;
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
        updateUnreadCount: (state, action: PayloadAction<{ messageId: string; unreadCount: number }>) => {
            const { messageId, unreadCount } = action.payload;

            state.messages = state.messages.map((msg) =>
                msg.id === messageId ? { ...msg, unreadCount } : msg
            );

            state.unreadCount = state.messages.reduce((sum, msg) => sum + msg.unreadCount, 0);
            
            console.log(`📌 Redux 상태 업데이트됨: messageId=${messageId}, unreadCount=${unreadCount}`);
        },
        resetMessages: (state) => { 
            state.messages = [];
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // 메시지 불러오는 로직
            .addCase(fetchMessages.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.status = "idle";
                state.messages = action.payload.messages;

                // 만약 메시지 응답에 unreadCount가 포함되어 있으면 같이 저장
                if (action.payload.unreadCount !== undefined) {
                    state.unreadCount = action.payload.unreadCount;
                }
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "메시지를 불러오는데 실패했습니다.";
            })
            // 안 읽은 메시지 개수 업데이트 로직
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                console.log("📩 Redux 상태 업데이트: unreadCount =", action.payload);
                state.unreadCount = action.payload;
            });
    },
});

export const { addMessage, updateUnreadCount, resetMessages } = chatSlice.actions;
export default chatSlice.reducer;