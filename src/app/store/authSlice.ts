import { createSlice, createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import axios from "axios";

//사용자 정보 가져오기
export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/member/user`,
                { withCredentials: true }
            );

            // localStorage에 사용자 정보 저장
            localStorage.setItem("userInfo", JSON.stringify(response.data));

            console.log("사용자 정보 가져오기 성공:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("사용자 정보 요청 실패:", error.response?.data || error.message);
            localStorage.removeItem("userInfo"); 
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

//토큰 갱신 요청
export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async(_, {rejectWithValue}) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
                {},
                {withCredentials: true}
            );

            console.log("새 토큰 발급: ", response.data);
            return response.data;
        } catch (error:any){
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

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
        user: null,
    },
    reducers: {
        resetAuthState: (state) => {
            state.isAuthenticated = false;
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshToken.fulfilled, (state,action) => {
                state.loading = false;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
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