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

const JiraCard = ({
  title,
  storyPoints,
  id,
  ticketType,
  assigneeId,
  prLink,
}) => {
  const bgcolor = ticketTypeToColor[ticketType];

  return (
    <Card>
      <CardContent style={{ width: 300 }}>
        <Typography variant="body2">{title}</Typography>

        <Box sx={{ display: "flex", marginTop: "20px" }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Avatar
              sx={{ width: 16, height: 16, bgcolor, mr: "5px" }}
              variant="rounded"
            />
            <Typography variant="caption">{id.split("-")[0]}</Typography>
          </Box>

          <Stack direction="row">
            {prLink ? (
              <Avatar
                sx={{
                  cursor: "pointer",
                  width: 24,
                  height: 24,
                  bgcolor: "transparent",
                  mr: "5px",
                }}
              >
                <PrLink href={prLink} target="_blank" rel="noopener noreferrer">
                  <PrIcon src={PrIconSrc} alt="" />
                </PrLink>
              </Avatar>
            ) : null}

            <Chip sx={{ mr: "10px" }} size="small" label={storyPoints} />
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

const PrLink = styled("a")`
  height: 100%;
`;

const PrIcon = styled("img")`
  height: 100%;
`;

const renderCard = (card) => {
  return <JiraCard {...card} />;
};
export default renderCard;
