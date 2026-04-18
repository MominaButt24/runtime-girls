import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { loginUser } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ visible: true, title: 'Input Required', message: 'Please fill in all fields.', type: 'warning' });
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
          onChangeText={setEmail}
          style={styles.input} 
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput 
          label="Password" 
          mode="outlined" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
          style={styles.input} 
        />

        <Button 
          mode="contained" 
          onPress={handleLogin} 
          loading={loading}
          disabled={loading}
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
  button: { marginTop: 10, marginBottom: 15, paddingVertical: 5 }
});
