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
  const [errors, setErrors] = useState({});

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [initialEmploymentType, setInitialEmploymentType] = useState('');
  const [employmentTouched, setEmploymentTouched] = useState(false);

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
          setInitialEmploymentType(data?.employmentType || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return { ...prev, [field]: '' };
    });
  };

  const validateProfileForm = () => {
    const nextErrors = {};
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedIncome = monthlyIncome.trim();

    if (!trimmedName) {
      nextErrors.fullName = 'Name is required.';
    } else if (trimmedName.length < 3) {
      nextErrors.fullName = 'Name must be at least 3 characters.';
    }

    if (trimmedPhone && !/^03\d{9}$/.test(trimmedPhone)) {
      nextErrors.phone = 'Phone must be 11 digits and start with 03.';
    }

    if (trimmedIncome) {
      const incomeNum = Number(trimmedIncome);
      if (Number.isNaN(incomeNum)) {
        nextErrors.monthlyIncome = 'Monthly income must be a valid number.';
      } else if (incomeNum < 0) {
        nextErrors.monthlyIncome = 'Monthly income cannot be negative.';
      }
    }

    if (employmentTouched && employmentType !== initialEmploymentType && !employmentType) {
      nextErrors.employmentType = 'Please select employment type.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Please fix the highlighted fields before submitting.',
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  const isRequiredFieldMissing = !fullName.trim();

  const handleSave = async () => {
    if (!validateProfileForm()) {
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
          <View style={styles.avatarBorder}>
            <Avatar.Icon
              size={100}
              icon="account"
              style={{ backgroundColor: '#FFFFFF' }}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            {fullName || 'User Profile'}
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {email}
          </Text>
        </Surface>

        <View style={styles.formContainer}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Avatar.Icon size={32} icon="card-account-details-outline" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Personal Details
                </Text>
              </View>

              <TextInput
                label="Full Name"
                mode="outlined"
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  clearFieldError('fullName');
                }}
                style={styles.input}
                left={<TextInput.Icon icon="account" iconColor={theme.colors.primary} />}
                outlineStyle={styles.inputOutline}
              />
              {errors.fullName ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.fullName}</Text>
              ) : null}

              <TextInput
                label="Email (Read Only)"
                mode="outlined"
                value={email}
                editable={false}
                style={styles.input}
                left={<TextInput.Icon icon="email" iconColor={theme.colors.primary} />}
                outlineStyle={styles.inputOutline}
              />

              <TextInput
                label="Phone Number"
                mode="outlined"
                value={phone}
                onChangeText={(value) => {
                  const digitsOnly = value.replaceAll(/\D/g, '').slice(0, 11);
                  setPhone(digitsOnly);
                  clearFieldError('phone');
                }}
                keyboardType="phone-pad"
                style={styles.input}
                left={<TextInput.Icon icon="phone" iconColor={theme.colors.primary} />}
                outlineStyle={styles.inputOutline}
              />
              {errors.phone ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.phone}</Text>
              ) : null}

              <Divider style={styles.divider} />

              <View style={styles.sectionHeader}>
                <Avatar.Icon size={32} icon="bank-outline" style={{ backgroundColor: theme.colors.secondaryContainer }} color={theme.colors.secondary} />
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.secondary }]}>
                  Financial Details
                </Text>
              </View>

              <TextInput
                label="Monthly Income (Rs.)"
                mode="outlined"
                value={monthlyIncome}
                onChangeText={(value) => {
                  setMonthlyIncome(value);
                  clearFieldError('monthlyIncome');
                }}
                keyboardType="number-pad"
                style={styles.input}
                left={<TextInput.Icon icon="cash" iconColor={theme.colors.secondary} />}
                outlineStyle={styles.inputOutline}
              />
              {errors.monthlyIncome ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.monthlyIncome}</Text>
              ) : null}

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
                  setEmploymentTouched(true);
                  clearFieldError('employmentType');
                }}
                placeholder="Select employment type"
                theme={theme.colors}
              />
              {errors.employmentType ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.employmentType}</Text>
              ) : null}

              <Button
                mode="contained"
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContent}
                onPress={handleSave}
                loading={saving}
                disabled={saving || isRequiredFieldMissing}
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatarBorder: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 15,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: -35,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputOutline: {
    borderRadius: 14,
  },
  errorText: {
    marginTop: -10,
    marginBottom: 10,
    fontSize: 12,
  },
  dropdownLabel: {
    marginTop: 5,
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    marginVertical: 25,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  saveButton: {
    marginTop: 30,
    borderRadius: 16,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 12,
    borderRadius: 16,
  },
  buttonContent: {
    height: 52,
  },
});
