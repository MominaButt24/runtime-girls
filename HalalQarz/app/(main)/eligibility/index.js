import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { getExpenses } from '../../../src/api/firestore';
import { subscribeToUserProfile } from '../../../src/api/user';
import { auth } from '../../../src/api/firebase';
import CustomAlert from '../../../src/components/CustomAlert';

export default function EligibilityPreCheckScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  const handleManualEntry = () => {
    router.push('/(main)/eligibility/manual');
  };

  const handleExpenseTracker = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setAlert({
          visible: true,
          title: 'Error',
          message: 'User not authenticated',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      // Fetch user profile for monthly income
      let monthlyIncome = 0;
      const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
        if (data?.monthlyIncome) {
          monthlyIncome = data.monthlyIncome;
        }
      });
      unsubscribe?.();

      // Fetch expenses to calculate obligations
      const expenseResult = await getExpenses();
      const expenses = expenseResult.data || [];
      const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

      setLoading(false);

      // Navigate to manual with prefilled data
      router.push({
        pathname: '/(main)/eligibility/manual',
        params: {
          monthlyIncome,
          existingObligations: totalExpenses,
          prefilled: 'true',
        },
      });
    } catch (error) {
      setLoading(false);
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to load expense data',
        type: 'error',
      });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={[styles.header, { backgroundColor: theme.custom.primaryContainer }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.primary }]}>
          Eligibility Pre-Check
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.custom.onPrimaryContainer }}>
          Choose how you want to provide your information
        </Text>
      </View>

      <View style={styles.content}>
        {/* Option A: Manual Entry */}
        <Card
          style={[styles.optionCard, { backgroundColor: theme.custom.surface }]}
          onPress={handleManualEntry}
        >
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.optionTitle, { color: theme.custom.text }]}
            >
              📋 Enter Manually
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.optionDescription, { color: theme.custom.textSecondary }]}
            >
              Provide your financial details manually for a quick eligibility check
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              style={{ backgroundColor: theme.custom.primary }}
              onPress={handleManualEntry}
            >
              Get Started
            </Button>
          </Card.Actions>
        </Card>

        {/* Option B: Use Expense Tracker */}
        <Card
          style={[styles.optionCard, { backgroundColor: theme.custom.surface }]}
          onPress={handleExpenseTracker}
        >
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.optionTitle, { color: theme.custom.text }]}
            >
              📊 Use Expense Tracker
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.optionDescription, { color: theme.custom.textSecondary }]}
            >
              Automatically populate your data from your expense history
            </Text>
          </Card.Content>
          <Card.Actions>
            {loading ? (
              <ActivityIndicator color={theme.custom.primary} />
            ) : (
              <Button
                mode="contained"
                style={{ backgroundColor: theme.custom.primary }}
                onPress={handleExpenseTracker}
              >
                Continue
              </Button>
            )}
          </Card.Actions>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, margin: 15, borderRadius: 15, marginBottom: 20 },
  title: { fontWeight: 'bold', marginBottom: 5 },
  content: { paddingHorizontal: 15, paddingBottom: 40 },
  optionCard: { marginBottom: 20, borderRadius: 12, elevation: 2 },
  optionTitle: { fontWeight: 'bold', marginBottom: 10 },
  optionDescription: { lineHeight: 20 },
});
