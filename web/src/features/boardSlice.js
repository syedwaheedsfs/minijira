// src/features/boardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetchBoard, apiCreateCard } from "./jira/api.js";
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

const initialState = {
  board: null, // {_id, title, description, ...}
  columns: [], // [{ id/_id, title, cards: [...] }, ...]
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
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

        // optional debug
        // console.log("columns after grouping:", state.columns);
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
      });
  },
});

export const { addCardLocal, moveCardLocal } = boardSlice.actions;
export default boardSlice.reducer;
