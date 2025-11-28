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
  Chip,
} from "@mui/material";

import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete"; // 👈 added
import ListSubheader from "@mui/material/ListSubheader"; // optional, used like in CardDetailsDialog

import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux"; // 👈 updated
import { createCard, createLabel } from "../../boardSlice"; // 👈 bring createLabel too

const defaultValues = {
  boardId: "",
  columnId: "",
  title: "",
  description: "",
  assigneeId: "",
  reporterId: "",
  ticketType: "",
  actualTimeToComplete: "",
  priority: "",
  labels: [], // 👈 array of label IDs (strings)
};

const filter = createFilterOptions(); // 👈 same as CardDetailsDialog

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

  // 👇 Get label objects from Redux (same source as CardDetailsDialog)
  const labels = useSelector((state) => state.board.labels || []);

  // keep boardId in sync when prop changes
  React.useEffect(() => {
    if (boardId) setValue("boardId", boardId);
  }, [boardId, setValue]);

  // When dialog opens, reset form
  React.useEffect(() => {
    if (open) {
      reset({
        ...defaultValues,
        boardId: boardId || "",
        columnId: "",
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

    const payload = {
      ...data,
      actualTimeToComplete:
        data.actualTimeToComplete === "" || data.actualTimeToComplete == null
          ? 0
          : Number(data.actualTimeToComplete),
      // data.labels is already an array of ObjectId strings (like CardDetailsDialog)
    };

    try {
      setIsSubmitting(true);
      const created = await dispatch(createCard(payload)).unwrap();
      reset({ ...defaultValues, boardId: boardId || "" });
      onClose?.();
    } catch (err) {
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
                      {col.title.toLowerCase()}
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

          {/* ACTUAL TIME */}
          <Controller
            name="actualTimeToComplete"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Actual Time To Complete (hours)"
                fullWidth
                type="number"
                margin="normal"
                inputProps={{ min: 0, step: 0.25 }}
              />
            )}
          />

          {/* Priority */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Controller
              name="priority"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select {...field} label="Priority" value={field.value || ""}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          {/* Labels (ObjectId-based, like CardDetailsDialog) */}
          <Controller
            name="labels"
            control={control}
            defaultValue={[]}
            render={({ field }) => {
              // field.value is array of label IDs -> convert to label objects for Autocomplete
              const selectedLabelObjects = Array.isArray(field.value)
                ? field.value
                    .map((id) =>
                      labels.find((l) => String(l._id) === String(id))
                    )
                    .filter(Boolean)
                : [];

              return (
                <Autocomplete
                  multiple
                  freeSolo
                  disableCloseOnSelect
                  size="small"
                  fullWidth
                  options={labels}
                  value={selectedLabelObjects}
                  openOnFocus
                  selectOnFocus
                  handleHomeEndKeys
                  isOptionEqualToValue={(option, value) =>
                    String(option._id) === String(value._id)
                  }
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    if (option.inputValue) return option.inputValue;
                    return option.displayName || option.name || "";
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    const { inputValue } = params;

                    const isExisting = options.some((option) => {
                      const text = (
                        option.displayName ||
                        option.name ||
                        ""
                      ).toLowerCase();
                      return text === inputValue.toLowerCase();
                    });

                    if (inputValue !== "" && !isExisting) {
                      filtered.push({
                        inputValue,
                        name: `Create "${inputValue}"`,
                        isNew: true,
                      });
                    }

                    return filtered;
                  }}
                  onChange={async (event, newValue) => {
                    const finalIds = [];

                    for (const v of newValue) {
                      if (typeof v === "string" && v.trim() !== "") {
                        // User typed a raw string -> create label
                        try {
                          const created = await dispatch(
                            createLabel({ name: v.trim() })
                          ).unwrap();
                          finalIds.push(String(created._id));
                        } catch (err) {
                          console.error(
                            "Failed to create label from string:",
                            err
                          );
                        }
                      } else if (v && v.isNew && v.inputValue) {
                        // The "Create "X"" option
                        try {
                          const created = await dispatch(
                            createLabel({ name: v.inputValue.trim() })
                          ).unwrap();
                          finalIds.push(String(created._id));
                        } catch (err) {
                          console.error(
                            "Failed to create label from option:",
                            err
                          );
                        }
                      } else if (v && v._id) {
                        // Existing label
                        finalIds.push(String(v._id));
                      }
                    }

                    // Store only ObjectId strings in form state
                    field.onChange(finalIds);
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const labelText = option.displayName || option.name || "";
                      return (
                        <Chip
                          {...getTagProps({ index })}
                          key={option._id || labelText}
                          label={labelText}
                          size="small"
                          sx={{
                            borderRadius: 0.5,
                            border: "1px solid #0052cc",
                            backgroundColor: "transparent",
                            color: "#172b4d",
                          }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Labels"
                      margin="normal"
                      placeholder="Select or type to create"
                    />
                  )}
                />
              );
            }}
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
