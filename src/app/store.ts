import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import settingsMenuReducer from '../slices/settingsMenuSlice';
import styleColorReducer from '../slices/styleColorSlice';
import currentSongReducer from '../slices/currentSongSlice';
import userReducer from '../slices/userSlice';
import errorReducer from '../slices/errorSlice';
import currentSearchReducer from '../slices/currentSearchSlice';
import locationReducer from '../slices/locationSlice';
import currentLibrarySearchReducer from '../slices/currentLibrarySearchSlice';

export const store = configureStore({
  reducer: {
    settingsMenu: settingsMenuReducer,
    styleColor: styleColorReducer,
    currentSong: currentSongReducer,
    currentSearch: currentSearchReducer,
    user: userReducer,
    error: errorReducer,
    location: locationReducer,
    currentLibrarySearch: currentLibrarySearchReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
