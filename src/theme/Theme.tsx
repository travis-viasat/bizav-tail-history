/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, is strictly
 * prohibited.
 *
 * Description: Insights MUI theme for Tail History view
 */

import {alpha, createTheme, responsiveFontSizes} from '@mui/material/styles';
import {green, red} from '@mui/material/colors';
import {KeyboardArrowDown} from '@mui/icons-material';
import {ACTIVE_ICON_BUTTON_OPACITY, INACTIVE_ICON_BUTTON_OPACITY, SURFACE_GREY} from './colors';

const UNI_NEUE_FONT = 'Uni Neue';
const SOURCE_SANS_PRO_FONT = 'Source Sans Pro';

// Adds 'label' typography variant
declare module '@mui/material/styles' {
  interface TypographyVariants {
    label: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    label?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    label: true;
  }
}

const theme = createTheme({
  palette: {
    background: {
      default: SURFACE_GREY[100]
    },
    primary: {
      main: '#304FFE'
    },
    secondary: {
      main: '#182FB1'
    },
    success: {
      main: green.A400,
      contrastText: '#FFFFFF'
    },
    info: {
      main: '#465967'
    },
    error: {
      main: red.A400,
      dark: red.A700,
      light: red.A200
    },

    action: {
      active: SURFACE_GREY.primary.main
    },

    text: {
      primary: '#202E39', // 100% alpha
      secondary: '#202E39B2', // 70% alpha
      disabled: '#202E3961' // 38% alpha
    },
    divider: '#125A871F'
  },

  typography: {
    h1: {
      fontFamily: UNI_NEUE_FONT,
      fontWeight: '100'
    },
    h2: {
      fontFamily: UNI_NEUE_FONT,
      fontWeight: '100'
    },
    h3: {
      fontFamily: UNI_NEUE_FONT,
      fontWeight: '700'
    },
    h4: {
      fontFamily: UNI_NEUE_FONT,
      fontWeight: '800'
    },
    h5: {
      fontFamily: UNI_NEUE_FONT,
      fontWeight: '800'
    },
    h6: {
      fontFamily: UNI_NEUE_FONT,
      fontWeight: '700'
    },
    body1: {
      fontFamily: SOURCE_SANS_PRO_FONT,
      fontWeight: 'normal'
    },
    body2: {
      fontFamily: SOURCE_SANS_PRO_FONT,
      fontWeight: 'normal'
    },
    overline: {
      fontFamily: SOURCE_SANS_PRO_FONT,
      fontWeight: 'bold',
      letterSpacing: 0.2
    },
    caption: {
      fontFamily: SOURCE_SANS_PRO_FONT,
      fontWeight: 'normal'
    },
    label: {
      fontFamily: SOURCE_SANS_PRO_FONT,
      fontWeight: 600,
      fontSize: '1.0rem',
      letterSpacing: -0.1
    }
  },

  components: {
    MuiAutocomplete: {
      styleOverrides: {
        input: {
          height: '24px',
          padding: '0px 0px 0px 6px !important'
        },
        inputRoot: {
          backgroundColor: 'white',
          borderRadius: '18px',
          padding: '6px 6px',
          gap: '6px'
        },
        tag: {
          margin: '0px'
        }
      },
      defaultProps: {
        ChipProps: {
          size: 'small'
        },
        popupIcon: <KeyboardArrowDown />
      }
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE_GREY[200],
          color: SURFACE_GREY[900]
        }
      }
    },

    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      },
      defaultProps: {
        disableRipple: true
      }
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3000,
          textTransform: 'none',
          fontFamily: SOURCE_SANS_PRO_FONT,
          fontWeight: 600
        },
        sizeLarge: {
          padding: '8px 22px',
          fontSize: '16px',
          lineHeight: '26px'
        },
        sizeMedium: {
          padding: '6px 16px',
          fontSize: '16px',
          lineHeight: '24px'
        },
        sizeSmall: {
          padding: '4px 16px',
          fontSize: '13px',
          lineHeight: '22px'
        },

        textSizeLarge: {
          padding: '8px 11px'
        },
        textSizeMedium: {
          padding: '6px 8px'
        },
        textSizeSmall: {
          padding: '4px 16px'
        }
      },

      defaultProps: {
        disableElevation: true,
        size: 'medium',
        color: 'primary'
      }
    },

    MuiChip: {
      styleOverrides: {
        label: {
          fontFamily: SOURCE_SANS_PRO_FONT,
          fontWeight: 600
        }
      }
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '0px',
          backgroundColor: 'transparent',
          opacity: INACTIVE_ICON_BUTTON_OPACITY,
          ':hover': {
            opacity: ACTIVE_ICON_BUTTON_OPACITY
          },
          ':active': {
            opacity: ACTIVE_ICON_BUTTON_OPACITY
          }
        }
      }
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE_GREY[400],
          borderRadius: 3000
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: '8px'
        }
      }
    },

    MuiToggleButton: {
      styleOverrides: {
        root: ({theme}) => ({
          border: 0,
          color: alpha(theme.palette.action.active, 0.4),

          '&:hover': {
            color: theme.palette.text.secondary
          }
        }),
        sizeSmall: {
          padding: '8px'
        },
        sizeMedium: {
          padding: '12px'
        },
        sizeLarge: {
          padding: '16px'
        }
      }
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: SURFACE_GREY.primary.main,
          fontFamily: SOURCE_SANS_PRO_FONT,
          fontWeight: 400,
          fontSize: 12
        },
        arrow: {
          color: SURFACE_GREY.primary.main
        }
      }
    }
  }
});

export default responsiveFontSizes(theme);
