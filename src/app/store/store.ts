import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import projectReducer from './projectSlice';
import selectedProjectReducer from './selectedProjectSlice';
import teamReducer from './teamSlice';
import scheduleReducer from './scheduleSlice';
import chatReducer from './chatSlice';

export const store = configureStore({
    reducer: {
        project: projectReducer,
        selectedProject: selectedProjectReducer,
        team: teamReducer,
        schedule: scheduleReducer,
        chat: chatReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>(); 
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 
