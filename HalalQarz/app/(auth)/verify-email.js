import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { auth } from '../../src/api/firebase';
import { sendVerificationEmail, checkEmailVerified, logOut } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function VerifyEmailScreen() {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });
  const intervalRef = useRef(null);
  const successShownRef = useRef(false);
  const theme = useTheme();

  const userEmail = auth.currentUser?.email || 'your email';

  const handleVerifiedSuccess = () => {
    if (successShownRef.current) {
      return;
    }

    successShownRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setAlert({
      visible: true,
      title: 'Success!',
      message: 'Account created successfully. Your email is now verified.',
      type: 'success',
      onConfirm: () => router.replace('/(main)')
    });
  };

  // Background 5-second polling task
  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const isVerified = await checkEmailVerified();
      if (isVerified) {
        handleVerifiedSuccess();
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Cooldown timer loop
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleManualCheck = async () => {
    setChecking(true);
    const isVerified = await checkEmailVerified();
    setChecking(false);

    if (isVerified) {
      handleVerifiedSuccess();
    } else {
      setAlert({
        visible: true,
        title: 'Not Verified',
        message: 'Email not verified yet. Please check your inbox and click the verification link.',
        type: 'warning'
      });
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setResending(true);
    const { error } = await sendVerificationEmail();
    setResending(false);

    if (error) {
      setAlert({ visible: true, title: 'Error', message: error, type: 'error' });
    } else {
      setCooldown(60); // Rigorous 60-second block
      setAlert({
        visible: true,
        title: 'Email Sent',
        message: 'Verification email sent again. Please check your inbox.',
        type: 'success'
      });
    }
  };

  const handleLogout = async () => {
    await logOut();
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.custom.primary }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Curving Display Header */}
        <View style={styles.header}>
          <Text variant="displayMedium" style={styles.headerTitle}>
            HalalQarz
          </Text>
        </View>

        {/* Action Form Context */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          
          <View style={styles.contentContext}>
            <MaterialCommunityIcons name="email-fast" size={80} color={theme.custom.secondary} style={{ marginBottom: 20 }} />
            
            <Text variant="headlineSmall" style={[styles.cardTitle, { color: theme.custom.primary, textAlign: 'center' }]}>
              Verify Your Email
            </Text>
            
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              We have sent a verification link to:
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface, marginBottom: 20 }}>
              {userEmail}
            </Text>
            
            <Text variant="bodySmall" style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}>
              Please check your inbox and click the link to verify your account.
            </Text>
          </View>

          <View style={styles.formSpace}>
            <Button 
              mode="contained" 
              onPress={handleManualCheck} 
              loading={checking}
              disabled={checking}
              style={[styles.primaryButton, { backgroundColor: theme.custom.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              I Have Verified My Email
            </Button>

            <Button 
              mode="outlined" 
              onPress={handleResend} 
              loading={resending}
              disabled={resending || cooldown > 0}
              style={[
                styles.secondaryButton, 
                { borderColor: theme.custom.primary } 
              ]}
              textColor={theme.custom.primary}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
            </Button>

            <Button 
              mode="text" 
              onPress={handleLogout} 
              textColor={theme.colors.onSurfaceVariant}
              style={styles.textButton}
            >
              Back to Login
            </Button>
          </View>
        </View>
      </ScrollView>

      <CustomAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    display: 'flex',
  },
  header: { 
    height: '25%', 
    minHeight: 180,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 30
  },
  headerTitle: { 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 50,
    paddingBottom: 30,
    marginTop: -20, // Overlaps top
    alignItems: 'center'
  },
  contentContext: {
    alignItems: 'center',
    marginBottom: 40
  },
  cardTitle: { 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 5
  },
  instruction: {
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 20
  },
  formSpace: {
    width: '100%'
  },
  primaryButton: { 
    marginBottom: 15, 
    borderRadius: 30,
    elevation: 2 
  },
  secondaryButton: {
    marginBottom: 20, 
    borderRadius: 30,
    borderWidth: 2
  },
  textButton: {
    marginTop: 10
  },
  buttonContent: { height: 55 },
  buttonLabel: { fontSize: 16, fontWeight: 'bold' }
});
