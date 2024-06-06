import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export interface DbFileStr {
    content: string,
    type: string,
}

export interface ThisUserInfo {
    id: number,
    name: string,
    email: string,
    avatar: DbFileStr | null,
    isTwoFactorAuthActive: boolean,
}

export interface UserState {
    value: ThisUserInfo | null;
}

const initialState: UserState = {
    value: null,
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<ThisUserInfo>) => {
            state.value = action.payload;
        },
        clearUser: (state) => {
            state.value = null;
        }
    }
});

export const {setUser, clearUser} = userSlice.actions;

export const selectUser = (state: RootState) => state.user.value;

export default userSlice.reducer;