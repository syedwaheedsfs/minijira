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
  TextField,
  MenuItem,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateCard } from "../../boardSlice"; // ⬅️ make sure this exists

const CardDetailsDialog = ({ open, card, onClose }) => {
  const dispatch = useDispatch();
  const columns = useSelector((state) => state.board.columns || []);
  const board = useSelector((state) => state.board.board || {});

  // 🔹 Local edit mode + form state
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    assigneeId: "",
    reporterId: "",
    ticketType: "",
    priority: "",
    labels: "",
    actualTimeToComplete: "",
    columnId: "",
  });

// reset the old values when cancel is clicked
  const hydrateFormFromCard = React.useCallback(() => {
    if (!card) return;
    setForm({
      title: card.title || "",
      description: card.description || "",
      assigneeId: card.assigneeId || "",
      reporterId: card.reporterId || "",
      ticketType: card.ticketType || "",
      priority: card.priority || "",
      labels: (card.labels || []).join(", "),
      actualTimeToComplete:
        card.actualTimeToComplete != null
          ? String(card.actualTimeToComplete)
          : "",
      columnId: card.columnId ? String(card.columnId) : "",
    });
  }, [card]);

  // Sync form when card changes
  React.useEffect(() => {
    if (!card) return;
    setIsEditing(false); // reset mode when opening another card
    // setForm({
    //   title: card.title || "",
    //   description: card.description || "",
    //   assigneeId: card.assigneeId || "",
    //   reporterId: card.reporterId || "",
    //   ticketType: card.ticketType || "",
    //   priority: card.priority || "",
    //   labels: (card.labels || []).join(", "),
    //   actualTimeToComplete:
    //     card.actualTimeToComplete != null
    //       ? String(card.actualTimeToComplete)
    //       : "",
    //   columnId: card.columnId ? String(card.columnId) : "",
    // });
     hydrateFormFromCard();
  }, [card, hydrateFormFromCard]);

  const boardName = board?.title || board?.name || "My Board";

  const status =
    React.useMemo(() => {
      if (!card) return "To Do";

      const cardId = card._id ?? card.id;

      const colWithCard = columns.find((col) =>
        (col.cards || []).some((c) => (c._id ?? c.id) === cardId)
      );
      if (colWithCard) return colWithCard.title;

      if (card.columnId) {
        const col = columns.find(
          (c) => c._id === card.columnId || c.id === card.columnId
        );
        if (col) return col.title;
      }

      return "To Do";
    }, [columns, card]) || "To Do";

  const column = React.useMemo(() => {
    if (!card?.columnId) return null;
    return columns.find(
      (col) => (col._id ?? col.id).toString() === card.columnId.toString()
    );
  }, [columns, card]);

  const columnName = column?.title || "To Do";

  if (!card) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    const cardId = card._id ?? card.id;

    const updates = {
      title: form.title.trim(),
      description: form.description,
      assigneeId: form.assigneeId.trim() || null,
      reporterId: form.reporterId.trim() || null,
      ticketType: form.ticketType.trim() || null,
      priority: form.priority.trim() || null,
      columnId: form.columnId,
      actualTimeToComplete:
        form.actualTimeToComplete !== ""
          ? Number(form.actualTimeToComplete)
          : null,
      labels: form.labels
        ? form.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
    };
    console.log("[CardDetailsDialog] Save clicked", { cardId, updates });
    try {
      const updatedCard = await dispatch(
        updateCard({
          cardId: card._id,
          updates,
        })
      ).unwrap();
      console.log("Updated from API:", updatedCard);

      setForm({
        title: updatedCard.title || "",
        description: updatedCard.description || "",
        assigneeId: updatedCard.assigneeId || "",
        reporterId: updatedCard.reporterId || "",
        ticketType: updatedCard.ticketType || "",
        priority: updatedCard.priority || "",
        labels: (updatedCard.labels || []).join(", "),
        actualTimeToComplete:
          updatedCard.actualTimeToComplete != null
            ? String(updatedCard.actualTimeToComplete)
            : "",
        columnId: updatedCard.columnId ? String(updatedCard.columnId) : "",
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update card:", err);
      // you can show a toast/snackbar here
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose?.();
  };

  const handleCancel = () => {
    hydrateFormFromCard(); // 🔙 throw away unsaved edits
    setIsEditing(false);
  };
  
const statusLabel =
  columns.find(
    (col) => (col._id ?? col.id)?.toString() === form.columnId?.toString()
  )?.title ?? "To Do";
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            {form.ticketType && (
              <Chip
                size="small"
                label={form.ticketType.toUpperCase()}
                variant="outlined"
              />
            )}
          </Stack>

          {isEditing ? (
            <TextField
              fullWidth
              variant="standard"
              value={form.title}
              onChange={handleChange("title")}
              InputProps={{ style: { fontSize: 20, fontWeight: 500 } }}
            />
          ) : (
            <Typography variant="h6">{form.title}</Typography>
          )}
        </Stack>
      </DialogTitle>

      {/* BODY – 2 columns like Jira */}
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "stretch" }}>
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={form.description}
                  onChange={handleChange("description")}
                />
              ) : form.description ? (
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {form.description}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  No description.
                </Typography>
              )}
            </Box>
          </Box>

          {/* RIGHT: sidebar */}
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
            {/* <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Chip size="small" label={status} color="default" />
              {form.priority && (
                <Chip
                  size="small"
                  label={`Priority: ${form.priority}`}
                  variant="outlined"
                />
              )}
            </Stack> */}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2, flexWrap: "wrap" }}
            >
              {isEditing ? (
                <>
                  {/* 🔹 Status select */}
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={form.columnId || ""}
                    onChange={handleChange("columnId")}
                    sx={{ minWidth: 140 }}
                  >
                    {columns.map((col) => (
                      <MenuItem
                        key={col._id ?? col.id}
                        value={col._id ?? col.id}
                      >
                        {col.title}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    size="small"
                    label="Priority"
                    value={form.priority || ""}
                    onChange={(e) => {
                      const selectedPriority = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        priority: selectedPriority,
                      }));
                    }}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </TextField>
                </>
              ) : (
                <>
                  <Chip
                    size="small"
                    label={`Status:${statusLabel}` || "To Do"}
                    color="default"
                  />
                  {form.priority && (
                    <Chip
                      size="small"
                      label={`Priority: ${form.priority}`}
                      variant="outlined"
                    />
                  )}
                </>
              )}
            </Stack>

            {/* Pinned fields / time */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                My pinned fields
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Original estimate:</strong>{" "}
                <span style={{ opacity: 0.7 }}>Add estimate</span>
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2" component="span">
                  <strong>Actual time:</strong>
                </Typography>

                {isEditing ? (
                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ min: 0 }}
                    value={form.actualTimeToComplete}
                    onChange={handleChange("actualTimeToComplete")}
                    sx={{ width: 100, ml: 1 }}
                  />
                ) : card.actualTimeToComplete != null ? (
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {card.actualTimeToComplete}h
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 1, opacity: 0.7 }}
                  >
                    Not set
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* People */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Details
              </Typography>

              <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" component="span">
                  <strong>Assignee:</strong>
                </Typography>

                {isEditing ? (
                  <TextField
                    size="small"
                    value={form.assigneeId}
                    onChange={handleChange("assigneeId")}
                    sx={{ ml: 1 }}
                  />
                ) : card.assigneeId ? (
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {form.assigneeId}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 1, opacity: 0.7 }}
                  >
                    Unassigned
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" component="span">
                  <strong>Reporter:</strong>
                </Typography>

                {isEditing ? (
                  <TextField
                    size="small"
                    value={form.reporterId}
                    onChange={handleChange("reporterId")}
                    sx={{ ml: 1 }}
                  />
                ) : card.reporterId ? (
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {form.reporterId}
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 1, opacity: 0.7 }}
                  >
                    -
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>Board:</strong> {boardName}
              </Typography>
              {/* <Typography variant="body2">
                <strong>Status:</strong> {columnName}
              </Typography> */}
            </Box>

            {/* Labels */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Labels
              </Typography>
              {isEditing ? (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="comma,separated,labels"
                  value={form.labels}
                  onChange={handleChange("labels")}
                />
              ) : card.labels && card.labels.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {card.labels.map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  No labels.
                </Typography>
              )}
            </Box>

            {/* System info */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                System
              </Typography>
              {card.createdAt && (
                <Typography variant="body2">
                  <strong>Created:</strong>{" "}
                  {new Date(card.createdAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        {isEditing ? (
          <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Close</Button>
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CardDetailsDialog;
