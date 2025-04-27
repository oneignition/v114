export interface Theme {
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  fontSizes: {
    small: string
    medium: string
    large: string
    xlarge: string
  }
}

export const theme: Theme = {
  colors: {
    primary: "#FFB6C1", // Light pink
    secondary: "#FFC0CB", // Pink
    background: "#FFF0F5", // Lavender blush
    text: "#4A4A4A",
    accent: "#FF69B4", // Hot pink
  },
  fontSizes: {
    small: "0.875rem",
    medium: "1rem",
    large: "1.25rem",
    xlarge: "1.5rem",
  },
}

export const ROSE_PRICES = [
  { amount: 1, roses: 20 },
  { amount: 5, roses: 150 },
  { amount: 10, roses: 500 },
  { amount: 20, roses: 2000 },
]
