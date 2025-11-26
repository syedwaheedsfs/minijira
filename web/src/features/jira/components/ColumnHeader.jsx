import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const renderColumnHeader = (column, helpers) => {
  const { title, cards } = column;
  // const { removeColumn } = helpers;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="subtitle2">
        {title} {cards.length}
      </Typography>

    </Box>
  );
};
export default renderColumnHeader;
