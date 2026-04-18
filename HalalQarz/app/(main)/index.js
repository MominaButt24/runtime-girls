import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { auth } from '../../src/api/firebase';
import { subscribeToUserProfile } from '../../src/api/user';
import { getExpenses, getEligibilityHistory } from '../../src/api/firestore';
import EligibilityCard from '../../src/components/EligibilityCard';
import { formatCurrency } from '../../src/utils/formatters';

export default function HomeScreen() {
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [recentChecks, setRecentChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // Subscribe to user profile
        const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
          setUserData(data);
        });

        // Fetch expenses
        const expenseResult = await getExpenses();
        setExpenses(expenseResult.data || []);

        // Fetch recent eligibility checks (last 3)
        const checksResult = await getEligibilityHistory();
        setRecentChecks((checksResult.data || []).slice(0, 3));

        setLoading(false);

        return () => unsubscribe?.();
      } catch (error) {
        console.error('Error loading home data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const monthlyIncome = userData?.monthlyIncome || 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const freeCash = monthlyIncome - totalExpenses;

  const openCheckDetail = (check) => {
    router.push({
      pathname: '/(main)/eligibility/result',
      params: { result: JSON.stringify(check) },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  const greeting = userData?.fullName || 'User';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      {/* Greeting */}
      <View style={[styles.header, { backgroundColor: theme.custom.primaryContainer }]}>
        <Text variant="headlineMedium" style={[styles.greeting, { color: theme.custom.primary }]}>
          السلام علیکم, {greeting}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.custom.onPrimaryContainer }}>
          Welcome back to HalalQarz
        </Text>
      </View>

      {/* Financial Snapshot */}
      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
        <Card.Title
          title="Financial Snapshot"
          titleStyle={{ color: theme.custom.text, fontWeight: 'bold' }}
        />
        <Card.Content>
          <View style={styles.snapshotRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Monthly Income
            </Text>
            <Text variant="titleMedium" style={{ color: theme.custom.text, fontWeight: 'bold' }}>
              {formatCurrency(monthlyIncome)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.snapshotRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Total Expenses
            </Text>
            <Text variant="titleMedium" style={{ color: '#F44336', fontWeight: 'bold' }}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.snapshotRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Free Cash
            </Text>
            <Text
              variant="titleMedium"
              style={{ color: freeCash >= 0 ? '#4CAF50' : '#F44336', fontWeight: 'bold' }}
            >
              {formatCurrency(freeCash)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: theme.custom.primary }]}
          onPress={() => router.push('/(main)/eligibility')}
        >
          Check Loan Eligibility →
        </Button>
        <Button
          mode="outlined"
          style={styles.button}
          textColor={theme.custom.primary}
          onPress={() => router.push('/(main)/tracker')}
        >
          View Expense Tracker →
        </Button>
      </View>

      {/* Recent Checks */}
      {recentChecks.length > 0 && (
        <View style={styles.recentSection}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
            Recent Eligibility Checks
          </Text>
          {recentChecks.map((check) => (
            <EligibilityCard
              key={check.id}
              result={check.result}
              recommendedProduct={check.recommendedProduct}
              date={check.createdAt}
              onPress={() => openCheckDetail(check)}
              purpose={check.purpose}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, margin: 15, borderRadius: 15 },
  greeting: { fontWeight: 'bold', marginBottom: 5 },
  card: { margin: 15, borderRadius: 12, elevation: 2 },
  snapshotRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  divider: { marginVertical: 12 },
  buttonContainer: { paddingHorizontal: 15, marginTop: 10 },
  button: { marginBottom: 10 },
  recentSection: { padding: 15, paddingTop: 0 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
});
