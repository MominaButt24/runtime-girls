import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, Text } from 'react-native-paper';
import { useColorScheme, View, Animated, Dimensions, Image, StyleSheet, StatusBar } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4A3BDB',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E5E4FF',
    onPrimaryContainer: '#2A1B8B',
    secondary: '#FF8C00',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFE5C2',
    onSecondaryContainer: '#CC6600',
    tertiary: '#00B4D8',
    onTertiary: '#FFFFFF',
    background: '#F7F8FC',
    surface: '#FFFFFF',
    onSurface: '#1A1A24',
    onSurfaceVariant: '#8C8CA1',
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
    primary: '#6E61F5',
    onPrimary: '#FFFFFF',
    background: '#13131A',
    surface: '#1C1C26',
    onSurface: '#F7F8FC',
    onSurfaceVariant: '#A1A1B2',
    primaryContainer: '#2A1B8B',
    onPrimaryContainer: '#C2BCFA',
    secondary: '#FFA033',
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

SplashScreen.preventAutoHideAsync();

const { height } = Dimensions.get('window');

function AnimatedSplash({ theme, onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start(onFinish);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <StatusBar hidden />
      <Animated.View style={[styles.splashContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.logoWrapper}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text variant="displayMedium" style={[styles.logoText, { color: theme.custom.primary }]}>
          HalalQarz
        </Text>
        <Text variant="headlineSmall" style={[styles.tagline, { color: theme.custom.secondary }]}>
          Soch samajh kar Qarz lo
        </Text>
      </Animated.View>
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text variant="labelLarge" style={styles.footerText}>SHARIAH COMPLIANT FINANCING</Text>
        <View style={[styles.footerLine, { backgroundColor: theme.custom.primary }]} />
      </Animated.View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!splashDone) {
    return (
      <PaperProvider theme={theme}>
        <AnimatedSplash theme={theme} onFinish={() => setSplashDone(true)} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center', width: '100%' },
  logoWrapper: { width: 160, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoImage: { width: '100%', height: '100%' },
  logoText: { fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  tagline: { textAlign: 'center', marginTop: 10, fontWeight: '600', fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 50, alignItems: 'center', width: '100%' },
  footerText: { letterSpacing: 3, color: '#8C8CA1', fontSize: 10, fontWeight: 'bold' },
  footerLine: { height: 2, width: 40, marginTop: 8, borderRadius: 1 },
});
