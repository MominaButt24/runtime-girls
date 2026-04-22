import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Chip, Surface, Avatar, Divider } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import ProgressBar from '../../../src/components/ProgressBar';
import { formatCurrency } from '../../../src/utils/formatters';

const getResultMessage = (status) => {
  switch (status) {
    case 'eligible':
      return "✓ You're Eligible!";
    case 'conditional':
      return '⚠ Conditional Approval';
    case 'notEligible':
      return '✗ Not Eligible';
    default:
      return 'Eligibility Check Complete';
  }
};

export default function EligibilityResultScreen() {
  const theme = useTheme();
  const { result: resultParam } = useLocalSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    try {
      if (resultParam) {
        const parsedResult = JSON.parse(resultParam);
        setResult(parsedResult);
      }
    } catch (error) {
      console.error('Error parsing result:', error);
    }
    setLoading(false);
  }, [resultParam]);

  if (loading || !result) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getResultColor = (status) => {
    switch (status) {
      case 'eligible':
        return '#2E7D32';
      case 'conditional':
        return '#F57C00';
      case 'notEligible':
        return '#D32F2F';
      default:
        return theme.colors.primary;
    }
  };

  const resultColor = getResultColor(result.result);
  const product = result.productDetails ? JSON.parse(result.productDetails) : null;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.header, { backgroundColor: resultColor }]} elevation={4}>
        <View style={styles.headerIconContainer}>
          <Avatar.Icon 
            size={80} 
            icon={result.result === 'eligible' ? 'check-decagram' : result.result === 'conditional' ? 'alert-decagram' : 'close-decagram'} 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            color="#FFFFFF"
          />
        </View>
        <Text variant="headlineMedium" style={styles.resultTitle}>
          {getResultMessage(result.result)}
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          for Islamic Financing Analysis
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Score Card */}
        <Surface style={styles.scoreCard} elevation={2}>
          <View style={styles.scoreRow}>
            <View>
              <Text variant="labelLarge" style={{ color: theme.colors.outline }}>Eligibility Score</Text>
              <Text variant="headlineLarge" style={[styles.scoreText, { color: resultColor }]}>
                {result.score}/100
              </Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={{ color: resultColor, fontWeight: 'bold', fontSize: 12 }}>
                {result.result.toUpperCase()}
              </Text>
            </View>
          </View>
          <ProgressBar value={result.score} max={100} color={resultColor} height={10} />
          <Text variant="bodySmall" style={[styles.scoreDesc, { color: theme.colors.onSurfaceVariant }]}>
            Based on FIR ratio, employment, and credit history
          </Text>
        </Surface>

        {/* Financial Summary */}
        <Card style={styles.detailCard} mode="outlined">
          <Card.Title title="Financial Summary" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <Text variant="labelSmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Monthly Income</Text>
                <Text variant="bodyLarge" style={styles.detailValue}>{formatCurrency(result.monthlyIncome)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text variant="labelSmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Requested Amount</Text>
                <Text variant="bodyLarge" style={styles.detailValue}>{formatCurrency(result.loanAmount)}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Required Monthly Payment</Text>
              <Text variant="bodyLarge" style={[styles.detailValue, { fontWeight: 'bold' }]}>
                {formatCurrency(result.monthlyPayment)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium">Financing-to-Income Ratio (FIR)</Text>
              <Text variant="bodyLarge" style={[styles.detailValue, { color: result.firRatio > 40 ? theme.colors.error : theme.colors.primary }]}>
                {result.firRatio.toFixed(1)}%
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Recommended Product */}
        {product && (
          <Surface style={styles.productSurface} elevation={1}>
            <View style={styles.productHeader}>
              <Avatar.Icon size={40} icon="bank-outline" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{product.name}</Text>
                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>{product.nameUrdu}</Text>
              </View>
            </View>
            <Text variant="bodyMedium" style={styles.productDesc}>{product.description}</Text>
            <View style={styles.chipContainer}>
              {product.banks.map((bank) => (
                <Chip key={bank} style={styles.bankChip} textStyle={{ fontSize: 11 }}>{bank}</Chip>
              ))}
            </View>
          </Surface>
        )}

        {/* AI Advisor Card */}
        {result.aiExplanation && (
          <Card style={styles.aiCard} mode="contained">
            <Card.Content>
              <View style={styles.aiHeader}>
                <Avatar.Icon size={30} icon="robot-outline" style={{ backgroundColor: '#EDE7F6' }} color="#673AB7" />
                <Text variant="titleSmall" style={styles.aiTitle}>AI Advisor Feedback</Text>
              </View>
              <Text variant="bodyMedium" style={styles.aiText}>
                {result.aiExplanation}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.mainButton}
            contentStyle={{ height: 50 }}
            onPress={() => router.push('/(main)')}
            icon="home-outline"
          >
            Back to Dashboard
          </Button>
          <Button
            mode="outlined"
            style={styles.secondaryButton}
            contentStyle={{ height: 45 }}
            onPress={() => router.push('/(main)/eligibility')}
            icon="refresh"
          >
            Start New Check
          </Button>
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
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerIconContainer: { marginBottom: 15 },
  resultTitle: { color: '#FFFFFF', fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.8)', marginTop: 5 },
  content: {
    paddingHorizontal: 20,
    marginTop: -30,
    paddingBottom: 40,
  },
  scoreCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  scoreText: { fontWeight: '900', marginTop: 4 },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  scoreDesc: {
    marginTop: 10,
    textAlign: 'center',
  },
  detailCard: {
    borderRadius: 20,
    marginBottom: 20,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardTitle: { fontWeight: 'bold' },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  detailItem: { flex: 1 },
  detailLabel: { marginBottom: 2 },
  detailValue: { fontWeight: '600' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: { marginVertical: 12 },
  productSurface: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productDesc: {
    lineHeight: 22,
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankChip: {
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#F5F5F5',
  },
  aiCard: {
    borderRadius: 20,
    marginBottom: 25,
    backgroundColor: '#F3E5F5',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTitle: {
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#4527A0',
  },
  aiText: {
    lineHeight: 20,
    color: '#4A148C',
  },
  buttonContainer: {
    marginTop: 10,
  },
  mainButton: {
    borderRadius: 14,
    marginBottom: 12,
  },
  secondaryButton: {
    borderRadius: 14,
  },
});
