import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { signUpUser, sendVerificationEmail } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
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
      await sendVerificationEmail();

      setAlert({ 
        visible: true, 
        title: 'Success!', 
        message: 'Account created successfully. Please verify your email.', 
        type: 'success',
        onConfirm: () => router.replace('/(auth)/verify-email')
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.custom.primary }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Dark Header Section (Smaller for Signup) */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={{ position: 'absolute', right: 20, top: 45 }}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={{ width: 140, height: 140, resizeMode: 'contain', marginBottom: 5, borderRadius: 20 }}
            />
          </View>
        </View>

        {/* Curved Card Section */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          
          <Text variant="headlineLarge" style={[styles.cardTitle, { color: theme.custom.primary }]}>
            Sign Up
          </Text>
          
          <View style={styles.form}>
            <TextInput 
              placeholder="Full Name" 
              mode="outlined" 
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                clearFieldError('fullName');
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]} 
              outlineStyle={styles.inputOutline}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.custom.secondary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              left={<TextInput.Icon icon="account-outline" color={theme.colors.onSurfaceVariant} />}
            />
            {errors.fullName ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.fullName}</Text>
            ) : null}

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

            <TextInput 
              placeholder="Phone Number (e.g. 03...)" 
              mode="outlined" 
              value={phone}
              onChangeText={(text) => {
                const digitsOnly = text.replaceAll(/\D/g, '').slice(0, 11);
                setPhone(digitsOnly);
                clearFieldError('phone');
              }}
              style={[styles.input, { backgroundColor: theme.colors.surface }]} 
              outlineStyle={styles.inputOutline}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.custom.secondary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              keyboardType="phone-pad"
              maxLength={11}
              left={<TextInput.Icon icon="phone-outline" color={theme.colors.onSurfaceVariant} />}
            />
            {errors.phone ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.phone}</Text>
            ) : null}

            <TextInput 
              placeholder="Password" 
              mode="outlined" 
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError('password');
              }}
              secureTextEntry={secureText} 
              style={[styles.input, { backgroundColor: theme.colors.surface }]} 
              outlineStyle={styles.inputOutline}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.custom.secondary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              left={<TextInput.Icon icon="lock-outline" color={theme.colors.onSurfaceVariant} />}
              right={<TextInput.Icon icon={secureText ? "eye-off-outline" : "eye-outline"} color={theme.colors.onSurfaceVariant} onPress={() => setSecureText(!secureText)} forceTextInputFocus={false} />}
            />
            {errors.password ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text>
            ) : null}

            <TextInput 
              placeholder="Confirm Password" 
              mode="outlined" 
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError('confirmPassword');
              }}
              secureTextEntry={secureConfirmText} 
              style={[styles.input, { backgroundColor: theme.colors.surface }]} 
              outlineStyle={styles.inputOutline}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.custom.secondary}
              textColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              left={<TextInput.Icon icon="lock-outline" color={theme.colors.onSurfaceVariant} />}
              right={<TextInput.Icon icon={secureConfirmText ? "eye-off-outline" : "eye-outline"} color={theme.colors.onSurfaceVariant} onPress={() => setSecureConfirmText(!secureConfirmText)} forceTextInputFocus={false} />}
            />
            {errors.confirmPassword ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.confirmPassword}</Text>
            ) : null}

            <Button 
              mode="contained" 
              onPress={handleSignUp} 
              loading={loading}
              disabled={loading || isRequiredFieldMissing}
              style={[styles.button, !(loading || isRequiredFieldMissing) && { backgroundColor: theme.custom.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Sign Up
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
    height: '20%', 
    minHeight: 150,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
    marginTop: -20, // Overlap
  },
  cardTitle: { 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  form: { flex: 1 },
  input: { 
    marginBottom: 10, 
    height: 55, 
    fontSize: 16 
  },
  inputOutline: {
    borderRadius: 30,
  },
  errorText: { 
    marginTop: 0, 
    marginBottom: 10, 
    fontSize: 12,
    marginLeft: 10 
  },
  button: { 
    marginTop: 15,
    marginBottom: 30, 
    borderRadius: 30,
    elevation: 2 
  },
  buttonContent: { height: 55 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold' }
});
