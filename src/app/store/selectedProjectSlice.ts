import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Project } from '@/app/store/projectSlice';

interface SelectedProjectState {
    selectedProject: Project | null;
    loading: boolean;
    error: string | null;
}

const initialState: SelectedProjectState = {
    selectedProject: null,
    loading: false,
    error: null,
};

//특정 프로젝트 정보 가져도기
export const fetchProjectById = createAsyncThunk<Project, number, { rejectValue: string }>(
    'selectedProject/fetchProjectById',
    async ( projectId, thunkAPI ) => {
        try{
            const token = localStorage.getItem('jwtToken');
            if(!token) {
                console.error('JWT 토큰이 없습니다.');
                throw new Error('JWT 토큰이 필요합니다.');
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('프로젝트 데이터:', response.data);
            return response.data;
        } catch(error:any) {
            console.error('API 요청 에러: ', error.response?.date || error.message);
            return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch project data');
        }
    }
);

const selectedProjectSlice = createSlice({
    name: 'selecteProject',
    initialState,
    reducers: {
        setSelectedProject(state, action: PayloadAction<Project>) {
            state.selectedProject = action.payload;
        },
        clearSelectedProject(state){
            state.selectedProject = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
                state.loading = false;
                state.selectedProject = action.payload;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Something wet wrong';
            });
    },
});

export const { setSelectedProject, clearSelectedProject } = selectedProjectSlice.actions;
export default selectedProjectSlice.reducer;