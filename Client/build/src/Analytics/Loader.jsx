import { CircularProgress, Box, Typography } from "@mui/material";

const Loader = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#ffffff",
        backgroundColor: "transparent", // keeps background as-is
        zIndex: 9999,
      }}
    >
      <CircularProgress size={60} sx={{ color: "#ffffff", mb: 2 }} />
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        It may take a few seconds. Please wait...
      </Typography>
    </Box>
  );
};

export default Loader;
