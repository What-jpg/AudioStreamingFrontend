import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';
import { searchBoxSongKey } from '../constants';
import { Artist, Disc, Song } from '../pages/MainPage';

export interface CurrentLibrarySearchState {
  currentLibrarySection: string;
  discLibrarySection: Disc[];
  artistLibrarySection: Artist[];
  songLibrarySection: Song[];
}

const initialState: CurrentLibrarySearchState = {
  currentLibrarySection: searchBoxSongKey,
  discLibrarySection: [],
  artistLibrarySection: [],
  songLibrarySection: [],
};

export const currentLibrarySearchSlice = createSlice({
  name: 'currentLibrarySearch',
  initialState,
  reducers: {
    changeDiscLibrarySection: (state, action: PayloadAction<Disc[]>) => {
      state.discLibrarySection = action.payload;
    },
    changeArtistLibrarySection: (state, action: PayloadAction<Artist[]>) => {
        state.artistLibrarySection = action.payload;
    },
    changeSongLibrarySection: (state, action: PayloadAction<Song[]>) => {
        state.songLibrarySection = action.payload;
    },
    changeCurrentLibrarySection: (state, action: PayloadAction<string>) => {
      state.currentLibrarySection = action.payload;
    },
  },
});

export const { changeCurrentLibrarySection, changeArtistLibrarySection, changeDiscLibrarySection, changeSongLibrarySection } = currentLibrarySearchSlice.actions;

export const selectCurrentLibrarySearch = (state: RootState) => state.currentLibrarySearch;

export default currentLibrarySearchSlice.reducer;