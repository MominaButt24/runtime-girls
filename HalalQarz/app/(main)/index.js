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
      {/* Enhanced Header with Palette Indigo/Blue Gradient feel */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="headlineMedium" style={[styles.greeting, { color: '#FFFFFF' }]}>
              السلام علیکم, {greeting}
            </Text>
            <Text variant="bodyMedium" style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500' }}>
              Welcome back to HalalQarz
            </Text>
          </View>
          <IconButton
            icon="bell-outline"
            iconColor="#FFFFFF"
            size={24}
            onPress={() => router.push('/(main)/settings')}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          />
        </View>
      </Surface>

      <View style={styles.contentContainer}>
        {/* Modern Financial Snapshot Card using Palette Surface color */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>Financial Snapshot</Text>
              <IconButton icon="chart-donut" size={20} iconColor={theme.colors.secondary} />
            </View>
            
            <View style={styles.snapshotGrid}>
              <View style={styles.snapshotItem}>
                <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Monthly Income</Text>
                <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.tertiary || '#4541D4' }]}>
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
              <Surface style={[styles.cashBadge, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
                <Text variant="labelLarge" style={[styles.label, { color: theme.colors.primary, marginBottom: 0 }]}>Available Free Cash</Text>
              </Surface>
              <Text
                variant="headlineSmall"
                style={[styles.freeCashAmount, { color: freeCash >= 0 ? '#2E7D32' : theme.colors.error }]}
              >
                {formatCurrency(freeCash)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Grid - Using Primary and Secondary from Palette */}
        <View style={styles.actionGrid}>
          <Button
            mode="contained"
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.actionButtonContent}
            labelStyle={styles.actionButtonLabel}
            onPress={() => router.push('/(main)/eligibility')}
            icon="clipboard-check-outline"
          >
            Loan Eligibility
          </Button>
          <Button
            mode="contained"
            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
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
              <Button 
                compact 
                textColor={theme.colors.primary} 
                onPress={() => router.push('/(main)/eligibility/index')}
              >
                View All
              </Button>
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
    paddingBottom: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontWeight: 'bold', letterSpacing: -0.5 },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -35,
  },
  card: {
    borderRadius: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
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
    paddingVertical: 12,
  },
  snapshotItem: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  amount: {
    fontWeight: '800',
    fontSize: 18,
  },
  verticalDivider: {
    height: '80%',
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  horizontalDivider: {
    marginVertical: 18,
    backgroundColor: '#F0F0F0',
  },
  freeCashContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  cashBadge: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  freeCashAmount: {
    fontWeight: '900',
    fontSize: 26,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 16,
    elevation: 4,
  },
  actionButtonContent: {
    height: 56,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  recentSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: '700', fontSize: 18 },
});
