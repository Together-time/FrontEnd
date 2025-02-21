import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

//일정 데이터 타입
interface Schedule {
    id: number;
    title: string;
    memo: string;
    startedDate: string;
    startedTime: string;
    endedDate: string;
    endedTime: string;
    color: string;
}

//일정 상태 타입
interface ScheduleState {
    schedules: Schedule[];
    loading: boolean;
    error: string | null;
}

//초기 상태
const initialState: ScheduleState = {
    schedules: [],
    loading: false,
    error: null,
};

//일정 가져오기
export const fetchProjectSchedules = createAsyncThunk<
    Schedule[],
    number,
    { rejectValue: string }
>(
    "schedule/fetchProjectSchedules",
    async (projectId, thunkAPI) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${projectId}`,
                {
                    withCredentials: true, 
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("프로젝트 일정 불러오기 오류:", error.response?.data || error.message);
            return thunkAPI.rejectWithValue(error.response?.data || "일정 데이터를 가져올 수 없습니다.");
        }
    }
);

//Slice 생성
const scheduleSlice = createSlice({
    name: "schedule",
    initialState,
    reducers: {
        setSchedule(state, action: PayloadAction<Schedule[]>) {
            state.schedules = action.payload;
        },

        clearSchedules(state) {
            state.schedules = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectSchedules.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectSchedules.fulfilled, (state, action: PayloadAction<Schedule[]>) => {
                state.loading = false;
                state.schedules = action.payload;
            })
            .addCase(fetchProjectSchedules.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "일정 데이터를 불러오지 못했습니다.";
            });
    },
});

export const { clearSchedules, setSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;