

// src/features/jira/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ControlledBoard, moveCard , UncontrolledBoard} from "@caldwell619/react-kanban";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoard, moveCardLocal, persistCardMove } from "../boardSlice";
import Header from "./components/Header";
import Filters from "./components/Filters";
import renderCard from "./components/Card";
import renderColumnHeader from "./components/ColumnHeader";
import { JiraCard } from "./components/Card"; 
import CardDetailsDialog from "./components/CardDetailsDialog"; 
import {
  moveCard as moveCardHelper,
} from "@caldwell619/react-kanban";
import { Box, Container } from "@mui/material";
const mapColumnsToBoard = (columns) => ({
  columns: (columns || []).map((c) => ({
    id: c._id ?? c.id,
    title: c.title,
    cards: (c.cards || []).map((card) => ({
      id: card._id ?? card.id,
      ...card,
    })),
  })),
});

 const JiraDemo = () => {
  const dispatch = useDispatch();
  const { columns, loading } = useSelector((s) => s.board);
  const [selectedCard, setSelectedCard] = useState(null);
  const boardId = "69254d02626029b84a1f93b2";

  useEffect(() => {
    dispatch(fetchBoard(boardId));
  }, [dispatch, boardId]);

  const board = useMemo(() => mapColumnsToBoard(columns), [columns]);
  const safeBoard =
    board && Array.isArray(board.columns) ? board : { columns: [] };

const handleCardDragEnd = (card, source, destination) => {
  if (!destination) return;

  // 1) Optimistic update in Redux (UI moves instantly)
  const updatedBoard = moveCardHelper(safeBoard, source, destination);
  dispatch(moveCardLocal({ board: updatedBoard }));

  // 2) Persist to backend so it survives reload
  const cardId = card._id ?? card.id;

  dispatch(
    persistCardMove({
      cardId,
      fromColumnId: source.fromColumnId,
      toColumnId: destination.toColumnId,
      fromPosition: source.fromPosition,
      toPosition: destination.toPosition,
    })
  );
};

const renderCard = (card) => (
  <JiraCard
    {...card}
    onClick={() => {
      setSelectedCard(card);
    }}
  />
);

  return (
    <>
      <Header />
      <Box sx={{ mt: 2 }}>
        <Filters />
        {loading ? (
          <div style={{ padding: 20 }}>Loading...</div>
        ) : (
          <ControlledBoard
            renderCard={renderCard}
            renderColumnHeader={renderColumnHeader}
            onCardDragEnd={handleCardDragEnd}
            allowAddCard={false}
            allowRemoveCard={false}
          >
            {safeBoard}
          </ControlledBoard>
        )}
        
        <CardDetailsDialog
          open={!!selectedCard}
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      </Box>
    </>
  );
};
export default JiraDemo;