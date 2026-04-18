import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  // Custom Constants for easy use in StyleSheets
  custom: {
    background: "#EBF5E6", // Lightest Lime-Green background from image
    surface: "#FFFFFF", // White cards
    splashBackground: "#2D5016", // Deep Forest Green
    text: "#1A1C18", // Charcoal
    textSecondary: "#4A6741", // Muted Sage
    textLight: "#75796C", // Olive Gray
    primary: "#2D5016", // Deep Forest Green (Primary Action)
    primaryLight: "#4CAF50", // Vibrant Green for accents
    accent: "#00897B", // Teal/Mint accent
    iconBackground: "#D9E7CB", // Light Green for icon circles
    inputBackground: "#F9F9F9",
    inputBorder: "#E0E0E0",
    error: "#BA1A1A",
    success: "#4CAF50",
    profileBackground: "#D9E7CB",
  },
  // React Native Paper mappings
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2D5016",
    onPrimary: "#FFFFFF",
    primaryContainer: "#D9E7CB",
    secondary: "#4A6741",
    background: "#EBF5E6",
    surface: "#FFFFFF",
    error: "#BA1A1A",
  }
};

export const darkTheme = {
  ...MD3DarkTheme,
  // Custom Constants for easy use in StyleSheets
  custom: {
    background: "#121212", // Deep Dark Charcoal from image
    surface: "#1E1E1E", // Dark Gray cards
    splashBackground: "#121212",
    text: "#EBF5E6", // Light greenish-white text
    textSecondary: "#ACD29D", // Light Sage
    textLight: "#8E9285", // Muted Olive
    primary: "#4CAF50", // Vibrant Green accent
    primaryLight: "#ACD29D",
    accent: "#26A69A", // Lighter teal
    iconBackground: "#2D2D2D",
    inputBackground: "#2D2D2D",
    inputBorder: "#4A6741",
    error: "#FFB4AB",
    success: "#4CAF50",
    profileBackground: "#324E2B",
  },
  // React Native Paper mappings
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4CAF50",
    onPrimary: "#121212",
    primaryContainer: "#2D5016",
    secondary: "#ACD29D",
    background: "#121212",
    surface: "#1E1E1E",
    error: "#FFB4AB",
  }
};

/**
 * Helper function to get theme based on color scheme
 * This returns the full Paper-compatible theme.
 */
export const getTheme = (colorScheme) => {
  return colorScheme === "dark" ? darkTheme : lightTheme;
};
