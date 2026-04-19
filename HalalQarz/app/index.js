import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { auth } from '../src/api/firebase';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState({ state: null }); // 'main', 'verify', 'login'
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.emailVerified) {
          setAuthState({ state: 'main' });
        } else {
          setAuthState({ state: 'verify' });
        }
      } else {
        setAuthState({ state: 'login' });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
        <View style={styles.splashContent}>
          <Text variant="displayLarge" style={[styles.logo, { color: theme.custom.primary }]}>
            HalalQarz
          </Text>
          <Text variant="bodyLarge" style={[styles.tagline, { color: theme.custom.textSecondary }]}>
            Islamic Finance Made Simple
          </Text>
          <ActivityIndicator 
            size="large" 
            color={theme.custom.primary} 
            style={styles.loader}
          />
        </View>
      </View>
    );
  }

  // Strict routing protection
  if (authState.state === 'main') return <Redirect href="/(main)" />;
  if (authState.state === 'verify') return <Redirect href="/(auth)/verify-email" />;
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashContent: { alignItems: 'center' },
  logo: { fontWeight: 'bold', marginBottom: 10 },
  tagline: { marginBottom: 40 },
  loader: { marginTop: 30 }
});
