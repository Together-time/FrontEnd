import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

//검색 및 프로젝트 정보
export const fetchSearchProjects = createAsyncThunk(
    "search/fetchSearchProjects",
    async (keyword: string, thunkAPI) => {
        try {
            console.log("🔍 검색 요청 params:", { keyword });

            //검색 API 호출
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/search`, {
                params: { keyword },
                withCredentials: true,
            });

            console.log("📌 검색된 프로젝트 목록:", response.data);

            //프로젝트 정보 호출(클릭 이벤트에 합쳐주기)
            const detailedProjects = await Promise.all(
                response.data.map(async (project:any) => {
                    const detailResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.projectId}`, {
                        withCredentials: true,
                    });
                    return { ...project, details: detailResponse.data }; 
                })
            );

            return detailedProjects; 
        } catch (error: any) {
            console.error("API 요청 에러: ", error.response?.data || error.message);
            return thunkAPI.rejectWithValue(error.response?.data || "검색 실패");
        }
    }
);

//프로젝트 일정 가져오기
export const fetchProjectSchedules = createAsyncThunk<
    { projectId: number; schedules: any }, 
    number,
    { rejectValue: string } 
>(
    "search/fetchProjectSchedules",
    async (projectId, thunkAPI) => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${projectId}`,
                { withCredentials: true }
            );
            console.log("일정 상세: ", response);
            return { projectId, schedules: response.data };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data || "일정 데이터를 가져올 수 없습니다.");
        }
    }
);


//초기상태
interface SearchState {
    searchResults: any[];
    schedules: Record<number, any>;
    status: string;
    error: string | null;
}

const initialState: SearchState = {
    searchResults: [],
    schedules: {},
    status: "idle",
    error: null,
};

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSearchProjects.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchSearchProjects.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.searchResults = action.payload; 
            })
            .addCase(fetchSearchProjects.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "검색 실패";
            })
            .addCase(fetchProjectSchedules.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProjectSchedules.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.schedules[action.payload.projectId] = action.payload.schedules;
            })
            .addCase(fetchProjectSchedules.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "일정 가져오기 실패";
            });
    },
});

export default searchSlice.reducer;