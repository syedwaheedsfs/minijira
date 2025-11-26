// CreateCardDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Box,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { createCard } from "../../boardSlice"; // adjust path if needed

const defaultValues = {
  boardId: "",
  columnId: "",
  title: "",
  description: "",
  assigneeId: "",
  reporterId: "",
  storyPoints: "",
  ticketType: "",
};

export default function CreateCardDialog({ open, onClose, boardId, columns }) {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const [submitError, setSubmitError] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // keep boardId in sync when prop changes
  React.useEffect(() => {
    if (boardId) setValue("boardId", boardId);
  }, [boardId, setValue]);

  // When dialog opens, preselect first column (if exists) and reset form
  React.useEffect(() => {
    // const firstColumnId =
    //   columns && columns.length > 0 ? columns[0]._id ?? columns[0].id : "";
    if (open) {
      reset({
        ...defaultValues,
        boardId: boardId || "",
        columnId:  "",
      });
      setSubmitError(null);
    } else {
      reset({ ...defaultValues, boardId: boardId || "" });
      setSubmitError(null);
    }
  }, [open, reset, boardId]);

  const onSubmit = async (data) => {
    setSubmitError(null);

    // guard: ensure columnId exists
    if (!data.columnId) {
      setSubmitError(
        "Please choose a Status (column) before creating the card."
      );
      return;
    }

    // ensure storyPoints is a number or null
    const payload = {
      ...data,
      storyPoints:
        data.storyPoints === "" || data.storyPoints === null
          ? null
          : Number(data.storyPoints),
    };

    try {
      setIsSubmitting(true);
      // dispatch thunk and unwrap to throw on rejection
      const created = await dispatch(createCard(payload)).unwrap();
      // success: reset and close
      reset({ ...defaultValues, boardId: boardId || "" });
      onClose?.();
    } catch (err) {
      // show readable error
      const message =
        (err && err.message) ||
        (typeof err === "string" && err) ||
        JSON.stringify(err) ||
        "Create failed";
      setSubmitError(message);
      console.error("CreateCardDialog createCard error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!isSubmitting) onClose?.();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create New Card</DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          {submitError && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error">{submitError}</Alert>
            </Box>
          )}

          {/* COLUMN (Status) */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Controller
              name="columnId"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <Select {...field} label="Status" value={field.value || ""}>
                  {columns?.map((col) => (
                    <MenuItem key={col._id ?? col.id} value={col._id ?? col.id}>
                      {col.title}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.columnId ? (
              <Box sx={{ color: "error.main", mt: 0.5 }}>
                {errors.columnId.message}
              </Box>
            ) : null}
          </FormControl>

          {/* TICKET TYPE */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Ticket Type</InputLabel>
            <Controller
              name="ticketType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Ticket Type"
                  value={field.value || ""}
                >
                  <MenuItem value="Task">Task</MenuItem>
                  <MenuItem value="Bug">Bug</MenuItem>
                  <MenuItem value="Story">Story</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          {/* TITLE */}
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title ? errors.title.message : ""}
              />
            )}
          />

          {/* DESCRIPTION */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={3}
              />
            )}
          />

          {/* ASSIGNEE */}
          <Controller
            name="assigneeId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Assignee"
                fullWidth
                margin="normal"
              />
            )}
          />

          {/* REPORTER */}
          <Controller
            name="reporterId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Reporter"
                fullWidth
                margin="normal"
              />
            )}
          />

          {/* STORY POINTS */}
          <Controller
            name="storyPoints"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Story Points"
                fullWidth
                type="number"
                margin="normal"
              />
            )}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              if (!isSubmitting) onClose?.();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
