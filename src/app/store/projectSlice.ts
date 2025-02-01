import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Project {
  id: number;
  status: string;
  tags: string[];
  title: string; 
  views: number;
}

interface ProjectState{
    projects: Project[];
    loading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    loading: false,
    error: null,
};

//프로젝트 정보 가져오기
export const fetchProjects = createAsyncThunk<Project[], void, { rejectValue: string }>(
    'project/fetchProjects',
    async (_, thunkAPI) => {
      try {
        const token = localStorage.getItem('jwtToken'); 
        if (!token) {
          console.error('JWT 토큰이 없습니다.');
          throw new Error('Unauthorized: JWT 토큰이 필요합니다.');
        }
  
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/team`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        return response.data; 
      } catch (error: any) {
        console.error('API 요청 에러:', error.response?.data || error.message); 
        return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch projects');
      }
    }
  );
  

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
    builder
        .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
        })
        .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.loading = false;
        state.projects = action.payload;
        })
        .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
        });
    },
});
    
export default projectSlice.reducer;