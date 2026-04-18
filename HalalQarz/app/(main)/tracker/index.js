import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider, Surface, IconButton } from 'react-native-paper';
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
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const headerContentColor = theme.dark ? theme.colors.onPrimaryContainer : '#FFFFFF';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View style={styles.headerContent}>
          <Text variant="headlineMedium" style={[styles.headerTitle, { color: headerContentColor }]}>
            Expense Tracker
          </Text>
          <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.dark ? theme.colors.onPrimaryContainer : 'rgba(255, 255, 255, 0.8)' }]}>
            Track spending and plan finances
          </Text>
        </View>
      </Surface>

      <View style={styles.contentContainer}>
        {/* Income & Summary Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Monthly Budget</Text>
            <View style={styles.incomeInputRow}>
              <TextInput
                label="Monthly Income"
                mode="outlined"
                keyboardType="number-pad"
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                style={styles.input}
                outlineStyle={{ borderRadius: 12 }}
                left={<TextInput.Icon icon="cash" />}
              />
              <IconButton 
                icon={updating ? "loading" : "check-circle"} 
                mode="contained" 
                containerColor={theme.colors.primary} 
                iconColor={theme.colors.onPrimary}
                size={30}
                onPress={handleUpdateIncome}
                disabled={updating}
                style={styles.updateIcon}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Total Spent</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: '700' }}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Available</Text>
                <Text variant="titleMedium" style={{ color: freeCash >= 0 ? (theme.dark ? '#81C784' : '#2E7D32') : theme.colors.error, fontWeight: '700' }}>
                  {formatCurrency(freeCash)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <Button
            mode="contained"
            icon="plus"
            style={styles.mainAction}
            contentStyle={{ height: 50 }}
            onPress={() => router.push('/(main)/tracker/add-expense')}
          >
            Add New Expense
          </Button>
          <Button
            mode="outlined"
            icon="calculator-variant"
            style={[styles.secondaryAction, { borderColor: theme.colors.outlineVariant }]}
            contentStyle={{ height: 45 }}
            onPress={handleCheckEligibility}
          >
            Analyze Eligibility
          </Button>
        </View>

        {/* Expenses List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Transactions
            </Text>
            {expenses.length > 0 && (
              <Surface style={[styles.countBadge, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
                <Text variant="labelSmall" style={{ fontWeight: 'bold', color: theme.colors.onSurfaceVariant }}>{expenses.length}</Text>
              </Surface>
            )}
          </View>
          
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                category={expense.category}
                amount={Number(expense.amount) || 0}
                description={expense.description}
              />
            ))
          ) : (
            <Surface style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outlineVariant }]} elevation={1}>
              <IconButton icon="receipt" size={40} iconColor={theme.colors.outline} />
              <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                No expenses tracked yet
              </Text>
              <Button mode="text" onPress={() => router.push('/(main)/tracker/add-expense')}>
                Record your first expense
              </Button>
            </Surface>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTitle: { fontWeight: 'bold' },
  headerSubtitle: { },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: { fontWeight: 'bold', marginBottom: 15 },
  incomeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  updateIcon: {
    marginLeft: 8,
    marginTop: 6,
  },
  divider: { marginVertical: 15 },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: { marginBottom: 2 },
  actionSection: {
    marginBottom: 25,
  },
  mainAction: {
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryAction: {
    borderRadius: 12,
  },
  listSection: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontWeight: 'bold' },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
