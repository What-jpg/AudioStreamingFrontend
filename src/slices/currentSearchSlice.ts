import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { searchBoxSongKey } from '../constants';

export interface CurrentSearchState {
  searchString: string,
  searchAtIndex: string,
  whatToSearch: string,
  searchTabActive: boolean,
}

export const searchInLibraryKey = "ly";
export const searchInAppKey = "ap";

const initialState: CurrentSearchState = {
  searchString: "",
  searchAtIndex: searchInAppKey,
  whatToSearch: searchBoxSongKey,
  searchTabActive: false,
};

export const currentSearchSlice = createSlice({
  name: 'currentSearch',
  initialState,
  reducers: {
    changeCurrentSearchString: (state, action: PayloadAction<string>) => {
      state.searchString = action.payload;
    },
    changeCurrentSearchAtIndex: (state, action: PayloadAction<string>) => {
        state.searchAtIndex = action.payload;
    },
    changeCurrentWhatToSearch: (state, action: PayloadAction<string>) => {
        state.whatToSearch = action.payload;
    },
    toggleSearchTabActive: (state) => {
      state.searchTabActive = !state.searchTabActive;
    },
  },
});

export const { changeCurrentSearchString, changeCurrentSearchAtIndex, changeCurrentWhatToSearch, toggleSearchTabActive } = currentSearchSlice.actions;

export const selectCurrentSearch = (state: RootState) => state.currentSearch;

export default currentSearchSlice.reducer;
