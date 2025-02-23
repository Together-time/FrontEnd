import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

export const fetchSearchProjects = createAsyncThunk(
    "projects/fetchSearchProjects",
    async (keyword: string) => {
        console.log("🔍 검색 요청 params:", { keyword });
        
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/search`, {
            params: {keyword},
            withCredentials: true,
        });

        console.log("가져온 프로젝트 정보: ", response.data);
        return response.data;
    }
)

//초기상태
const initialState: {
    searchResults: any[];
    status: string;
    error: string | null; 
} = {
    searchResults: [],
    status: "idle",
    error: null, 
};

const searchSlice = createSlice({
    name: "projects",
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
                state.error = null; 
            })
            .addCase(fetchSearchProjects.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message || "검색 실패";
            });
    }
});

export default searchSlice.reducer;