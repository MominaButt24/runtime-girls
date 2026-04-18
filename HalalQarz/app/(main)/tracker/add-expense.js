import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, useTheme } from 'react-native-paper';
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
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  const handleSave = async () => {
    if (!category) {
      setAlert({
        visible: true,
        title: 'Missing Field',
        message: 'Please select a category',
        type: 'warning',
      });
      return;
    }

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      setAlert({
        visible: true,
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
        type: 'warning',
      });
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
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Add Expense
        </Text>

        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Category *
        </Text>
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
          }}
          placeholder="Select category"
          theme={theme.colors}
        />

        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Amount *
        </Text>
        <TextInput
          label="Amount (Rs.)"
          mode="outlined"
          keyboardType="number-pad"
          value={amount}
          onChangeText={setAmount}
          style={styles.input}
          theme={{ colors: { primary: theme.custom.primary } }}
        />

        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Description (Optional)
        </Text>
        <TextInput
          label="Notes"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
          theme={{ colors: { primary: theme.custom.primary } }}
        />

        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: theme.custom.primary }]}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Expense'}
        </Button>

        <Button
          mode="outlined"
          style={styles.button}
          textColor={theme.custom.primary}
          onPress={() => router.back()}
        >
          Cancel
        </Button>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 15, marginBottom: 8, fontWeight: '500' },
  input: { marginBottom: 15 },
  button: { marginTop: 15 },
});
