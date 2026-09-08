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
 * Description: Color constants for the Tail History view
 */
export const WHITE = '#FFF';
export const BLACK = '#000';
export const GREY = '#626262';
export const PRIMARY_GREY = '#32424E';
export const LIGHT_LIGHT_BLUE = '#DBF2FA';
export const LIGHT_GRAY = '#D3D3D5';
export const BOLD_BLUE = '#185C87';
export const CHAT_BG = '#EFEFEF';

export const PRIMARY_PURPLE = '#724AE8';
export const PRIMARY_LIGHT_PURPLE = '#D4CFE1';

export const OFF_WHITE_BG_COLOR = '#F8F8F8';

// Menu Bar
export const MENU_BAR_OFF_WHITE_BG_COLOR = '#EFEFEF';
export const MENU_BAR_BORDER_COLOR = '#D8D8D8';

export const LIST_BACKGROUND = '#F2F5F8';
export const BOX_SHADOW_GREY = '#00000042';

export const INPUT_BORDER = '#9FAFBC';
export const INPUT_BACKGROUND = '#F2F5F8';

export const ERROR_RED = '#E73737';
export const ERROR_RED_TEXT = '#CD3209';
export const INPUT_BORDER_ERROR = '#B72025';
export const INPUT_BACKGROUND_ERROR = '#FFF4F2';

export const BACK_BUTTON_COLOR = '#EFEFEF';

export const INPUT_READ_ONLY_COLOR = '#C3CDD5';
export const INPUT_TEXT_PLACEHOLDER_COLOR = 'darkgray';

export const SURFACE_GREY: Record<string, any> = {
  50: '#FDFEFF',
  100: '#F2F5F8',
  150: '#E8ECF0',
  200: '#DEE4E8',
  400: '#9FAFBC',
  600: '#465967',
  900: '#1C262F',
  primary: {
    light: '#9FAFBC',
    main: '#465967',
    dark: '#1C262F'
  },
  secondary: {
    light: '#DEE4E8',
    main: '#9FAFBC',
    dark: '#465967'
  }
};

export const ACTIVE_ICON_BUTTON_OPACITY = 1;
export const INACTIVE_ICON_BUTTON_OPACITY = 0.4;

// RAG connectivity status — PLACEHOLDER: verify from Figma node 310-148332 before Phase 3
export const RAG_CONNECTED = '#00C853';
export const RAG_ACQUIRING = '#FFB300';
export const RAG_DISCONNECTED = '#E73737';
