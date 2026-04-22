import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { sendPasswordResetLink } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });
  const theme = useTheme();

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      return { ...prev, [field]: '' };
    });
  };

  const validateEmail = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendResetLink = async () => {
    if (!validateEmail()) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Please enter a valid email address.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordResetLink(email.trim());
    setLoading(false);

    if (error) {
      setAlert({ visible: true, title: 'Reset Failed', message: error, type: 'error' });
      return;
    }

    setAlert({
      visible: true,
      title: 'Check Your Inbox/Spam',
      message: 'We sent a password reset link to your email address.',
      type: 'success',
      onConfirm: () => router.replace('/(auth)/login')
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.custom.primary }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/logo_new.png')}
            style={styles.logo}
          />

          <Text variant="displayMedium" style={styles.headerTitle}>
            Reset Password
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineLarge" style={[styles.cardTitle, { color: theme.custom.primary }]}>
            Forgot Password?
          </Text>

          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Enter the email address linked to your account and we will send you a reset link.
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Email address"
              mode="outlined"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError('email');
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              outlineStyle={styles.inputOutline}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.custom.secondary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="email-outline" color={theme.colors.onSurfaceVariant} />}
            />
            {errors.email ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSendResetLink}
              loading={loading}
              disabled={loading}
              style={[styles.button, !loading && { backgroundColor: theme.custom.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Send Reset Link
            </Button>

            <Button
              mode="text"
              onPress={() => router.replace('/(auth)/login')}
              textColor={theme.custom.secondary}
              style={styles.backToLogin}
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
        onConfirm={alert.onConfirm}
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
    height: '34%',
    minHeight: 260,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 5,
    borderRadius: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
    marginTop: -20,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 15,
    height: 55,
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 30,
  },
  errorText: {
    marginTop: -5,
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 10,
  },
  button: {
    marginTop: 10,
    marginBottom: 18,
    borderRadius: 30,
    elevation: 2,
  },
  buttonContent: {
    height: 55,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLogin: {
    alignSelf: 'center',
  },
});