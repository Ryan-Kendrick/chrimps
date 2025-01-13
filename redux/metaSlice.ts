import { createSlice } from "@reduxjs/toolkit"
import { RootState } from "./store"
import { METADATA_CONFIG } from "../gameconfig/meta"

const initialState = {
  gameVersion: METADATA_CONFIG.version,
  lastPlayed: Date.now(),
  lastSaveCatchUp: null as number | null,
  loading: false,
}

export const metaSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {
    saveGame: (state) => {
      const now = Date.now()
      state.lastPlayed = now
      state.lastSaveCatchUp = now
    },
    clearCatchUpTime: (state) => {
      state.lastSaveCatchUp = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { saveGame, clearCatchUpTime, setLoading } = metaSlice.actions

export const selectLastSaveCatchUp = (state: RootState) => state.meta.lastSaveCatchUp
export const selectLoading = (state: RootState) => state.meta.loading

export default metaSlice.reducer
