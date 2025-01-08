import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ListItemButton from '@mui/material/ListItemButton';

// Styles
import styles from "../../../_variables.scss";

const options = [
  'Check Out Device',
  'Check In Device',
  'Device Management',
  'Patron Management',
  'Help'
];

interface InnerNavigationDropdownProps {
    setInnerPageNumber: (index: number) => void,
    innerPageNumber: number,
}

const InnerNavigationDropdown = (props: InnerNavigationDropdownProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleKeyDownListItem = (event: React.KeyboardEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number, ) => {
    props.setInnerPageNumber(index);
    setAnchorEl(null);
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLElement>, index: number, ) => {
    props.setInnerPageNumber(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = createTheme({
    components: {
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
          }
        },
      },

      MuiButtonBase: {
        styleOverrides: {
          root: {
            fontFamily: styles.fontNormal,
          },
        },
      },

      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: styles.fontNormal,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            backgroundColor: styles.primaryLight1,
            borderRadius: "6px",
            transition: "0.1s ease all",
            
            "&:hover": {
              backgroundColor: styles.accentDark,
            },

            "&:focus": {
              border: "none",
              display: "border-box",
              outline: styles.primaryLight2 + " 2px solid",
              outlineOffset: "-2px",
              transition: "0s !important",
            }
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
            transition: "0.2s ease all",
            fontFamily: styles.fontNormal,

            "&.Mui-selected": {
              backgroundColor: styles.accentDark,

              "&:hover": {
                backgroundColor: styles.primaryLight1, 
              },

              "&:focus": {
                backgroundColor: styles.primaryLight1, 
              },
            },

            "&:hover": {
              backgroundColor: styles.primaryLight1,
            },

            "&:focus": {
              backgroundColor: styles.primaryLight1, 
            },
          },
        },
      },


    }
  });

  return (
    <div>
      <ThemeProvider theme={theme}>
        <List
          component="nav"
          aria-label="Inner Navigation Settings"
          sx={{ 
            
          }}
        >

          <ListItem
            id="inner-navigation-dropdown"
            aria-haspopup="listbox"
            aria-controls="lock-menu"
            aria-label="Selected Page"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClickListItem}
            onKeyDown={(event) => {
              if (event.key === " ") {
                event.key = "Enter";
              }
              if (event.key === "Enter") {
                handleKeyDownListItem(event);
              }
            }}
            onKeyUp={(event) => {
              if (event.key === " ") {
                event.stopPropagation();
                event.preventDefault();
              }
            }}
            sx={{
            }}
          >
            <ListItemButton>
              <ListItemText
                primary={options[props.innerPageNumber]}
                secondary="Tap to Change"
              />
            </ListItemButton>

          </ListItem>
        </List>

        <Menu
          id="lock-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'lock-button',
            role: 'listbox',
          }}
        >
          {options.map((option, index) => (
            <MenuItem
              key={option}
              disabled={false}
              selected={index === props.innerPageNumber}
              
              onClick={(event) => handleMenuItemClick(event, index)}
              onKeyDown={(event) => {
                if (event.key === " ") {
                  event.key = "Enter";
                }
                if (event.key === "Enter") {
                  handleMenuKeyDown(event, index);
                }
              }}
              onKeyUp={(event) => {
                if (event.key === " ") {
                  event.stopPropagation();
                  event.preventDefault();
                }
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </ThemeProvider>
    </div>
  );
}

export default InnerNavigationDropdown;