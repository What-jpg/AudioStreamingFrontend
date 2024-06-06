import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { styleColorForLocalStorage } from "../App";

export interface StyleColorState {
    value: string;
}

const styleColorFromLocalStorage = localStorage.getItem(styleColorForLocalStorage);

const initialState: StyleColorState = {
    value: styleColorFromLocalStorage ? styleColorFromLocalStorage : "slate",
}

export const styleColorSlice = createSlice({
    name: "styleColor",
    initialState,
    reducers: {
        setStyleColor: (state, action: PayloadAction<string>) => {
            state.value = action.payload;
        }
    }
});

export const {setStyleColor} = styleColorSlice.actions;

export const selectStyleColor = (state: RootState) => state.styleColor.value;

export default styleColorSlice.reducer;