import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, useTheme, Surface, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import Dropdown from '../../../src/components/Dropdown';
import CustomAlert from '../../../src/components/CustomAlert';
import { addExpense } from '../../../src/api/firestore';

const CATEGORY_OPTIONS = [
  { label: '🏠 Rent', value: 'rent' },
  { label: '🍔 Food', value: 'food' },
  { label: '🚗 Transport', value: 'transport' },
  { label: '📚 Education', value: 'education' },
  { label: '🕌 Zakat/Sadaqah', value: 'zakat' },
  { label: '💊 Medical', value: 'medical' },
  { label: '💳 Existing EMIs', value: 'emi' },
  { label: '📦 Other', value: 'other' },
];

export default function AddExpenseScreen() {
  const theme = useTheme();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return { ...prev, [field]: '' };
    });
  };

  const validateForm = () => {
    const nextErrors = {};
    const amountNum = Number(amount);

    if (!category) {
      nextErrors.category = 'Category is required.';
    }

    if (!amount) {
      nextErrors.amount = 'Amount is required.';
    } else if (!/^\d+$/.test(amount)) {
      nextErrors.amount = 'Amount must be a whole number with no decimals.';
    } else if (Number.isNaN(amountNum) || amountNum < 1) {
      nextErrors.amount = 'Amount must be at least 1.';
    }

    if (description && description.length > 100) {
      nextErrors.description = 'Description must be 100 characters or less.';
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

  const isRequiredFieldMissing = !category || !amount;

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const selectedCategory = CATEGORY_OPTIONS.find((opt) => opt.value === category);
      const categoryName = selectedCategory?.label.replace(/^[^\s]*\s/, '') || category;

      await addExpense(categoryName, Number(amount), description);

      setAlert({
        visible: true,
        title: 'Success',
        message: 'Expense added successfully',
        type: 'success',
        onConfirm: () => router.back(),
      });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to add expense',
        type: 'error',
      });
    }
    setLoading(false);
  };

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
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Add Expense
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Record your spending to track budget
          </Text>
        </Surface>

        <View style={styles.content}>
          <Surface style={styles.formCard} elevation={2}>
            <View style={styles.iconHeader}>
              <Avatar.Icon size={50} icon="plus-circle-outline" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
            </View>

            <Text variant="labelLarge" style={styles.label}>Expense Category</Text>
            <Dropdown
              options={CATEGORY_OPTIONS.map((opt) => opt.label)}
              selectedValue={
                category
                  ? CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label || ''
                  : ''
              }
              onValueChange={(value) => {
                const selected = CATEGORY_OPTIONS.find((opt) => opt.label === value);
                setCategory(selected?.value || '');
                clearFieldError('category');
              }}
              placeholder="Select category"
              theme={theme.colors}
            />
            {errors.category ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.category}</Text>
            ) : null}

            <TextInput
              label="Amount (Rs.)"
              mode="outlined"
              keyboardType="number-pad"
              value={amount}
              onChangeText={(value) => {
                const numericOnly = value.replaceAll(/\D/g, '');
                setAmount(numericOnly);
                clearFieldError('amount');
              }}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
              left={<TextInput.Icon icon="cash" />}
            />
            {errors.amount ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.amount}</Text>
            ) : null}

            <TextInput
              label="Description (Optional)"
              placeholder="Notes"
              mode="outlined"
              value={description}
              onChangeText={(value) => {
                setDescription(value);
                clearFieldError('description');
              }}
              multiline
              numberOfLines={3}
              maxLength={100}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />
            {errors.description ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.description}</Text>
            ) : null}

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.saveButton}
                contentStyle={{ height: 50 }}
                onPress={handleSave}
                loading={loading}
                disabled={loading || isRequiredFieldMissing}
                icon="check"
              >
                Save Expense
              </Button>

              <Button
                mode="text"
                style={styles.cancelButton}
                textColor={theme.colors.outline}
                onPress={() => router.back()}
              >
                Cancel
              </Button>
            </View>
          </Surface>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
          onConfirm={alert.onConfirm}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTitle: { color: '#FFFFFF', fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  content: { 
    paddingHorizontal: 20, 
    marginTop: -30,
    paddingBottom: 40 
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginTop: 15,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    marginTop: 6,
    marginBottom: 4,
    fontSize: 12,
  },
  buttonContainer: {
    marginTop: 30,
  },
  saveButton: {
    borderRadius: 14,
    marginBottom: 10,
  },
  cancelButton: {
    borderRadius: 14,
  },
});
