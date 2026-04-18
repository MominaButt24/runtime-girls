import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { signUpUser } from '../../src/api/auth';
import CustomAlert from '../../src/components/CustomAlert';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });
  const theme = useTheme();

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setAlert({ visible: true, title: 'Input Required', message: 'Please fill in all fields.', type: 'warning' });
      return;
    }

    setLoading(true);
    const { user, error } = await signUpUser(email, password, fullName);
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
            onChangeText={setFullName}
            style={styles.input} 
          />
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
            onPress={handleSignUp} 
            loading={loading}
            disabled={loading}
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
  button: { marginTop: 10, marginBottom: 15, paddingVertical: 5 }
});
