// frontend/web_dashboard/src/store/slices/tradingSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TradingState, Order, Signal } from '../../types';

const initialState: TradingState = {
  signals: [],
  orders: [],
  positions: [],
  loading: false,
  error: null,
};

export const executeOrder = createAsyncThunk(
  'trading/executeOrder',
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to execute order');
      }

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'حدث خطأ غير معروف أثناء تنفيذ الأمر';
      return rejectWithValue(message);
    }
  }
);

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    addSignal: (state, action: PayloadAction<Signal>) => {
      state.signals.unshift(action.payload);
    },
    updatePosition: (state, action: PayloadAction<any>) => {
      const index = state.positions.findIndex(p => p.symbol === action.payload.symbol);
      if (index !== -1) {
        state.positions[index] = action.payload;
      } else {
        state.positions.push(action.payload);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(executeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(executeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addSignal, updatePosition, clearError } = tradingSlice.actions;
export default tradingSlice.reducer;
