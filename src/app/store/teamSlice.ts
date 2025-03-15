import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 🔹 팀원 데이터 타입
interface Member {
  id: number;
  nickname: string;
  email?:string;
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

// 특정 프로젝트 팀원 목록 가져오기기
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

      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch team members");
    }
  }
);

//팀 나가기
export const fetchLeaveTeam = createAsyncThunk<
  boolean,
  number,
  { rejectValue: string }
>(
  'team/leaveTeam',
  async (projectId, thunkAPI) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${projectId}`, {
        withCredentials: true,
      });

      console.log("프로젝트 나가기: ", response.data);
      return response.data;
    } catch(error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to leavet team");
    }
  }
);

// 팀원 목록 슬라이스 생성
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
      })
      .addCase(fetchLeaveTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveTeam.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.members = state.members.filter(member => member.email !== "현재 로그인한 사용자의 이메일");
        }
      })
      .addCase(fetchLeaveTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to leave team';
      });
  },
});

export const { clearTeam } = teamSlice.actions;
export default teamSlice.reducer;
