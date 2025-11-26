import axios from "axios";
export const apiFetchColumns = async () => {
  const res = await fetch("http://localhost:5000/api/columns");
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to fetch columns");
  }
  return res.json();
};

export const apiCreateCard = async (card) => {
  const res = await fetch("http://localhost:5000/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to create card");
  }
  return res.json();
};

// src/features/jira/api.js
export const apiFetchBoard = async (boardId) => {
  const res = await fetch(`http://localhost:5000/api/boards/${boardId}`); // or http://localhost:5000/...
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to fetch board");
  }

  const data = await res.json();
  console.log("apiFetchBoard parsed data:", data);
  return data; // ✅ this is what the thunk will receive as action.payload
};

export const apiMoveCard = async ({
  cardId,
  fromColumnId,
  toColumnId,
  fromPosition,
  toPosition,
}) => {
  const res = await fetch(`http://localhost:5000/api/cards/${cardId}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromColumnId,
      toColumnId,
      fromPosition,
      toPosition,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to move card");
  }

  return res.json(); // { message, card }
};

// api for update card details
export async function apiUpdateCard(cardId, updates) {
  const res = await axios.patch(
    `http://localhost:5000/api/cards/${cardId}`,
    updates
  );
  return res.data;
}
