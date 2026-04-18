import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Text, Card, Button, useTheme, Divider, IconButton, Surface } from 'react-native-paper';
import { router } from 'expo-router';
import { auth } from '../../src/api/firebase';
import { subscribeToUserProfile } from '../../src/api/user';
import { getExpenses, getEligibilityHistory } from '../../src/api/firestore';
import EligibilityCard from '../../src/components/EligibilityCard';
import { formatCurrency } from '../../src/utils/formatters';

const { width } = Dimensions.get('window');

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

        const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
          setUserData(data);
        });

        const expenseResult = await getExpenses();
        setExpenses(expenseResult.data || []);

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
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const greeting = userData?.fullName || 'User';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="headlineMedium" style={[styles.greeting, { color: theme.dark ? '#000' : '#FFF' }]}>
              السلام علیکم, {greeting}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)', fontWeight: '500' }}>
              Welcome back to HalalQarz
            </Text>
          </View>
          <IconButton
            icon="bell-outline"
            iconColor={theme.dark ? '#000' : '#FFF'}
            size={24}
            onPress={() => router.push('/(main)/settings')}
          />
        </View>
      </Surface>

      <View style={styles.contentContainer}>
        {/* Modern Financial Snapshot Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Financial Snapshot</Text>
              <IconButton icon="chart-donut" size={20} iconColor={theme.colors.onSurfaceVariant} />
            </View>
            
            <View style={styles.snapshotGrid}>
              <View style={styles.snapshotItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Monthly Income</Text>
                <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.primary }]}>
                  {formatCurrency(monthlyIncome)}
                </Text>
              </View>

              <Divider style={styles.verticalDivider} />

              <View style={styles.snapshotItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Total Expenses</Text>
                <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.error }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </View>
            </View>

            <Divider style={styles.horizontalDivider} />

            <View style={styles.freeCashContainer}>
              <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Available Balance (Free Cash)</Text>
              <Text
                variant="headlineSmall"
                style={[styles.freeCashAmount, { color: freeCash >= 0 ? (theme.dark ? '#81C784' : '#2E7D32') : theme.colors.error }]}
              >
                {formatCurrency(freeCash)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <Button
            mode="contained"
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            onPress={() => router.push('/(main)/eligibility')}
            icon="clipboard-check-outline"
          >
            Loan Eligibility
          </Button>
          <Button
            mode="contained-tonal"
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            onPress={() => router.push('/(main)/tracker')}
            icon="cash-register"
          >
            Expense Tracker
          </Button>
        </View>

        {/* Recent Checks Section */}
        {recentChecks.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                Recent Eligibility Checks
              </Text>
              <Button compact onPress={() => router.push('/(main)/eligibility/result')}>View All</Button>
            </View>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontWeight: 'bold', letterSpacing: -0.5 },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
  },
  card: {
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: { fontWeight: 'bold' },
  snapshotGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  snapshotItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    marginBottom: 4,
    fontWeight: '500',
  },
  amount: {
    fontWeight: '700',
  },
  verticalDivider: {
    height: '100%',
    width: 1,
  },
  horizontalDivider: {
    marginVertical: 15,
  },
  freeCashContainer: {
    alignItems: 'center',
    paddingBottom: 5,
  },
  freeCashAmount: {
    fontWeight: '900',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 12,
  },
  actionButtonContent: {
    height: 50,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  recentSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontWeight: 'bold' },
});
