import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

export interface SettingsMenuState {
  isActive: boolean;
  currentPageId: number;
}

const initialState: SettingsMenuState = {
  isActive: false,
  currentPageId: 0,
};

export const settingsMenuSlice = createSlice({
  name: 'settingsMenu',
  initialState,
  reducers: {
    activateSettingsMenu: (state) => {
      state.isActive = true;
    },
    deactivateSettingsMenu: (state) => {
      state.isActive = false;
    },
    toggleSettingsMenu: (state) => {
      state.isActive = !state.isActive;
    },
    setSettingsMenuPage: (state, action: PayloadAction<number>) => {
      state.currentPageId = action.payload;
    }
  },
});

export const { activateSettingsMenu, deactivateSettingsMenu, toggleSettingsMenu, setSettingsMenuPage } = settingsMenuSlice.actions;

export const selectSettingsMenu = (state: RootState) => state.settingsMenu;

export default settingsMenuSlice.reducer;
