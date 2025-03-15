import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Project } from '@/app/store/projectSlice';

interface SelectedProjectState {
    selectedProject: Project | null;
    loading: boolean;
    error: string | null;
}

//참여 중인 멤버 목록
interface Member {
    id: number;
    nickname: string;
    email?: string;
}

const initialState: SelectedProjectState = {
    selectedProject: null,
    loading: false,
    error: null,
};

//특정 프로젝트 정보 가져오기
export const fetchProjectById = createAsyncThunk<Project, number, { rejectValue: string }>(
    'selectedProject/fetchProjectById',
    async ( projectId, thunkAPI ) => {
        try{
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
                withCredentials: true, 
            });

            console.log('프로젝트 데이터:', response.data);
            return response.data;
        } catch(error:any) {
            console.error('API 요청 에러: ', error.response?.date || error.message);
            return thunkAPI.rejectWithValue(error.response?.data || 'Failed to fetch project data');
        }
    }
);

//태그 수정
export const fetchUpdateProjectTags = createAsyncThunk<
  string[], // 반환값 타입 (수정된 태그 리스트)
  { projectId: number; tags: string[] }, // 인자로 받을 값
  { rejectValue: string }
>(
  "selectedProject/fetchUpdateProjectTags",
  async ({ projectId, tags }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/tag`,
        tags,
        {
          withCredentials: true,
        }
      );

      return response.data; 
    } catch (error: any) {
      console.error("태그 수정 오류:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data || "태그 수정 실패");
    }
  }
);

//프로젝트 공개 여부 수정
export const fetchToggleProjectVisibility = createAsyncThunk<
  boolean,
  number, 
  { rejectValue: string }
>(
  "selectedProject/fetchToggleProjectVisibility",
  async (projectId, thunkAPI) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/visibility`,
        {},
        {
          withCredentials: true,
        }
      );

      return response.data; // 서버에서 반환하는 공개 여부 상태
    } catch (error: any) {
      console.error("프로젝트 공개 여부 변경 오류:", error.response?.data || error.message);
      return thunkAPI.rejectWithValue(error.response?.data || "프로젝트 공개 여부 변경 실패");
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
            })
            .addCase(fetchUpdateProjectTags.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUpdateProjectTags.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.loading = false;
                if (state.selectedProject) {
                state.selectedProject.tags = action.payload; 
                }
            })
            .addCase(fetchUpdateProjectTags.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "태그 수정 실패";
            })
            .addCase(fetchToggleProjectVisibility.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchToggleProjectVisibility.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.loading = false;
            if (state.selectedProject) {
                state.selectedProject.isPublic = action.payload; // 공개 여부 업데이트
            }
            })
            .addCase(fetchToggleProjectVisibility.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "프로젝트 공개 여부 변경 실패";
            });
    },
});

export const { setSelectedProject, clearSelectedProject } = selectedProjectSlice.actions;
export default selectedProjectSlice.reducer;