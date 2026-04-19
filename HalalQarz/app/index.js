import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, StatusBar } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Redirect } from 'expo-router';
import { auth } from '../src/api/firebase';

const { height } = Dimensions.get('window');

export default function Index() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [authState, setAuthState] = useState({ state: null });
  const theme = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.1)).current; // Start slightly lower for slide up

  useEffect(() => {
    // 1. Monitor Auth State
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthState({ state: user.emailVerified ? 'main' : 'verify' });
      } else {
        setAuthState({ state: 'login' });
      }
    });

    // 2. Smooth Animation Sequence: Slide/Fade In -> Hold -> Fade Out
    Animated.sequence([
      // Entrance: Slide up while fading in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Pause to let the user see the tagline (Increased time as requested)
      Animated.delay(2000),
      // Exit: Smooth fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Complete the transition
      setIsAppReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Show splash screen while animating or while auth is unknown
  if (!isAppReady || authState.state === null) {
    return (
      <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
        <StatusBar hidden />
        <Animated.View 
          style={[
            styles.splashContent, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <View style={styles.logoWrapper}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <Text variant="displayMedium" style={[styles.logoText, { color: theme.custom.primary }]}>
            HalalQarz
          </Text>
          
          <Text variant="headlineSmall" style={[styles.tagline, { color: theme.custom.secondary }]}>
            Soch samajh kar Qarz lo
          </Text>
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text variant="labelLarge" style={styles.footerText}>
            SHARIAH COMPLIANT FINANCING
          </Text>
          <View style={[styles.footerLine, { backgroundColor: theme.custom.primary }]} />
        </Animated.View>
      </View>
    );
  }

  // Strict routing protection
  if (authState.state === 'main') return <Redirect href="/(main)" />;
  if (authState.state === 'verify') return <Redirect href="/(auth)/verify-email" />;
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  splashContent: { 
    alignItems: 'center',
    width: '100%'
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoText: { 
    fontWeight: '900', 
    textAlign: 'center',
    letterSpacing: -1
  },
  tagline: { 
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    fontStyle: 'italic'
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%'
  },
  footerText: {
    letterSpacing: 3,
    color: '#8C8CA1',
    fontSize: 10,
    fontWeight: 'bold'
  },
  footerLine: {
    height: 2,
    width: 40,
    marginTop: 8,
    borderRadius: 1
  }
});
