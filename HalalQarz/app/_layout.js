import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2778E2', // Bright Blue - More professional primary
    onPrimary: '#FFFFFF',
    primaryContainer: '#EDEDF8', // Very Light Blue - For subtle backgrounds
    onPrimaryContainer: '#2778E2',
    
    secondary: '#F47502', // Orange - For Call to Actions
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFECDA', 
    onSecondaryContainer: '#F47502',

    tertiary: '#4541D4', // Indigo - For highlights
    onTertiary: '#FFFFFF',

    background: '#FDFDFC', // Off-white background
    surface: '#FFFFFF', // Pure white cards for "pop"
    onSurface: '#535353', // Dark grey text
    onSurfaceVariant: '#757575',
    
    outline: '#EDEDF8',
    outlineVariant: '#E0E0E0',
    error: '#D32F2F',
  },
  custom: {
    primary: '#2778E2',
    secondary: '#F47502',
    indigo: '#4541D4',
    lightBlue: '#5CAEE8',
    background: '#FDFDFC',
    textSecondary: '#535353',
    surface: '#FFFFFF',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5CAEE8', 
    onPrimary: '#000000',
    background: '#121212',
    surface: '#1E1E1E',
    onSurface: '#EDEDF8',
    primaryContainer: '#2778E2',
    onPrimaryContainer: '#FFFFFF',
    secondary: '#F47502',
    error: '#CF6679',
  },
  custom: {
    primary: '#5CAEE8',
    background: '#121212',
    textSecondary: '#A0A0A0',
    surface: '#1E1E1E',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </PaperProvider>
  );
}
