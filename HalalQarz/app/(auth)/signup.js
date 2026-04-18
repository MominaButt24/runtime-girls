import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { signUpUser } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const validateSignUp = () => {
    const nextErrors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      nextErrors.fullName = 'Name is required.';
    } else if (trimmedName.length < 3) {
      nextErrors.fullName = 'Name must be at least 3 characters.';
    } else if (/\d/.test(trimmedName)) {
      nextErrors.fullName = 'Name cannot contain numbers.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!trimmedPhone) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!/^03\d{9}$/.test(trimmedPhone)) {
      nextErrors.phone = 'Phone must be 11 digits and start with 03.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    } else if (!/\d/.test(password)) {
      nextErrors.password = 'Password must include at least 1 number.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm password is required.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords must match exactly.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isRequiredFieldMissing =
    !fullName.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !password ||
    !confirmPassword;

  const handleSignUp = async () => {
    if (!validateSignUp()) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Please fix the highlighted fields before submitting.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    const { error } = await signUpUser(email, password, fullName, phone);
    setLoading(false);

    if (error) {
      setAlert({ visible: true, title: 'Signup Failed', message: error, type: 'error' });
    } else {
      setAlert({ 
        visible: true, 
        title: 'Success!', 
        message: 'Account created successfully.', 
        type: 'success',
        onConfirm: () => router.replace('/(main)')
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.custom.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.custom.primary }]}>
            Join HalalQarz
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary }}>
            Lets start!
          </Text>
        </View>
        
        <View style={styles.form}>
          <TextInput 
            label="Full Name" 
            mode="outlined" 
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              clearFieldError('fullName');
            }}
            style={styles.input} 
          />
          {errors.fullName ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.fullName}</Text>
          ) : null}
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
            label="Phone Number" 
            mode="outlined" 
            value={phone}
            onChangeText={(text) => {
              const digitsOnly = text.replaceAll(/\D/g, '').slice(0, 11);
              setPhone(digitsOnly);
              clearFieldError('phone');
            }}
            style={styles.input} 
            keyboardType="phone-pad"
            maxLength={11}
          />
          {errors.phone ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.phone}</Text>
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
          <TextInput 
            label="Confirm Password" 
            mode="outlined" 
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearFieldError('confirmPassword');
            }}
            secureTextEntry 
            style={styles.input} 
          />
          {errors.confirmPassword ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.confirmPassword}</Text>
          ) : null}

          <Button 
            mode="contained" 
            onPress={handleSignUp} 
            loading={loading}
            disabled={loading || isRequiredFieldMissing}
            style={[styles.button, { backgroundColor: theme.custom.primary }]}
          >
            Create Account
          </Button>
          
          <Button 
            onPress={() => router.back()}
            textColor={theme.custom.primary}
          >
            Already have an account? Login
          </Button>
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
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  header: { padding: 40, paddingTop: 80, alignItems: 'center' },
  form: { paddingHorizontal: 20 },
  title: { fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 15 },
  errorText: { marginTop: -10, marginBottom: 10, fontSize: 12 },
  button: { marginTop: 10, marginBottom: 15, paddingVertical: 5 }
});
