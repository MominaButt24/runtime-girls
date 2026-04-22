import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, TextInput, useTheme, Divider, Surface, IconButton, Avatar } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { auth } from '../../../src/api/firebase';
import { subscribeToUserProfile, getUserProfile } from '../../../src/api/user';
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
    let unsubscribe;
    const user = auth.currentUser;
    if (user) {
      unsubscribe = subscribeToUserProfile(user.uid, (data) => {
        if (data?.monthlyIncome) {
          setMonthlyIncome(String(data.monthlyIncome));
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchExpenses = async () => {
        try {
          const expenseResult = await getExpenses();
          setExpenses(expenseResult.data || []);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        } finally {
          setLoading(false);
        }
      };
      
      const user = auth.currentUser;
      if (user) {
        fetchExpenses();
      } else {
        setLoading(false);
      }
    }, [])
  );

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

  const handleCheckEligibility = async () => {
    try {
      const userProfile = await getUserProfile();
      const latestIncome = userProfile?.monthlyIncome || 0;

      const expenseResult = await getExpenses();
      const allExpenses = expenseResult.data || [];

      const existingEMIs = allExpenses
        .filter((expense) => expense.category === "Existing EMIs")
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

      router.push({
        pathname: '/(main)/eligibility/manual',
        params: {
          monthlyIncome: latestIncome.toString(),
          existingObligations: existingEMIs.toString(),
          syncId: Date.now().toString(),
        },
      });
    } catch (error) {
      console.error("Error fetching fresh data for eligibility check:", error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View style={styles.headerContent}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Expense Tracker
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Track spending and plan finances
          </Text>
        </View>
      </Surface>

      <View style={styles.contentContainer}>
        {/* Income & Summary Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.primary }]}>Monthly Budget</Text>
              <Avatar.Icon size={32} icon="calculator-variant" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
            </View>
            
            <View style={styles.incomeInputRow}>
              <TextInput
                label="Monthly Income"
                mode="outlined"
                keyboardType="number-pad"
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                style={styles.input}
                outlineStyle={{ borderRadius: 14 }}
                left={<TextInput.Icon icon="cash" iconColor={theme.colors.primary} />}
              />
              <IconButton 
                icon={updating ? "loading" : "check-circle"} 
                mode="contained" 
                containerColor={theme.colors.secondary} 
                iconColor="#FFF"
                size={30}
                onPress={handleUpdateIncome}
                disabled={updating}
                style={styles.updateIcon}
              />
            </View>

            <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Total Spent</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: '800' }}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Available</Text>
                <Text variant="titleMedium" style={{ color: freeCash >= 0 ? (theme.dark ? '#81C784' : '#2E7D32') : theme.colors.error, fontWeight: '800' }}>
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
            style={[styles.mainAction, { backgroundColor: theme.colors.primary }]}
            contentStyle={{ height: 56 }}
            labelStyle={{ fontWeight: 'bold' }}
            onPress={() => router.push('/(main)/tracker/add-expense')}
          >
            Add New Expense
          </Button>
          <Button
            mode="outlined"
            icon="clipboard-search-outline"
            style={[styles.secondaryAction, { borderColor: theme.colors.secondary }]}
            textColor={theme.colors.secondary}
            contentStyle={{ height: 48 }}
            labelStyle={{ fontWeight: '600' }}
            onPress={handleCheckEligibility}
          >
            Check Eligibility
          </Button>
        </View>

        {/* Expenses List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Transactions
            </Text>
            {expenses.length > 0 && (
              <Surface style={[styles.countBadge, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
                <Text variant="labelSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>{expenses.length}</Text>
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
            <Surface style={[styles.emptyCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={0}>
              <Avatar.Icon icon="receipt" size={60} style={{ backgroundColor: 'transparent' }} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
                No expenses recorded this month
              </Text>
              <Button 
                mode="text" 
                textColor={theme.colors.primary}
                onPress={() => router.push('/(main)/tracker/add-expense')}
              >
                Track your first expense
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
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: { color: '#FFFFFF', fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.85)', marginTop: 4 },
  contentContainer: {
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
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: { fontWeight: 'bold' },
  incomeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  updateIcon: {
    marginLeft: 10,
    marginTop: 6,
    borderRadius: 14,
  },
  divider: { marginVertical: 20, height: 1 },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: { marginBottom: 4, fontWeight: '600', fontSize: 12 },
  actionSection: {
    marginBottom: 25,
  },
  mainAction: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
  },
  secondaryAction: {
    borderRadius: 16,
    borderWidth: 1.5,
  },
  listSection: {
    flex: 1,
    marginTop: 10,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: { fontWeight: '700', fontSize: 18 },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
