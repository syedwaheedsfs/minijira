import {
  styled,
  Card,
  Typography,
  Box,
  Avatar,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
import PrIconSrc from "./pr-icon.png";
import { ticketTypeToColor } from "@/data";

const JiraCard = ({ title, priority, id, ticketType, assigneeId, onClick }) => {
  const bgcolor = ticketTypeToColor[ticketType];

  return (
    <Card onClick={onClick} sx={{ cursor: "pointer" }}>
      <CardContent
        
        sx={{
          width: 179,
          height: 120,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 1.5,
        }}
      >
        <Typography variant="body2">{title}</Typography>

        <Box sx={{ display: "flex", marginTop: "20px" }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            {/* <Avatar
              sx={{ width: 16, height: 16, bgcolor, mr: "5px" }}
              variant="rounded"
            /> */}
            {/* <Typography variant="caption">{id.split("-")[0]}</Typography> */}
            {priority && (
              <Chip
                size="small"
                label={priority.toUpperCase()}
                sx={{ fontSize: 10, px: 0.5, fontWeight: 500 }}
              />
            )}
          </Box>

          <Stack direction="row">
            <Avatar
              sx={{ width: 24, height: 24 }}
              src={`https://mui.com/static/images/avatar/${assigneeId}.jpg`}
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

const renderCard = (card) => {
  return <JiraCard {...card} />;
};
export default renderCard;
export { JiraCard };
