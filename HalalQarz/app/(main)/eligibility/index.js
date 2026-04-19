import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Surface, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { getExpenses } from '../../../src/api/firestore';
import { getUserProfile } from '../../../src/api/user';
import { auth } from '../../../src/api/firebase';
import CustomAlert from '../../../src/components/CustomAlert';

export default function EligibilityPreCheckScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  const handleManualEntry = () => {
    router.push({
      pathname: '/(main)/eligibility/manual',
      params: { 
        syncId: Date.now().toString(), 
        clearForm: 'true' 
      }
    });
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
      const userProfile = await getUserProfile();
      const monthlyIncome = userProfile?.monthlyIncome || 0;

      // Fetch expenses to calculate obligations
      const expenseResult = await getExpenses();
      const expenses = expenseResult.data || [];
      const totalExpenses = expenses
        .filter((exp) => exp.category === 'Existing EMIs')
        .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

      setLoading(false);

      // Navigate to manual with prefilled data
      router.push({
        pathname: '/(main)/eligibility/manual',
        params: {
          monthlyIncome,
          existingObligations: totalExpenses,
          syncId: Date.now().toString(),
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
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Eligibility Pre-Check
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Choose how you want to provide your information
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Option A: Manual Entry */}
        <Card
          style={styles.optionCard}
          onPress={handleManualEntry}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Avatar.Icon 
                size={50} 
                icon="form-select" 
                style={{ backgroundColor: theme.colors.primaryContainer }} 
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleLarge" style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                Enter Manually
              </Text>
              <Text variant="bodyMedium" style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                Provide your financial details manually for a quick eligibility check.
              </Text>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={handleManualEntry}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Get Started
            </Button>
          </Card.Actions>
        </Card>

        {/* Option B: Use Expense Tracker */}
        <Card
          style={styles.optionCard}
          onPress={handleExpenseTracker}
          mode="elevated"
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Avatar.Icon 
                size={50} 
                icon="chart-timeline-variant" 
                style={{ backgroundColor: theme.colors.secondaryContainer }} 
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="titleLarge" style={[styles.optionTitle, { color: theme.colors.onSurface }]}>
                Use Expense Tracker
              </Text>
              <Text variant="bodyMedium" style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                Automatically populate your data from your expense history for accuracy.
              </Text>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ margin: 10 }} />
            ) : (
              <Button
                mode="contained-tonal"
                onPress={handleExpenseTracker}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Sync & Continue
              </Button>
            )}
          </Card.Actions>
        </Card>

        <Surface style={[styles.infoSurface, { backgroundColor: 'rgba(150, 150, 150, 0.1)' }]} elevation={0}>
          <Avatar.Icon size={30} icon="information-outline" style={{ backgroundColor: 'transparent' }} color={theme.colors.outline} />
          <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
            Your data is used solely for eligibility calculation and is kept private according to Shariah principles.
          </Text>
        </Surface>
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
  optionCard: { 
    marginBottom: 20, 
    borderRadius: 20, 
    overflow: 'hidden'
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: { fontWeight: 'bold' },
  optionDescription: { 
    lineHeight: 20, 
    marginTop: 4,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 12,
    minWidth: 120,
  },
  buttonContent: {
    height: 40,
  },
  infoSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
  }
});
