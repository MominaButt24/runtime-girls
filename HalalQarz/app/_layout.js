import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4A3BDB', // Royal Blue / Indigo
    onPrimary: '#FFFFFF',
    primaryContainer: '#E5E4FF', // Soft light blue for containers
    onPrimaryContainer: '#2A1B8B',
    
    secondary: '#FF8C00', // Vibrant Orange
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFE5C2', 
    onSecondaryContainer: '#CC6600',

    tertiary: '#00B4D8', // Light blue accent (can be used for icons)
    onTertiary: '#FFFFFF',

    background: '#F7F8FC', // Cool off-white background
    surface: '#FFFFFF', // Pure white cards
    onSurface: '#1A1A24', // Dark blueish-black text
    onSurfaceVariant: '#8C8CA1', // Secondary grey text
    
    outline: '#D4D4E0',
    outlineVariant: '#EAEAF0',
    error: '#E53935',
  },
  custom: {
    primary: '#4A3BDB',
    secondary: '#FF8C00',
    indigo: '#4A3BDB',
    lightBlue: '#00B4D8',
    background: '#F7F8FC',
    textSecondary: '#8C8CA1',
    surface: '#FFFFFF',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#6E61F5', // Brighter Indigo for dark mode visibility
    onPrimary: '#FFFFFF',
    background: '#13131A', // Deep dark blue-grey background
    surface: '#1C1C26', // Dark cards
    onSurface: '#F7F8FC', // Light text
    onSurfaceVariant: '#A1A1B2', // Light grey text
    primaryContainer: '#2A1B8B',
    onPrimaryContainer: '#C2BCFA',
    secondary: '#FFA033', // Brighter orange for dark mode
    onSecondary: '#1C1C26',
    secondaryContainer: '#995400',
    onSecondaryContainer: '#FFD199',
    error: '#EF5350',
    outline: '#3A3A4C',
    outlineVariant: '#2A2A38',
  },
  custom: {
    primary: '#6E61F5',
    secondary: '#FFA033',
    background: '#13131A',
    textSecondary: '#A1A1B2',
    surface: '#1C1C26',
  },
};

import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Delay hiding the splash screen for better branding visibility
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </PaperProvider>
  );
}
