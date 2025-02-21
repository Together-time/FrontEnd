import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🔹 팀원 데이터 타입
interface Member {
  id: number;
  nickname: string;
}

// 🔹 팀원 상태 타입 정의
interface TeamState {
  members: Member[];
  loading: boolean;
  error: string | null;
}

// 🔹 초기 상태
const initialState: TeamState = {
  members: [],
  loading: false,
  error: null,
};

// ✅ 특정 프로젝트의 팀원 목록 가져오는 `fetchProjectMembers`
export const fetchProjectMembers = createAsyncThunk<
  Member[],
  number,
  { rejectValue: string }
>(
  'team/fetchProjectMembers',
  async (projectId, thunkAPI) => {
    try {

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/team/${projectId}`;

      const response = await axios.get(url, {
        withCredentials: true, 
      });

      console.log("✅ 팀원 목록 응답 데이터:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("🔴 팀원 목록 API 요청 에러:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch team members");
    }
  }
);

// ✅ 팀원 목록 슬라이스 생성
const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeam(state) {
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action: PayloadAction<Member[]>) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch team members';
      });
  },
});

export const { clearTeam } = teamSlice.actions;
export default teamSlice.reducer;
