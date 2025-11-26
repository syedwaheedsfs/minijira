// src/features/jira/components/CardDetailsDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

const CardDetailsDialog = ({ open, card, onClose }) => {
  const columns = useSelector((state) => state.board.columns || []);
  const board = useSelector((state) => state.board.board || {}); 

  const {
    title,
    description,
    assigneeId,
    reporterId,
    ticketType,
    priority,
    labels,
    actualTimeToComplete,
    createdAt,
    columnId,
    boardId,
  } = card || {};
  const status =
    React.useMemo(() => {
      if (!card) return "To Do";

      const cardId = card._id ?? card.id;

      // 1) First try: find the column that currently contains this card
      const colWithCard = columns.find((col) =>
        (col.cards || []).some((c) => (c._id ?? c.id) === cardId)
      );
      if (colWithCard) return colWithCard.title;

      // 2) Fallback: use columnId field on the card, if present
      if (columnId) {
        const col = columns.find(
          (c) => c._id === columnId || c.id === columnId
        );
        if (col) return col.title;
      }

      return "To Do";
    }, [columns, card, columnId]) || "To Do";
    const boardName = board?.title || board?.name || "My Board";
    const column = React.useMemo(() => {
      if (!card?.columnId) return null;
      return columns.find(
        (col) => col._id === card.columnId || col.id === card.columnId
      );
    }, [columns, card]);

    const columnName = column?.title || "To Do";
  if (!card) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      {/* HEADER – similar to Jira */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            {ticketType && (
              <Chip
                size="small"
                label={ticketType.toUpperCase()}
                variant="outlined"
              />
            )}
            {/* {id && (
              <Typography variant="overline" sx={{ opacity: 0.8 }}>
                {id}
              </Typography>
            )} */}
          </Stack>

          <Typography variant="h6">{title}</Typography>
        </Stack>
      </DialogTitle>

      {/* BODY – 2 columns like Jira: left content, right sidebar */}
      <DialogContent dividers sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
          }}
        >
          {/* LEFT: main content */}
          <Box
            sx={{
              flex: 2,
              p: 3,
              pr: 4,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              overflowY: "auto",
            }}
          >
            {/* Description */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              {description ? (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {description}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  No description.
                </Typography>
              )}
            </Box>

            {/* (Placeholder) – you can add sections like “Steps to Reproduce”, comments, attachments etc. */}
            {/* Example extra section */}
            {/* <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Steps to Reproduce
              </Typography>
              <Typography variant="body2">…</Typography>
            </Box> */}
          </Box>

          {/* RIGHT: sidebar with details – like Jira right panel */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              minWidth: 260,
              maxWidth: 360,
              overflowY: "auto",
            }}
          >
            {/* Status row */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Chip size="small" label={status || "To Do"} color="default" />
              {priority && (
                <Chip
                  size="small"
                  label={`Priority: ${priority}`}
                  variant="outlined"
                />
              )}
            </Stack>

            {/* Pinned fields / time */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                My pinned fields
              </Typography>
              <Typography variant="body2">
                <strong>Original estimate:</strong>{" "}
                <span style={{ opacity: 0.7 }}>Add estimate</span>
              </Typography>
              {actualTimeToComplete != null && (
                <Typography variant="body2">
                  <strong>Actual time:</strong> {actualTimeToComplete}h
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* People */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Details
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Assignee:</strong>{" "}
                {assigneeId || <span style={{ opacity: 0.7 }}>Unassigned</span>}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Reporter:</strong>{" "}
                {reporterId || <span style={{ opacity: 0.7 }}>-</span>}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Board:</strong> {boardName}
              </Typography>
              <Typography variant="body2">
                <strong>Column:</strong> {columnName}
              </Typography>
            </Box>

            {/* Labels */}
            {labels && labels.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Labels
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {labels.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* System info */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                System
              </Typography>
              {createdAt && (
                <Typography variant="body2">
                  <strong>Created:</strong>{" "}
                  {new Date(createdAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {/* later: Edit / Delete / Transition buttons */}
      </DialogActions>
    </Dialog>
  );
};

export default CardDetailsDialog;
