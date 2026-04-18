import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { auth } from '../../../src/api/firebase';
import { subscribeToUserProfile } from '../../../src/api/user';
import { getExpenses, updateUserProfile } from '../../../src/api/firestore';
import ExpenseItem from '../../../src/components/ExpenseItem';
import { formatCurrency } from '../../../src/utils/formatters';

export default function TrackerScreen() {
  const theme = useTheme();
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
          if (data?.monthlyIncome) {
            setMonthlyIncome(String(data.monthlyIncome));
          }
        });

        const expenseResult = await getExpenses();
        setExpenses(expenseResult.data || []);

        setLoading(false);

        return () => unsubscribe?.();
      } catch (error) {
        console.error('Error loading tracker data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const income = Number(monthlyIncome) || 0;
  const freeCash = income - totalExpenses;

  const handleUpdateIncome = async () => {
    if (!monthlyIncome || Number.isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) {
      return;
    }

    setUpdating(true);
    try {
      await updateUserProfile({ monthlyIncome: Number(monthlyIncome) });
    } catch (error) {
      console.error('Failed to update monthly income:', error);
    }
    setUpdating(false);
  };

  const handleCheckEligibility = () => {
    router.push({
      pathname: '/(main)/eligibility/manual',
      params: {
        monthlyIncome: income.toString(),
        existingObligations: totalExpenses.toString(),
        prefilled: 'true',
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={[styles.header, { backgroundColor: theme.custom.primaryContainer }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.primary }]}>
          My Halal Expense Tracker
        </Text>
        <Text variant="bodySmall" style={{ color: theme.custom.onPrimaryContainer }}>
          Track spending and plan finances
        </Text>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.custom.text }]}>
            Monthly Income
          </Text>
          <TextInput
            label="Amount (Rs.)"
            mode="outlined"
            keyboardType="number-pad"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
            style={styles.input}
            theme={{ colors: { primary: theme.custom.primary } }}
          />
          <Button
            mode="contained"
            style={{ backgroundColor: theme.custom.primary, marginTop: 10 }}
            onPress={handleUpdateIncome}
            loading={updating}
            disabled={updating}
          >
            Update Income
          </Button>

          <Divider style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Total Expenses
            </Text>
            <Text variant="titleSmall" style={{ color: '#F44336', fontWeight: 'bold' }}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Free Cash
            </Text>
            <Text
              variant="titleSmall"
              style={{ color: freeCash >= 0 ? '#4CAF50' : '#F44336', fontWeight: 'bold' }}
            >
              {formatCurrency(freeCash)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="plus"
          style={{ backgroundColor: theme.custom.primary, marginBottom: 10 }}
          onPress={() => router.push('/(main)/tracker/add-expense')}
        >
          Add Expense
        </Button>
        <Button
          mode="outlined"
          style={{ borderColor: theme.custom.primary, marginBottom: 10 }}
          textColor={theme.custom.primary}
          onPress={handleCheckEligibility}
        >
          Check Eligibility with this data
        </Button>
      </View>

      {expenses.length > 0 ? (
        <View style={styles.expenseSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
            Recent Expenses ({expenses.length})
          </Text>
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              category={expense.category}
              amount={Number(expense.amount) || 0}
              description={expense.description}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyView}>
          <Text style={{ color: theme.custom.textSecondary, textAlign: 'center' }}>
            No expenses yet. Add your first expense!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, margin: 15, borderRadius: 15, marginBottom: 10 },
  title: { fontWeight: 'bold', marginBottom: 5 },
  card: { margin: 15, borderRadius: 12, elevation: 2 },
  cardTitle: { fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 10 },
  divider: { marginVertical: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  buttonContainer: { paddingHorizontal: 15, marginVertical: 10 },
  expenseSection: { padding: 15, paddingTop: 0 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
  emptyView: { padding: 40, justifyContent: 'center', alignItems: 'center' },
});
