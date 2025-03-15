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

//일정 저장
export const fetchSaveSchedule = createAsyncThunk<
    Schedule,
    { projectId: number; scheduleData: Omit<Schedule, "id"> },
    { rejectValue: string }
>(
    "schedule/fetchSaveSchedule",
    async ({ projectId, scheduleData }, thunkAPI) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${projectId}`,
                scheduleData,
                { withCredentials: true }
            );

            return response.data; // 생성된 일정 반환
        } catch (error: any) {
            console.error("❌ 일정 저장 오류:", error.response?.data || error.message);
            return thunkAPI.rejectWithValue(error.response?.data || "일정 저장에 실패했습니다.");
        }
    }
);

//일정 삭제
export const fetchDeleteSchedule = createAsyncThunk<
    number, // 반환값 (삭제된 scheduleId)
    { projectId: number; scheduleId: number }, 
    { rejectValue: string }
>(
    "schedule/deleteSchedule",
    async ({ projectId, scheduleId }, thunkAPI) => {
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${projectId}/${scheduleId}`,
                { withCredentials: true }
            );
            return scheduleId;
        } catch (error: any) {
            console.error("일정 삭제 오류:", error.response?.data || error.message);
            return thunkAPI.rejectWithValue(error.response?.data || "일정을 삭제할 수 없습니다.");
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
            })
            .addCase(fetchSaveSchedule.fulfilled, (state, action: PayloadAction<Schedule>) => {
                console.log("📌 Redux에 저장될 일정 데이터:", action.payload);
            
                if (typeof action.payload === "boolean") {
                    return;
                }
            
                state.schedules = [...state.schedules, action.payload];
            })
            
            .addCase(fetchSaveSchedule.rejected, (state, action) => {
                state.error = action.payload || "일정을 저장하지 못했습니다.";
            })
            // 일정 삭제 후 Redux 상태 업데이트
            .addCase(fetchDeleteSchedule.fulfilled, (state, action: PayloadAction<number>) => {
                state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload);
            })
            .addCase(fetchDeleteSchedule.rejected, (state, action) => {
                state.error = action.payload || "일정을 삭제하지 못했습니다.";
            });
    },
});

export const { clearSchedules, setSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;