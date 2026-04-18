import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Avatar, useTheme, Card, Button, TextInput, Divider, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { auth } from '../../src/api/firebase';
import { getUserProfile } from '../../src/api/user';
import { updateUserProfile } from '../../src/api/firestore';
import { logoutUser } from '../../src/api/auth';
import Dropdown from '../../src/components/Dropdown';
import CustomAlert from '../../src/components/CustomAlert';

const EMPLOYMENT_OPTIONS = [
  { label: 'Salaried', value: 'salaried' },
  { label: 'Self-Employed', value: 'self-employed' },
  { label: 'Business Owner', value: 'business' },
  { label: 'Student', value: 'student' },
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Unemployed', value: 'unemployed' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const data = await getUserProfile(user.uid);
          setFullName(data?.fullName || '');
          setEmail(data?.email || user.email || '');
          setPhone(data?.phone || '');
          setMonthlyIncome(data?.monthlyIncome ? String(data.monthlyIncome) : '');
          setEmploymentType(data?.employmentType || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!fullName || !email) {
      setAlert({
        visible: true,
        title: 'Missing Fields',
        message: 'Please fill in name and email',
        type: 'warning',
      });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        fullName,
        email,
        phone,
      };

      if (monthlyIncome) {
        if (Number.isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) {
          setAlert({
            visible: true,
            title: 'Invalid Income',
            message: 'Please enter a valid monthly income',
            type: 'warning',
          });
          setSaving(false);
          return;
        }
        updateData.monthlyIncome = Number(monthlyIncome);
      }

      if (employmentType) {
        updateData.employmentType = employmentType;
      }

      await updateUserProfile(updateData);

      setAlert({
        visible: true,
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success',
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to update profile',
        type: 'error',
      });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace('/(auth)/login');
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Logout Error',
        message: error.message || 'Failed to logout',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const headerContentColor = theme.dark ? theme.colors.onPrimaryContainer : '#FFFFFF';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
          <Avatar.Icon
            size={100}
            icon="account"
            style={{ backgroundColor: theme.dark ? theme.colors.primaryContainer : 'rgba(255, 255, 255, 0.2)' }}
            color={headerContentColor}
          />
          <Text variant="headlineSmall" style={[styles.headerTitle, { color: headerContentColor }]}>
            {fullName || 'My Profile'}
          </Text>
          <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.dark ? theme.colors.onPrimaryContainer : 'rgba(255, 255, 255, 0.8)' }]}>
            {email}
          </Text>
        </Surface>

        <View style={styles.formContainer}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Personal Details
              </Text>

              <TextInput
                label="Full Name"
                mode="outlined"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
                left={<TextInput.Icon icon="account-outline" />}
                outlineStyle={styles.inputOutline}
              />

              <TextInput
                label="Email (Read Only)"
                mode="outlined"
                value={email}
                editable={false}
                style={styles.input}
                left={<TextInput.Icon icon="email-outline" />}
                outlineStyle={styles.inputOutline}
              />

              <TextInput
                label="Phone Number"
                mode="outlined"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone-outline" />}
                outlineStyle={styles.inputOutline}
              />

              <Divider style={styles.divider} />

              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Financial Details
              </Text>

              <TextInput
                label="Monthly Income (Rs.)"
                mode="outlined"
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="number-pad"
                style={styles.input}
                left={<TextInput.Icon icon="cash" />}
                outlineStyle={styles.inputOutline}
              />

              <Text variant="labelMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurfaceVariant }]}>
                Employment Status
              </Text>
              <Dropdown
                options={EMPLOYMENT_OPTIONS.map((opt) => opt.label)}
                selectedValue={
                  employmentType
                    ? EMPLOYMENT_OPTIONS.find((opt) => opt.value === employmentType)?.label || ''
                    : ''
                }
                onValueChange={(value) => {
                  const selected = EMPLOYMENT_OPTIONS.find((opt) => opt.label === value);
                  setEmploymentType(selected?.value || '');
                }}
                placeholder="Select employment type"
                theme={theme.colors}
              />

              <Button
                mode="contained"
                style={styles.saveButton}
                contentStyle={styles.buttonContent}
                onPress={handleSave}
                loading={saving}
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Save Changes'}
              </Button>

              <Button
                mode="outlined"
                style={[styles.logoutButton, { borderColor: theme.colors.outlineVariant }]}
                contentStyle={styles.buttonContent}
                textColor={theme.colors.error}
                onPress={handleLogout}
                icon="logout"
              >
                Sign Out
              </Button>
            </Card.Content>
          </Card>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 50,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginTop: 15,
  },
  headerSubtitle: {
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    marginBottom: 16,
  },
  inputOutline: {
    borderRadius: 12,
  },
  dropdownLabel: {
    marginTop: 5,
    marginBottom: 8,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 20,
  },
  saveButton: {
    marginTop: 25,
    borderRadius: 12,
  },
  logoutButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
});
