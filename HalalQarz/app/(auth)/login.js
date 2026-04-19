import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, Button, TextInput, useTheme, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { loginUser } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
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
      style={[styles.container, { backgroundColor: theme.custom.primary }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Dark Header Section */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={{ width: 100, height: 100, resizeMode: 'contain', marginBottom: 15, borderRadius: 20 }}
          />
          <Text variant="displayMedium" style={styles.headerTitle}>
            Welcome Back!
          </Text>
          
        </View>

        {/* Curved Card Section */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          
          <Text variant="headlineLarge" style={[styles.cardTitle, { color: theme.custom.primary }]}>
            Login
          </Text>
          
          <View style={styles.form}>
            <TextInput 
              placeholder="Email" 
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

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={{ color: theme.custom.secondary, fontWeight: 'bold', fontSize: 13 }}>Forget Password</Text>
            </TouchableOpacity>

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              loading={loading}
              disabled={loading || isRequiredFieldMissing}
              style={[styles.button, !(loading || isRequiredFieldMissing) && { backgroundColor: theme.custom.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Login
            </Button>
            
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
              <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>Or login with</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={[styles.socialButton, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                <MaterialCommunityIcons name="apple" size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { borderColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
                <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
            </View>

            <View style={styles.footerRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={{ color: theme.custom.secondary, fontWeight: 'bold' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
    height: '35%', 
    minHeight: 250,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 40
  },
  headerTitle: { 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  headerSubtitle: { 
    color: '#E0E0E0',
    marginTop: 5
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
    marginTop: -20, // Overlap slightly
  },
  cardTitle: { 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  form: { flex: 1 },
  input: { 
    marginBottom: 15, 
    height: 55, 
    fontSize: 16 
  },
  inputOutline: {
    borderRadius: 30,
  },
  errorText: { 
    marginTop: -5, 
    marginBottom: 10, 
    fontSize: 12,
    marginLeft: 10 
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginRight: 10
  },
  button: { 
    marginBottom: 30, 
    borderRadius: 30,
    elevation: 2 
  },
  buttonContent: { height: 55 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold' },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 12,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40
  },
  socialButton: {
    height: 50,
    width: 60,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
