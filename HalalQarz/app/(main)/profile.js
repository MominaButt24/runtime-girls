import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Avatar, useTheme, Card, Button, TextInput, Divider } from 'react-native-paper';
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
      <View style={[styles.container, styles.center, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.header}>
        <Avatar.Icon
          size={100}
          icon="account"
          style={{ backgroundColor: theme.custom.primary }}
        />
      </View>

      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
            Personal Information
          </Text>

          <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
            Full Name
          </Text>
          <TextInput
            label="Name"
            mode="outlined"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            theme={{ colors: { primary: theme.custom.primary } }}
          />

          <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
            Email (Read Only)
          </Text>
          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            editable={false}
            style={styles.input}
            theme={{ colors: { primary: theme.custom.primary } }}
          />

          <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
            Phone Number
          </Text>
          <TextInput
            label="Phone"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
            theme={{ colors: { primary: theme.custom.primary } }}
          />

          <Divider style={styles.divider} />

          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
            Financial Information
          </Text>

          <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
            Monthly Income
          </Text>
          <TextInput
            label="Amount (Rs.)"
            mode="outlined"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            keyboardType="number-pad"
            style={styles.input}
            theme={{ colors: { primary: theme.custom.primary } }}
          />

          <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
            Employment Type
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

          <Divider style={styles.divider} />

          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: theme.custom.primary }]}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>

          <Button
            mode="outlined"
            style={[styles.button, { borderColor: '#F44336' }]}
            textColor="#F44336"
            onPress={handleLogout}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  card: { margin: 15, borderRadius: 12, elevation: 2, marginBottom: 40 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
  label: { marginTop: 15, marginBottom: 8, fontWeight: '500' },
  input: { marginBottom: 15 },
  divider: { marginVertical: 15 },
  button: { marginTop: 10 },
});
