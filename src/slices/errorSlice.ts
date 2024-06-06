import { createSlice } from "@reduxjs/toolkit"
import { RootState } from "../app/store";
import { axiosErrorToErrorForMessage } from "../contexts/AuthContext";

export interface ErrorSlice {
    value: Error | null
}

const initialState: ErrorSlice = {
    value: null
}

export const errorSlice = createSlice({
    name: "error",
    initialState,
    reducers: {
        setError: (state, action) => {
            state.value = axiosErrorToErrorForMessage(action.payload);
        },
        clearError: (state) => {
            state.value = null;
        }
    }
});

export const {setError, clearError} = errorSlice.actions;

export const selectError = (state: RootState) => state.error;

export default errorSlice.reducer;