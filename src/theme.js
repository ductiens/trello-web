import { experimental_extendTheme as extendTheme } from "@mui/material/styles";
// import { teal, deepOrange, cyan, orange } from "@mui/material/colors";

const APP_BAR_HEIGHT = "58px";
const BOARD_BAR_HEIGHT = "60px";
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`;
const COLUMN_HEADER_HEIGHT = "50px";
const COLUMN_FOOTER_HEIGHT = "56px";

// Create a theme instance.
const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT,
  },
  colorSchemes: {
    // light: {
    //   palette: {
    //     primary: teal,
    //     secondary: deepOrange,
    //   },
    // },
    // dark: {
    //   palette: {
    //     primary: cyan,
    //     secondary: orange,
    //   },
    // },
  },

  //...other properties
  components: {
    // Name of the component
    //Viet hoa
    MuiButton: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          textTransform: "none",
          borderColor: "rgba(255, 255, 255, 0.23) !important",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.23) !important",
          },
        },
      },
    },
    //Outline border search
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          // color: theme.palette.primary.main,
          fontSize: "0.875rem",
          // ".MuiOutlinedInput-notchedOutline": {
          //   borderColor: theme.palette.primary.main,
          // },
          // "&:hover": {
          //   ".MuiOutlinedInput-notchedOutline": {
          //     borderColor: theme.palette.primary.main,
          //   },
          // },
          "& fieldset": {
            borderWidth: "1px !important",
            borderColor: "rgba(255, 255, 255, 0.23) !important",
            boxShadow: "0 0 0 0.5px rgba(255, 255, 255, 0.23) !important",
          },
          "&:hover fieldset": {
            borderWidth: "1px !important",
            borderColor: "rgba(255, 255, 255, 0.87) !important",
            boxShadow: "none !important",
          },
          "&.Mui-focused fieldset": {
            borderWidth: "1px !important",
            borderColor: "rgba(255, 255, 255, 0.87) !important",
            boxShadow: "none !important",
          },
        }),
      },
    },
    //chu trong o search
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          // color: theme.palette.primary.main,
          fontSize: "0.875rem",
        }),
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, & *": {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#dcdde1",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "white",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          "&.MuiTypography-body1": { fontSize: "0.875rem" },
        },
      },
    },
  },
});

export default theme;
