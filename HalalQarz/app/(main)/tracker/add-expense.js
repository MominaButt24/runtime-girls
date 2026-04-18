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
              }}
              placeholder="Select category"
              theme={theme.colors}
            />

            <TextInput
              label="Amount (Rs.)"
              mode="outlined"
              keyboardType="number-pad"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
              left={<TextInput.Icon icon="cash" />}
            />

            <TextInput
              label="Description (Optional)"
              placeholder="Notes"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.saveButton}
                contentStyle={{ height: 50 }}
                onPress={handleSave}
                loading={loading}
                disabled={loading}
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
