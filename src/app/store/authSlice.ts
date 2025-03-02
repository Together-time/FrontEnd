import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";

//로그아웃 요청
export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
            {},
            {withCredentials: true}
        );

        console.log("🗑 로그아웃 성공:", response.data);
        return response.data;
    }
);

//회원탈퇴 요청
export const withdraw = createAsyncThunk(
    "auth/withdraw",
    async () => {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth`,
            { withCredentials: true }
        );

        console.log("🗑 회원탈퇴 성공:", response.data);
        return response.data;
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: true,
        loading: false,
        error: null,
    },
    reducers: {
        resetAuthState: (state) => {
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(withdraw.pending, (state) => {
                state.loading = true;
            })
            .addCase(withdraw.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            .addCase(withdraw.rejected, (state, action) => {
                state.loading = false;
            });
    },
});

export const {resetAuthState} = authSlice.actions;
export default authSlice.reducer;