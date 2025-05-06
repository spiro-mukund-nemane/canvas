// features/measurement/measurementSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MeasurementState {
  isMeasuring: boolean;
}

const initialState: MeasurementState = {
  isMeasuring: false,
};

const measurementSlice = createSlice({
  name: "measurement",
  initialState,
  reducers: {
    toggleMeasuring: (state) => {
      state.isMeasuring = !state.isMeasuring;
    },
    cancelMeasuring: (state) => {
      state.isMeasuring = false;
    },
  },
});

export const { toggleMeasuring, cancelMeasuring } = measurementSlice.actions;

export default measurementSlice.reducer;
