import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#ffffff',
    surface: '#ffffff',
    error: '#B00020',
  },
  custom: {
    primary: '#6200ee',
    background: '#ffffff',
    textSecondary: '#666666',
    surface: '#ffffff',
    onPrimary: '#ffffff',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#CF6679',
  },
  custom: {
    primary: '#BB86FC',
    background: '#121212',
    textSecondary: '#A0A0A0',
    surface: '#1e1e1e',
    onPrimary: '#000000',
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
