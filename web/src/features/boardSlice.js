// src/features/boardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetchBoard, apiCreateCard, apiUpdateCard } from "./jira/api.js";
import { apiMoveCard } from "./jira/api";
/**
 * GET /api/boards/:id
 * Expected (recommended) response:
 * {
 *   _id,
 *   title,
 *   description,
 *   columns: [
 *     { id: <columnId>, title, position, cards: [ { _id, columnId, ... }, ... ] },
 *     ...
 *   ]
 * }
 */
export const fetchBoard = createAsyncThunk(
  "board/fetchBoard",
  async (boardId, { rejectWithValue }) => {
    try {
      const res = await apiFetchBoard(boardId);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch board");
    }
  }
);

/**
 * POST /api/cards
 * body: { boardId, columnId, title, ... }
 * Expected return: the created card doc
 */
export const createCard = createAsyncThunk(
  "board/createCard",
  async (cardPayload, { rejectWithValue }) => {
    try {
      const created = await apiCreateCard(cardPayload);
      return created;
    } catch (err) {
      return rejectWithValue(err.message || "Create failed");
    }
  }
);

export const persistCardMove = createAsyncThunk(
  "board/persistCardMove",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await apiMoveCard(payload);
      return data.card; // you can use this if you want
    } catch (err) {
      return rejectWithValue(err.message || "Failed to persist card move");
    }
  }
);

export const updateCard = createAsyncThunk(
  "board/updateCard",
  async ({ cardId, updates }, { rejectWithValue }) => {
    try {
      const updated = await apiUpdateCard(cardId, updates);
      return updated; // updated card document
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update card");
    }
  }
);

const initialState = {
  board: null, // {_id, title, description, ...}
  columns: [], // [{ id/_id, title, cards: [...] }, ...]
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
};

const boardSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    /**
     * Local add card without hitting backend (optional).
     * Usually createCard.fulfilled will handle this.
     */
    addCardLocal(state, action) {
      const newCard = action.payload;
      if (!newCard) return;

      const colId =
        newCard.columnId ||
        newCard.column ||
        (newCard.columnId && newCard.columnId._id);

      if (!colId) return;

      const col = state.columns.find(
        (c) => (c._id ?? c.id).toString() === colId.toString()
      );
      if (!col) return;

      if (!Array.isArray(col.cards)) col.cards = [];
      col.cards.push(newCard);
    },

    /**
     * Local move after drag & drop.
     * Payload: { board } where board = { columns: [...] } from react-kanban
     */
    moveCardLocal(state, action) {
      const { board } = action.payload || {};
      if (!board || !Array.isArray(board.columns)) return;
      state.columns = board.columns;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- fetchBoard ----
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};

        // backend: { board, columns, cards }
        const { board, columns = [], cards = [] } = payload;

        state.board = board || null;

        const toId = (v) => (v != null ? String(v) : "");

        // group cards by columnId
        const cardsByColumnId = cards.reduce((acc, card) => {
          const colId = toId(card.columnId);
          if (!acc[colId]) acc[colId] = [];
          acc[colId].push(card);
          return acc;
        }, {});

        // attach cards[] to each column
        state.columns = columns.map((col) => {
          const colId = toId(col._id ?? col.id);
          return {
            ...col,
            id: col._id ?? col.id, // for the kanban lib
            cards: cardsByColumnId[colId] || [], // all cards that belong to this column
          };
        });
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error?.message || "Failed to fetch board";
      })

      // ---- createCard ----
      .addCase(createCard.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.createLoading = false;
        const newCard = action.payload;
        if (!newCard) return;

        // try multiple places to get column id
        const columnIdFromCard =
          newCard.columnId || newCard.column || newCard.status || null;
        const columnIdFromInput = action.meta?.arg?.columnId;
        const colId = columnIdFromCard || columnIdFromInput;
        if (!colId) return;

        const col = state.columns.find(
          (c) => (c._id ?? c.id).toString() === colId.toString()
        );
        if (!col) return;

        if (!Array.isArray(col.cards)) col.cards = [];

        const cardId = newCard._id ?? newCard.id;
        const exists = col.cards.some(
          (c) => (c._id ?? c.id).toString() === cardId.toString()
        );

        if (!exists) {
          col.cards.push(newCard);
        }
      })
      .addCase(createCard.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || action.error?.message || "Create failed";
      })

      // ---- updateCard ----
      .addCase(updateCard.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updated = action.payload;
        if (!updated) return;

        const updatedId = (updated._id ?? updated.id)?.toString();
        const newColumnId = updated.columnId ? String(updated.columnId) : null;
        // Find & update the card in whichever column it lives
        // let foundColumn = null;
        // let foundIndex = -1;
        let oldColumn = null;
        let oldIndex = -1;

        // state.columns.forEach((col) => {
        //   if (!Array.isArray(col.cards)) return;
        //   const idx = col.cards.findIndex(
        //     (c) => (c._id ?? c.id)?.toString() === updatedId
        //   );
        //   if (idx !== -1) {
        //     foundColumn = col;
        //     foundIndex = idx;
        //   }
        // });

        // find current column + index
        state.columns.forEach((col) => {
          if (!Array.isArray(col.cards)) return;
          const idx = col.cards.findIndex(
            (c) => (c._id ?? c.id)?.toString() === updatedId
          );
          if (idx !== -1) {
            oldColumn = col;
            oldIndex = idx;
          }
        });

        if (!oldColumn || oldIndex === -1) return;

        // if (!foundColumn || foundIndex === -1) return;

        // Merge updated fields into existing card
        // foundColumn.cards[foundIndex] = {
        //   ...foundColumn.cards[foundIndex],
        //   ...updated,
        // };

        const oldColumnId = String(oldColumn._id ?? oldColumn.id);
        if (!newColumnId || newColumnId === oldColumnId) {
          oldColumn.cards[oldIndex] = {
            ...oldColumn.cards[oldIndex],
            ...updated,
          };
        } else {
          const movedCard = { ...oldColumn.cards[oldIndex], ...updated };
          oldColumn.cards.splice(oldIndex, 1);

          const targetCol = state.columns.find(
            (c) => String(c._id ?? c.id) === newColumnId
          );
          if (targetCol) {
            if (!Array.isArray(targetCol.cards)) targetCol.cards = [];
            targetCol.cards.push(movedCard);
          }
        }
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || action.error?.message || "Failed to update card";
      });
  },
});

export const { addCardLocal, moveCardLocal } = boardSlice.actions;
export default boardSlice.reducer;
