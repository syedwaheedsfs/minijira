import {
  InputAdornment,
  TextField,
  Typography,
  Avatar,
  AvatarGroup,
  MenuItem,
  styled,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";

 const Filters = () => {
  return (
    <Grid container sx={{ mb: "10px",paddingTop:"10px", paddingLeft:"13px" }} spacing={2}>
      <Grid xs={10}>
        <Grid
          spacing={2}
          container
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Grid xs={2}>
            <TextField
              fullWidth
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid xs={2}>
            <AvatarGroup sx={{ justifyContent: "flex-end" }}>
              <Avatar src="https://mui.com/static/images/avatar/1.jpg">
                N
              </Avatar>
              <Avatar src="https://mui.com/static/images/avatar/2.jpg" />
              <Avatar src="https://mui.com/static/images/avatar/3.jpg" />
              <Avatar>3+</Avatar>
            </AvatarGroup>
          </Grid>

          <Grid xs={1}>
            <NoBorderSelect
              size="small"
              variant="standard"
              fullWidth
              select
              value="Epic"
            >
              <MenuItem value="Epic">Epic</MenuItem>
            </NoBorderSelect>
          </Grid>
        </Grid>
      </Grid>

      <Grid xs={2} container>
        {/* <Grid xs={6}>
          <Typography variant="caption">GROUP BY</Typography>
        </Grid> */}

        <Grid xs={6}>
          <NoBorderSelect
            variant="standard"
            size="small"
            value="Choices"
            select
          >
            <MenuItem value="Choices">Choices</MenuItem>
          </NoBorderSelect>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default Filters;
const NoBorderSelect = styled(TextField)`
  & *:before {
    border-bottom: none !important;
  }
  & *:after {
    border-bottom: none !important;
  }
`;
