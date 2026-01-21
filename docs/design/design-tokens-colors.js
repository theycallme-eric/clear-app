/**
 * Clear - Design Tokens (Primitive Colors)
 * 
 * These are the foundational color primitives.
 * Semantic aliases (brand, accent, etc.) will be defined separately
 * once we understand Clear's component needs.
 */

export const colors = {
  // Purple - Base: #9966CC
  purple: {
    50: '#F5F0FF',
    100: '#EBE0FF',
    200: '#D6C2FF',
    300: '#C2A3FF',
    400: '#AD85FF',
    500: '#9966CC', // Your base
    600: '#7A52A3',
    700: '#5C3D7A',
    800: '#3D2952',
    900: '#1F1429',
  },

  // Indigo - Base: #4F479A
  indigo: {
    50: '#EFEEF7',
    100: '#DFDDEF',
    200: '#BFBBDF',
    300: '#9F99CF',
    400: '#7F77BF',
    500: '#4F479A', // Your base
    600: '#3F397B',
    700: '#2F2B5C',
    800: '#201D3E',
    900: '#100E1F',
  },

  // Orange - Base: #F17B14 (Accent)
  orange: {
    50: '#FFF4E6',
    100: '#FFE9CC',
    200: '#FFD399',
    300: '#FFBD66',
    400: '#FFA733',
    500: '#F17B14', // Your base
    600: '#C16210',
    700: '#914A0C',
    800: '#603108',
    900: '#301904',
  },

  // Rose - Base: #B62F57 (High Intensity)
  rose: {
    50: '#FCE8EE',
    100: '#F9D1DD',
    200: '#F3A3BB',
    300: '#ED7599',
    400: '#E74777',
    500: '#B62F57', // Your base
    600: '#922646',
    700: '#6D1C34',
    800: '#491323',
    900: '#240911',
  },

  // Lime - Base: #8DE937 (Low Intensity)
  lime: {
    50: '#F5FCE8',
    100: '#EBF9D1',
    200: '#D7F3A3',
    300: '#C3ED75',
    400: '#AFE747',
    500: '#8DE937', // Your base
    600: '#71BA2C',
    700: '#558C21',
    800: '#385D16',
    900: '#1C2F0B',
  },

  // Neutral - White: #FFFEFB, Black: #161313
  neutral: {
    50: '#FFFEFB',  // Your off-white
    100: '#F5F4F1',
    200: '#E6E5E2',
    300: '#C8C7C4',
    400: '#AAA9A6',
    500: '#8C8B88',
    600: '#6E6D6A',
    700: '#4F4E4C',
    800: '#31302E',
    900: '#161313',  // Your near-black
  },
};

/**
 * Usage Examples (once you set up semantic aliases):
 * 
 * Primitives (direct):
 * className="bg-purple-500 text-neutral-50"
 * 
 * Semantics (after mapping):
 * className="bg-brand-primary text-surface"
 */