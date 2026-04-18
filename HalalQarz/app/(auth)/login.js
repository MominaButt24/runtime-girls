import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { loginUser } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const validateLogin = () => {
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isRequiredFieldMissing = !email.trim() || !password;

  const handleLogin = async () => {
    if (!validateLogin()) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Please fix the highlighted fields before submitting.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    const { error } = await loginUser(email, password);
    setLoading(false);

    if (error) {
      setAlert({ visible: true, title: 'Login Failed', message: error, type: 'error' });
    } else {
      router.replace('/(main)');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.custom.background }]}
    >
      <View style={styles.header}>
        <Text variant="headlineLarge" style={[styles.title, { color: theme.custom.primary }]}>
          Welcome Back
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary }}>
          Sign in to your HalalQarz dashboard
        </Text>
      </View>
      
      <View style={styles.form}>
        <TextInput 
          label="Email" 
          mode="outlined" 
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError('email');
          }}
          style={styles.input} 
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text>
        ) : null}
        <TextInput 
          label="Password" 
          mode="outlined" 
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            clearFieldError('password');
          }}
          secureTextEntry 
          style={styles.input} 
        />
        {errors.password ? (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text>
        ) : null}

        <Button 
          mode="contained" 
          onPress={handleLogin} 
          loading={loading}
          disabled={loading || isRequiredFieldMissing}
          style={[styles.button, { backgroundColor: theme.custom.primary }]}
        >
          Login
        </Button>
        
        <Button 
          onPress={() => router.push('/signup')}
          textColor={theme.custom.primary}
        >
          Don't have an account? Sign Up
        </Button>
      </View>

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
  header: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  form: { flex: 2, padding: 20 },
  title: { fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 15 },
  errorText: { marginTop: -10, marginBottom: 10, fontSize: 12 },
  button: { marginTop: 10, marginBottom: 15, paddingVertical: 5 }
});
