// // src/features/jira/components/CardDetailsDialog.jsx
// import React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Typography,
//   Box,
//   Chip,
//   Stack,
//   Button,
//   Divider,
//   TextField,
//   MenuItem,
// } from "@mui/material";
// import { Collapse, IconButton } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { useDispatch, useSelector } from "react-redux";
// import { updateCard, createLabel } from "../../boardSlice";
// import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
// import ListSubheader from "@mui/material/ListSubheader";

// const CardDetailsDialog = ({ open, card, onClose }) => {
//   const dispatch = useDispatch();
//   const columns = useSelector((state) => state.board.columns || []);
//   const board = useSelector((state) => state.board.board || {});
//   const labels = useSelector((state) => state.board.labels || []);
//   const filter = createFilterOptions();
//   console.log("labels from API:", labels);

//   // 🔹 Local edit mode + form state
//   const [isEditing, setIsEditing] = React.useState(false);

//   // ✅ Track the last successfully saved state
//   const [lastSavedState, setLastSavedState] = React.useState(null);

//   const [form, setForm] = React.useState({
//     title: "",
//     description: "",
//     assigneeId: "",
//     reporterId: "",
//     ticketType: "",
//     priority: "",
//     labels: [],
//     actualTimeToComplete: "",
//     columnId: "",
//     originalEstimate: "",
//   });

//   // reset the old values when cancel is clicked
//   const hydrateFormFromCard = React.useCallback((sourceData) => {
//     if (!sourceData) return;

//     setForm({
//       title: sourceData.title || "",
//       description: sourceData.description || "",
//       assigneeId: sourceData.assigneeId || "",
//       reporterId: sourceData.reporterId || "",
//       ticketType: sourceData.ticketType || "",
//       priority: sourceData.priority || "",
//       labels: Array.isArray(sourceData.labels)
//         ? sourceData.labels.map((l) =>
//             typeof l === "string" ? l : String(l._id)
//           )
//         : [],
//       actualTimeToComplete:
//         sourceData.actualTimeToComplete != null
//           ? String(sourceData.actualTimeToComplete)
//           : "",
//       columnId: sourceData.columnId ? String(sourceData.columnId) : "",
//       originalEstimate:
//         sourceData.originalEstimate != null && sourceData.originalEstimate !== 0
//           ? String(sourceData.originalEstimate)
//           : "",
//     });
//   }, []);

//   const selectedLabelObjects = React.useMemo(
//     () =>
//       (form.labels || [])
//         .map((id) => labels.find((l) => String(l._id) === String(id)))
//         .filter(Boolean),
//     [form.labels, labels]
//   );

//   // Sync form when card changes (only when opening a NEW card)
//   React.useEffect(() => {
//     if (!card) return;

//     // ✅ Check if this is a different card or first load
//     const currentCardId = card._id ?? card.id;
//     const savedCardId = lastSavedState?._id ?? lastSavedState?.id;

//     // Reset and hydrate if:
//     // 1. No saved state yet (first load), OR
//     // 2. Different card ID (switched cards)
//     if (!lastSavedState || currentCardId !== savedCardId) {
//       setIsEditing(false);
//       setLastSavedState(null);
//       hydrateFormFromCard(card);
//     }
//   }, [card, lastSavedState, hydrateFormFromCard]);

//   const boardName = board?.title || board?.name || "My Board";

//   const column = React.useMemo(() => {
//     if (!card?.columnId) return null;
//     return columns.find(
//       (col) => (col._id ?? col.id).toString() === card.columnId.toString()
//     );
//   }, [columns, card]);

//   const columnName = column?.title || "To Do";

//   if (!card) return null;

//   const handleChange = (field) => (e) => {
//     setForm((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const handleSave = async () => {
//     const cardId = card._id ?? card.id;

//     const updates = {
//       title: form.title.trim(),
//       description: form.description,
//       assigneeId: form.assigneeId.trim() || null,
//       reporterId: form.reporterId.trim() || null,
//       ticketType: form.ticketType.trim() || null,
//       priority: form.priority.trim() || null,
//       columnId: form.columnId,
//       actualTimeToComplete:
//         form.actualTimeToComplete !== ""
//           ? Number(form.actualTimeToComplete)
//           : null,
//       labels: form.labels,
//       originalEstimate:
//         form.originalEstimate !== "" && form.originalEstimate != null
//           ? Number(form.originalEstimate)
//           : null,
//     };

//     try {
//       const updatedCard = await dispatch(
//         updateCard({
//           cardId: card._id,
//           updates,
//         })
//       ).unwrap();

//       // ✅ Store the successfully saved state
//       setLastSavedState(updatedCard);

//       // ✅ FIXED: Use consistent hydration logic after save
//       setForm({
//         title: updatedCard.title || "",
//         description: updatedCard.description || "",
//         assigneeId: updatedCard.assigneeId || "",
//         reporterId: updatedCard.reporterId || "",
//         ticketType: updatedCard.ticketType || "",
//         priority: updatedCard.priority || "",
//         labels: Array.isArray(updatedCard.labels)
//           ? updatedCard.labels.map((l) =>
//               typeof l === "string" ? l : String(l._id)
//             )
//           : [],
//         actualTimeToComplete:
//           updatedCard.actualTimeToComplete != null
//             ? String(updatedCard.actualTimeToComplete)
//             : "",
//         columnId: updatedCard.columnId ? String(updatedCard.columnId) : "",
//         // ✅ Apply same logic as hydrateFormFromCard
//         originalEstimate:
//           updatedCard.originalEstimate != null &&
//           updatedCard.originalEstimate !== 0
//             ? String(updatedCard.originalEstimate)
//             : "",
//       });

//       setIsEditing(false);
//     } catch (err) {
//       console.error("Failed to update card:", err);
//       // you can show a toast/snackbar here
//     }
//   };

//   const handleClose = () => {
//     setIsEditing(false);
//     onClose?.();
//   };

//   const handleCancel = () => {
//     // ✅ Use lastSavedState if exists, otherwise original card
//     const sourceData = lastSavedState || card;
//     hydrateFormFromCard(sourceData);
//     setIsEditing(false);
//   };

//   const statusLabel =
//     columns.find(
//       (col) => (col._id ?? col.id)?.toString() === form.columnId?.toString()
//     )?.title ?? "To Do";

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       fullWidth
//       maxWidth="lg"
//       PaperProps={{
//         sx: {
//           borderRadius: 0.8,
//           maxHeight: "90vh",
//            height: "80vh",           // ⬅️ fixed height so inner areas scroll
//           display: "flex",
//           flexDirection: "column",
//         },
//       }}
//     >
//       {/* HEADER – similar to Jira */}
//       <DialogTitle sx={{ pb: 1 }}>
//         <Stack spacing={1}>
//           <Stack direction="row" spacing={1} alignItems="center">
//             {form.ticketType && (
//               <Chip
//                 size="small"
//                 label={form.ticketType.toUpperCase()}
//                 variant="outlined"
//               />
//             )}
//           </Stack>

//           {isEditing ? (
//             <TextField
//               fullWidth
//               variant="standard"
//               value={form.title}
//               onChange={handleChange("title")}
//               InputProps={{ style: { fontSize: 20, fontWeight: 500 } }}
//             />
//           ) : (
//             <Typography variant="h6">{form.title}</Typography>
//           )}
//         </Stack>
//       </DialogTitle>

//       {/* BODY – 2 columns like Jira */}
//       <DialogContent dividers sx={{ p: 0 }}>
//         <Box sx={{ display: "flex", alignItems: "stretch" }}>
//           {/* LEFT: main content */}
//           <Box
//             sx={{
//               flex: 2,
//               p: 3,
//               pr: 4,
//               borderRight: (theme) => `1px solid ${theme.palette.divider}`,
//               overflowY: "auto",
//             }}
//           >
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle1" gutterBottom>
//                 Description
//               </Typography>
//               {isEditing ? (
//                 <TextField
//                   fullWidth
//                   multiline
//                   minRows={4}
//                   value={form.description}
//                   onChange={handleChange("description")}
//                 />
//               ) : form.description ? (
//                 <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
//                   {form.description}
//                 </Typography>
//               ) : (
//                 <Typography variant="body2" sx={{ opacity: 0.7 }}>
//                   No description.
//                 </Typography>
//               )}
//             </Box>
//           </Box>

//           {/* RIGHT: sidebar */}
//           <Box
//             sx={{
//               flex: 1,
//               p: 3,
//               minWidth: 260,
//               maxWidth: 360,
//               overflowY: "auto",
//             }}
//           >
//             <Stack
//               direction="row"
//               spacing={1}
//               alignItems="center"
//               sx={{ mb: 2, flexWrap: "wrap" }}
//             >
//               {isEditing ? (
//                 <>
//                   {/* 🔹 Status select */}
//                   <TextField
//                     select
//                     size="small"
//                     label="Status"
//                     value={form.columnId || ""}
//                     onChange={handleChange("columnId")}
//                     sx={{ minWidth: 140 }}
//                   >
//                     {columns.map((col) => (
//                       <MenuItem
//                         key={col._id ?? col.id}
//                         value={col._id ?? col.id}
//                       >
//                         {col.title}
//                       </MenuItem>
//                     ))}
//                   </TextField>
// {/* 
//                   <TextField
//                     select
//                     size="small"
//                     label="Priority"
//                     value={form.priority || ""}
//                     onChange={(e) => {
//                       const selectedPriority = e.target.value;
//                       setForm((prev) => ({
//                         ...prev,
//                         priority: selectedPriority,
//                       }));
//                     }}
//                     sx={{ minWidth: 140 }}
//                   >
//                     <MenuItem value="low">Low</MenuItem>
//                     <MenuItem value="medium">Medium</MenuItem>
//                     <MenuItem value="high">High</MenuItem>
//                     <MenuItem value="urgent">Urgent</MenuItem>
//                   </TextField> */}
//                 </>
//               ) : (
//                 <>
//                   <Chip
//                     size="small"
//                     label={`Status:${statusLabel}` || "To Do"}
//                     color="default"
//                   />
//                   {/* {form.priority && (
//                     <Chip
//                       size="small"
//                       label={`Priority: ${form.priority}`}
//                       variant="outlined"
//                     />
//                   )} */}
//                 </>
//               )}
//             </Stack>

//             {/* Pinned fields / time */}
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle2" gutterBottom>
//                 My pinned fields
//               </Typography>
//               <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
//                 <Typography variant="body2" component="span">
//                   <strong>Original estimate:</strong>
//                 </Typography>

//                 {isEditing ? (
//                   <TextField
//                     size="small"
//                     type="number"
//                     inputProps={{ min: 0 }}
//                     value={form.originalEstimate}
//                     onChange={handleChange("originalEstimate")}
//                     sx={{ width: 100, ml: 1 }}
//                   />
//                 ) : form.originalEstimate !== "" &&
//                   form.originalEstimate != null ? (
//                   // ✅ FIXED: Use form.originalEstimate instead of card.originalEstimate
//                   <Typography variant="body2" component="span" sx={{ ml: 1 }}>
//                     {form.originalEstimate}h
//                   </Typography>
//                 ) : (
//                   <Typography
//                     variant="body2"
//                     component="span"
//                     sx={{ ml: 1, opacity: 0.7 }}
//                   >
//                     Add estimate
//                   </Typography>
//                 )}
//               </Box>

//               <Box sx={{ display: "flex", alignItems: "center" }}>
//                 <Typography variant="body2" component="span">
//                   <strong>Actual time:</strong>
//                 </Typography>

//                 {isEditing ? (
//                   <TextField
//                     size="small"
//                     type="number"
//                     inputProps={{ min: 0 }}
//                     value={form.actualTimeToComplete}
//                     onChange={handleChange("actualTimeToComplete")}
//                     sx={{ width: 100, ml: 1 }}
//                   />
//                 ) : form.actualTimeToComplete !== "" &&
//                   form.actualTimeToComplete != null ? (
//                   // ✅ FIXED: Use form.actualTimeToComplete (consistent with form state)
//                   <Typography variant="body2" component="span" sx={{ ml: 1 }}>
//                     {form.actualTimeToComplete}h
//                   </Typography>
//                 ) : (
//                   <Typography
//                     variant="body2"
//                     component="span"
//                     sx={{ ml: 1, opacity: 0.7 }}
//                   >
//                     Not set
//                   </Typography>
//                 )}
//               </Box>
//             </Box>

//             <Divider sx={{ mb: 2 }} />

//             {/* People */}
//             <Box sx={{ mb: 3 }}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Details
//               </Typography>

//               <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
//                 <Typography variant="body2" component="span">
//                   <strong>Assignee:</strong>
//                 </Typography>

//                 {isEditing ? (
//                   <TextField
//                     size="small"
//                     value={form.assigneeId}
//                     onChange={handleChange("assigneeId")}
//                     sx={{ ml: 1 }}
//                   />
//                 ) : form.assigneeId ? (
//                   <Typography variant="body2" component="span" sx={{ ml: 1 }}>
//                     {form.assigneeId}
//                   </Typography>
//                 ) : (
//                   <Typography
//                     variant="body2"
//                     component="span"
//                     sx={{ ml: 1, opacity: 0.7 }}
//                   >
//                     Unassigned
//                   </Typography>
//                 )}
//               </Box>

//               <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
//                 <Typography variant="body2" component="span">
//                   <strong>Reporter:</strong>
//                 </Typography>

//                 {isEditing ? (
//                   <TextField
//                     size="small"
//                     value={form.reporterId}
//                     onChange={handleChange("reporterId")}
//                     sx={{ ml: 1 }}
//                   />
//                 ) : form.reporterId ? (
//                   <Typography variant="body2" component="span" sx={{ ml: 1 }}>
//                     {form.reporterId}
//                   </Typography>
//                 ) : (
//                   <Typography
//                     variant="body2"
//                     component="span"
//                     sx={{ ml: 1, opacity: 0.7 }}
//                   >
//                     -
//                   </Typography>
//                 )}
//               </Box>

//               <Typography variant="body2" sx={{ mb: 0.5 }}>
//                 <strong>Board:</strong> {boardName}
//               </Typography>
//               <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
//                 <Typography variant="body2" component="span">
//                   <strong>Priority:</strong>
//                 </Typography>

//                 {isEditing ? (
//                   <TextField
//                     select
//                     size="small"
//                     value={form.priority || ""}
//                     onChange={(e) => {
//                       const selectedPriority = e.target.value;
//                       setForm((prev) => ({
//                         ...prev,
//                         priority: selectedPriority,
//                       }));
//                     }}
//                     sx={{ ml: 1, minWidth: 140 }}
//                   >
//                     <MenuItem value="low">Low</MenuItem>
//                     <MenuItem value="medium">Medium</MenuItem>
//                     <MenuItem value="high">High</MenuItem>
//                     <MenuItem value="urgent">Urgent</MenuItem>
//                   </TextField>
//                 ) : form.priority ? (
//                   <Typography variant="body2" component="span" sx={{ ml: 1 }}>
//                     {form.priority.charAt(0).toUpperCase() +
//                       form.priority.slice(1)}
//                   </Typography>
//                 ) : (
//                   <Typography
//                     variant="body2"
//                     component="span"
//                     sx={{ ml: 1, opacity: 0.7 }}
//                   >
//                     Not set
//                   </Typography>
//                 )}
//               </Box>
//             </Box>

//             {/* Labels */}
//             <Box sx={{ mb: 3 }}>
//               <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
//                 {/* ✅ Left side: Label text */}
//                 <Typography
//                   variant="subtitle2"
//                   sx={{
//                     minWidth: 80,
//                     flexShrink: 0,
//                     pt: 0.5, // Slight padding to align with chips
//                   }}
//                 >
//                   Labels
//                 </Typography>

//                 {/* ✅ Right side: Label chips */}
//                 <Box sx={{ flex: 1 }}>
//                   {isEditing ? (
//                     <Autocomplete
//                       multiple
//                       freeSolo
//                       disableCloseOnSelect
//                       size="small"
//                       fullWidth
//                       options={labels}
//                       value={selectedLabelObjects}
//                       openOnFocus
//                       selectOnFocus
//                       handleHomeEndKeys
//                       isOptionEqualToValue={(option, value) =>
//                         String(option._id) === String(value._id)
//                       }
//                       getOptionLabel={(option) => {
//                         if (typeof option === "string") return option;
//                         if (option.inputValue) return option.inputValue;
//                         return option.displayName || option.name || "";
//                       }}
//                       filterOptions={(options, params) => {
//                         const filtered = filter(options, params);
//                         const { inputValue } = params;

//                         const isExisting = options.some((option) => {
//                           const text = (
//                             option.displayName ||
//                             option.name ||
//                             ""
//                           ).toLowerCase();
//                           return text === inputValue.toLowerCase();
//                         });

//                         if (inputValue !== "" && !isExisting) {
//                           filtered.push({
//                             inputValue,
//                             name: `Create "${inputValue}"`,
//                             isNew: true,
//                           });
//                         }

//                         return filtered;
//                       }}
//                       onChange={async (event, newValue) => {
//                         const finalIds = [];

//                         for (const v of newValue) {
//                           if (typeof v === "string" && v.trim() !== "") {
//                             try {
//                               const created = await dispatch(
//                                 createLabel({ name: v.trim() })
//                               ).unwrap();
//                               finalIds.push(String(created._id));
//                             } catch (err) {
//                               console.error(
//                                 "Failed to create label from string:",
//                                 err
//                               );
//                             }
//                           } else if (v && v.isNew && v.inputValue) {
//                             try {
//                               const created = await dispatch(
//                                 createLabel({ name: v.inputValue.trim() })
//                               ).unwrap();
//                               finalIds.push(String(created._id));
//                             } catch (err) {
//                               console.error(
//                                 "Failed to create label from option:",
//                                 err
//                               );
//                             }
//                           } else if (v && v._id) {
//                             finalIds.push(String(v._id));
//                           }
//                         }

//                         setForm((prev) => ({
//                           ...prev,
//                           labels: finalIds,
//                         }));
//                       }}
//                       renderTags={(value, getTagProps) =>
//                         value.map((option, index) => {
//                           const labelText =
//                             option.displayName || option.name || "";
//                           return (
//                             <Chip
//                               {...getTagProps({ index })}
//                               key={option._id || labelText}
//                               label={labelText}
//                               size="small"
//                               sx={{
//                                 borderRadius: 0.5,
//                                 border: "1px solid #0052cc",
//                                 backgroundColor: "transparent",
//                                 color: "#172b4d",
//                               }}
//                             />
//                           );
//                         })
//                       }
//                       renderOption={(props, option) => {
//                         if (option.isNew) {
//                           return (
//                             <li {...props}>
//                               <Chip
//                                 label={option.name}
//                                 size="small"
//                                 variant="outlined"
//                                 sx={{
//                                   borderRadius: 0.5,
//                                   border: "1px solid #0052cc",
//                                   backgroundColor: "transparent",
//                                   color: "#172b4d",
//                                 }}
//                               />
//                             </li>
//                           );
//                         }

//                         const labelText =
//                           option.displayName || option.name || "";
//                         return (
//                           <li {...props}>
//                             <Chip
//                               label={labelText}
//                               size="small"
//                               variant="outlined"
//                               sx={{
//                                 borderRadius: 0.5,
//                                 border: "1px solid #0052cc",
//                                 backgroundColor: "transparent",
//                                 color: "#172b4d",
//                               }}
//                             />
//                           </li>
//                         );
//                       }}
//                       renderGroup={(params) => (
//                         <li key={params.key}>
//                           <ListSubheader
//                             disableSticky
//                             sx={{ fontSize: 12, lineHeight: 1.5, py: 0.5 }}
//                           >
//                             All labels
//                           </ListSubheader>
//                           <ul style={{ paddingLeft: 0, margin: 0 }}>
//                             {params.children}
//                           </ul>
//                         </li>
//                       )}
//                       renderInput={(params) => (
//                         <TextField
//                           {...params}
//                           placeholder="Select or type to create"
//                           size="small"
//                         />
//                       )}
//                     />
//                   ) : form.labels && form.labels.length > 0 ? (
//                     <Stack
//                       direction="row"
//                       spacing={1}
//                       flexWrap="wrap"
//                       sx={{
//                         gap: 0.5,
//                         alignItems: "flex-start",
//                         "& > *": {
//                           margin: "0 !important",
//                           marginLeft: "0 !important",
//                         },
//                       }}
//                     >
//                       {form.labels.map((labelId) => {
//                         const label = labels.find(
//                           (l) => String(l._id) === String(labelId)
//                         );
//                         const text =
//                           label?.displayName || label?.name || labelId;
//                         return (
//                           <Chip
//                             key={labelId}
//                             label={text}
//                             size="small"
//                             sx={{
//                               borderRadius: 0.5,
//                               border: "1.5px solid #0052cc",
//                               backgroundColor: "transparent",
//                               color: "#172b4d",
//                               fontSize: "13px",
//                               margin: 0,
//                             }}
//                           />
//                         );
//                       })}
//                     </Stack>
//                   ) : (
//                     <Typography
//                       variant="body2"
//                       sx={{ opacity: 0.7, fontSize: "13px" }}
//                     >
//                       None
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
//             </Box>

//             {/* System info */}
//             <Box>
//               <Typography variant="subtitle2" gutterBottom>
//                 System
//               </Typography>
//               {card.createdAt && (
//                 <Typography variant="body2">
//                   <strong>Created:</strong>{" "}
//                   {new Date(card.createdAt).toLocaleString()}
//                 </Typography>
//               )}
//             </Box>
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions>
//         {isEditing ? (
//           <>
//             <Button onClick={handleCancel}>Cancel</Button>
//             <Button variant="contained" onClick={handleSave}>
//               Save
//             </Button>
//           </>
//         ) : (
//           <>
//             <Button onClick={handleClose}>Close</Button>
//             <Button variant="contained" onClick={() => setIsEditing(true)}>
//               Edit
//             </Button>
//           </>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default CardDetailsDialog;

// src/features/jira/components/CardDetailsDialog.jsx
import React from "react";
import {
  Dialog,
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
import { Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from "react-redux";
import { updateCard, createLabel } from "../../boardSlice";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import ListSubheader from "@mui/material/ListSubheader";

const CardDetailsDialog = ({ open, card, onClose }) => {
  const dispatch = useDispatch();
  const columns = useSelector((state) => state.board.columns || []);
  const board = useSelector((state) => state.board.board || {});
  const labels = useSelector((state) => state.board.labels || []);
  const filter = createFilterOptions();
  console.log("labels from API:", labels);

  // 🔹 Local edit mode + form state
  const [isEditing, setIsEditing] = React.useState(false);

  // ✅ Track the last successfully saved state
  const [lastSavedState, setLastSavedState] = React.useState(null);

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    assigneeId: "",
    reporterId: "",
    ticketType: "",
    priority: "",
    labels: [],
    actualTimeToComplete: "",
    columnId: "",
    originalEstimate: "",
  });

  // reset the old values when cancel is clicked
  const hydrateFormFromCard = React.useCallback((sourceData) => {
    if (!sourceData) return;

    setForm({
      title: sourceData.title || "",
      description: sourceData.description || "",
      assigneeId: sourceData.assigneeId || "",
      reporterId: sourceData.reporterId || "",
      ticketType: sourceData.ticketType || "",
      priority: sourceData.priority || "",
      labels: Array.isArray(sourceData.labels)
        ? sourceData.labels.map((l) =>
            typeof l === "string" ? l : String(l._id)
          )
        : [],
      actualTimeToComplete:
        sourceData.actualTimeToComplete != null
          ? String(sourceData.actualTimeToComplete)
          : "",
      columnId: sourceData.columnId ? String(sourceData.columnId) : "",
      originalEstimate:
        sourceData.originalEstimate != null && sourceData.originalEstimate !== 0
          ? String(sourceData.originalEstimate)
          : "",
    });
  }, []);

  const selectedLabelObjects = React.useMemo(
    () =>
      (form.labels || [])
        .map((id) => labels.find((l) => String(l._id) === String(id)))
        .filter(Boolean),
    [form.labels, labels]
  );

  // Sync form when card changes (only when opening a NEW card)
  React.useEffect(() => {
    if (!card) return;

    // ✅ Check if this is a different card or first load
    const currentCardId = card._id ?? card.id;
    const savedCardId = lastSavedState?._id ?? lastSavedState?.id;

    // Reset and hydrate if:
    // 1. No saved state yet (first load), OR
    // 2. Different card ID (switched cards)
    if (!lastSavedState || currentCardId !== savedCardId) {
      setIsEditing(false);
      setLastSavedState(null);
      hydrateFormFromCard(card);
    }
  }, [card, lastSavedState, hydrateFormFromCard]);

  const boardName = board?.title || board?.name || "My Board";

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
      labels: form.labels,
      originalEstimate:
        form.originalEstimate !== "" && form.originalEstimate != null
          ? Number(form.originalEstimate)
          : null,
    };

    try {
      const updatedCard = await dispatch(
        updateCard({
          cardId: card._id,
          updates,
        })
      ).unwrap();

      // ✅ Store the successfully saved state
      setLastSavedState(updatedCard);

      // ✅ FIXED: Use consistent hydration logic after save
      setForm({
        title: updatedCard.title || "",
        description: updatedCard.description || "",
        assigneeId: updatedCard.assigneeId || "",
        reporterId: updatedCard.reporterId || "",
        ticketType: updatedCard.ticketType || "",
        priority: updatedCard.priority || "",
        labels: Array.isArray(updatedCard.labels)
          ? updatedCard.labels.map((l) =>
              typeof l === "string" ? l : String(l._id)
            )
          : [],
        actualTimeToComplete:
          updatedCard.actualTimeToComplete != null
            ? String(updatedCard.actualTimeToComplete)
            : "",
        columnId: updatedCard.columnId ? String(updatedCard.columnId) : "",
        // ✅ Apply same logic as hydrateFormFromCard
        originalEstimate:
          updatedCard.originalEstimate != null &&
          updatedCard.originalEstimate !== 0
            ? String(updatedCard.originalEstimate)
            : "",
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
    // ✅ Use lastSavedState if exists, otherwise original card
    const sourceData = lastSavedState || card;
    hydrateFormFromCard(sourceData);
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
          borderRadius: 0.8,
          maxHeight: "90vh",
          height: "80vh",           // ⬅️ fixed height so inner areas scroll
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* BODY – 2 columns like Jira, each with its own scrollbar */}
      <DialogContent
        dividers
        sx={{
          p: 0,
          flex: 1,
          display: "flex",
          minHeight: 0, // important for flex + scroll
        }}
      >
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* LEFT: title + description (+ comments later) - one scroll */}
          <Box
            sx={{
              flex: 2,
              p: 3,
              pr: 4,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              overflowY: "auto", // ⬅️ left side scrolls independently
              minHeight: 0,
            }}
          >
            {/* Title (moved from DialogTitle) */}
            <Stack spacing={1} sx={{ mb: 3 }}>
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

            {/* Description */}
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

            {/* ⬇️ Placeholder for comments (will scroll with title + description) */}
            {/* <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comments
              </Typography>
              ...
            </Box> */}
          </Box>

          {/* RIGHT: sidebar – its own vertical scroll */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              minWidth: 260,
              maxWidth: 360,
              overflowY: "auto", // ⬅️ right side scrolls separately
              minHeight: 0,
            }}
          >
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
                  {/* 
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
                  </TextField> */}
                </>
              ) : (
                <>
                  <Chip
                    size="small"
                    label={`Status:${statusLabel}` || "To Do"}
                    color="default"
                  />
                  {/* {form.priority && (
                    <Chip
                      size="small"
                      label={`Priority: ${form.priority}`}
                      variant="outlined"
                    />
                  )} */}
                </>
              )}
            </Stack>

            {/* Pinned fields / time */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                My pinned fields
              </Typography>
              <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" component="span">
                  <strong>Original estimate:</strong>
                </Typography>

                {isEditing ? (
                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ min: 0 }}
                    value={form.originalEstimate}
                    onChange={handleChange("originalEstimate")}
                    sx={{ width: 100, ml: 1 }}
                  />
                ) : form.originalEstimate !== "" &&
                  form.originalEstimate != null ? (
                  // ✅ FIXED: Use form.originalEstimate instead of card.originalEstimate
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {form.originalEstimate}h
                  </Typography>
                ) : (
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ ml: 1, opacity: 0.7 }}
                  >
                    Add estimate
                  </Typography>
                )}
              </Box>

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
                ) : form.actualTimeToComplete !== "" &&
                  form.actualTimeToComplete != null ? (
                  // ✅ FIXED: Use form.actualTimeToComplete (consistent with form state)
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {form.actualTimeToComplete}h
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
                ) : form.assigneeId ? (
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
                ) : form.reporterId ? (
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
              <Box sx={{ mb: 0.5, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" component="span">
                  <strong>Priority:</strong>
                </Typography>

                {isEditing ? (
                  <TextField
                    select
                    size="small"
                    value={form.priority || ""}
                    onChange={(e) => {
                      const selectedPriority = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        priority: selectedPriority,
                      }));
                    }}
                    sx={{ ml: 1, minWidth: 140 }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </TextField>
                ) : form.priority ? (
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {form.priority.charAt(0).toUpperCase() +
                      form.priority.slice(1)}
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

            {/* Labels */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                {/* ✅ Left side: Label text */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    minWidth: 80,
                    flexShrink: 0,
                    pt: 0.5, // Slight padding to align with chips
                  }}
                >
                  Labels
                </Typography>

                {/* ✅ Right side: Label chips */}
                <Box sx={{ flex: 1 }}>
                  {isEditing ? (
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
                            finalIds.push(String(v._id));
                          }
                        }

                        setForm((prev) => ({
                          ...prev,
                          labels: finalIds,
                        }));
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const labelText =
                            option.displayName || option.name || "";
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
                      renderOption={(props, option) => {
                        if (option.isNew) {
                          return (
                            <li {...props}>
                              <Chip
                                label={option.name}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: 0.5,
                                  border: "1px solid #0052cc",
                                  backgroundColor: "transparent",
                                  color: "#172b4d",
                                }}
                              />
                            </li>
                          );
                        }

                        const labelText =
                          option.displayName || option.name || "";
                        return (
                          <li {...props}>
                            <Chip
                              label={labelText}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: 0.5,
                                border: "1px solid #0052cc",
                                backgroundColor: "transparent",
                                color: "#172b4d",
                              }}
                            />
                          </li>
                        );
                      }}
                      renderGroup={(params) => (
                        <li key={params.key}>
                          <ListSubheader
                            disableSticky
                            sx={{ fontSize: 12, lineHeight: 1.5, py: 0.5 }}
                          >
                            All labels
                          </ListSubheader>
                          <ul style={{ paddingLeft: 0, margin: 0 }}>
                            {params.children}
                          </ul>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select or type to create"
                          size="small"
                        />
                      )}
                    />
                  ) : form.labels && form.labels.length > 0 ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{
                        gap: 0.5,
                        alignItems: "flex-start",
                        "& > *": {
                          margin: "0 !important",
                          marginLeft: "0 !important",
                        },
                      }}
                    >
                      {form.labels.map((labelId) => {
                        const label = labels.find(
                          (l) => String(l._id) === String(labelId)
                        );
                        const text =
                          label?.displayName || label?.name || labelId;
                        return (
                          <Chip
                            key={labelId}
                            label={text}
                            size="small"
                            sx={{
                              borderRadius: 0.5,
                              border: "1.5px solid #0052cc",
                              backgroundColor: "transparent",
                              color: "#172b4d",
                              fontSize: "13px",
                              margin: 0,
                            }}
                          />
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.7, fontSize: "13px" }}
                    >
                      None
                    </Typography>
                  )}
                </Box>
              </Box>
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

