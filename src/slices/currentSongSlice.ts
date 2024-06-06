import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { Song } from "../pages/MainPage";
import { serverUrl } from "../constants";
import axios from "axios";
import { mapUppercaseObjectPropsToLowercase } from "../contexts/AuthContext";

export interface MainSongInfo {
    songs: Array<Song>;
    currentSongIndex: number;
    isPlaying: boolean;
}

export interface CurrentSongsState {
    value: MainSongInfo | null;
}

const initialState: CurrentSongsState = {
    value: null,
}

export const currentSongSlice = createSlice({
    name: "currentSong",
    initialState,
    reducers: {
        setCurrentSong: (state, action: PayloadAction<MainSongInfo>) => {
            state.value = action.payload;
        },
        setCurrentSongIndex: (state, action: PayloadAction<number>) => {
            if (state.value) {
                if (state.value.songs.length > action.payload) {
                    state.value.currentSongIndex = action.payload;
                    console.log(state.value.currentSongIndex);
                }
            }
        },
        clearCurrentSong: (state) => {
            state.value = null;
        },
        stopCurrentSong: (state) => {
            if (state.value != null) {
                state.value.isPlaying = false;
            }
        },
        startCurrentSong: (state) => {
            if (state.value != null) {
                state.value.isPlaying = true;
            }
        },
        startOrStopCurrentSong: (state) => {
            if (state.value != null) {
                state.value.isPlaying = !state.value.isPlaying;
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchNewSongsForQueueAsync.fulfilled, (state, action) => {
            if (state.value && action.payload.length != 0) {
                state.value.currentSongIndex = state.value.songs.length;
                state.value.songs = [...state.value.songs, ...action.payload];
            } else {
                state.value = null;
            }
          })
    }
});

export const fetchNewSongsForQueueAsync = createAsyncThunk("currentSong/fetchNewSongsForQueue", async () => {
    const response = mapUppercaseObjectPropsToLowercase((await axios.get(`${serverUrl}/api/songs/getrandomsongs`)).data);
    return response;
  }
);

export const {setCurrentSong, setCurrentSongIndex, clearCurrentSong, stopCurrentSong, startCurrentSong, startOrStopCurrentSong} = currentSongSlice.actions;

export const selectCurrentSong = (state: RootState) => state.currentSong.value;

export default currentSongSlice.reducer;