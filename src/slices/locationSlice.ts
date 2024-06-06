import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

export interface LocationState {
    locationsHistoryArr: string[];
    currentIndex: number;
}

interface LocationStateValue {
  value: LocationState;
}

const initialState: LocationStateValue = {value: {
  locationsHistoryArr: [window.location.pathname],
  currentIndex: 0,
}};

export const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    changeLocationInfo: (state, action: PayloadAction<LocationState>) => {
      state.value = action.payload;
    },
    changeLocationIndex: (state, action: PayloadAction<number>) => {
        state.value.currentIndex = action.payload;
    },
    changeLocationArr: (state, action: PayloadAction<string[]>) => {
        state.value.locationsHistoryArr = action.payload;
    },
  },
});

export const { changeLocationArr, changeLocationIndex, changeLocationInfo } = locationSlice.actions;

export const selectLocation = (state: RootState) => state.location;

export default locationSlice.reducer;
