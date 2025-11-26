import { Box } from "@mui/material";
import "@caldwell619/react-kanban/dist/styles.css";
import  JiraDemo  from "@/features/jira";


const App = () => {
  return (
    <>
      <Box sx={{ minHeight: "100vh", width: "100%" }}>
        <JiraDemo />
      </Box>
    </>
  );
};
export default App;
