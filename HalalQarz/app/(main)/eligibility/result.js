import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, Chip } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import ProgressBar from '../../../src/components/ProgressBar';
import { formatCurrency } from '../../../src/utils/formatters';

const getResultMessage = (status) => {
  switch (status) {
    case 'eligible':
      return '✓ You\'re Eligible!';
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
  const params = useLocalSearchParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (params?.result) {
        const parsedResult = JSON.parse(params.result);
        setResult(parsedResult);
      }
    } catch (error) {
      console.error('Error parsing result:', error);
    }
    setLoading(false);
  }, [params]);

  if (loading || !result) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  const getResultColor = (result) => {
    switch (result) {
      case 'eligible':
        return '#4CAF50';
      case 'conditional':
        return '#FF9800';
      case 'notEligible':
        return '#F44336';
      default:
        return theme.custom.primary;
    }
  };

  const resultColor = getResultColor(result.result);

  const product = result.productDetails ? JSON.parse(result.productDetails) : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      {/* Result Header */}
      <View style={[styles.header, { backgroundColor: resultColor + '20', borderTopColor: resultColor, borderTopWidth: 4 }]}>
        <Text variant="headlineMedium" style={[styles.resultTitle, { color: resultColor }]}>
          {getResultMessage(result.result)}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary, marginTop: 10 }}>
          for Islamic Financing
        </Text>
      </View>

      {/* Score Card */}
      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
        <Card.Content>
          <View style={styles.scoreRow}>
            <Text variant="bodyMedium" style={{ color: theme.custom.text, fontWeight: '500' }}>
              Eligibility Score
            </Text>
            <Text variant="headlineLarge" style={[styles.scoreText, { color: resultColor }]}>
              {result.score}/100
            </Text>
          </View>
          <ProgressBar value={result.score} max={100} color={resultColor} height={12} />
        </Card.Content>
      </Card>

      {/* Financial Details */}
      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
        <Card.Title title="Financial Summary" titleStyle={{ color: theme.custom.text, fontWeight: 'bold' }} />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Monthly Income
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.custom.text, fontWeight: 'bold' }}>
              {formatCurrency(result.monthlyIncome)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Existing Monthly Obligations
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.custom.text }}>
              {formatCurrency(result.existingObligations)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Loan Amount Requested
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.custom.text }}>
              {formatCurrency(result.loanAmount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Required Monthly Payment
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.custom.text, fontWeight: 'bold' }}>
              {formatCurrency(result.monthlyPayment)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
              Financing-to-Income Ratio
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.custom.text }}>
              {result.firRatio.toFixed(2)}%
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Recommended Product */}
      {product && (
        <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
          <Card.Title 
            title={`Recommended: ${product.name}`}
            subtitle={product.nameUrdu}
            titleStyle={{ color: theme.custom.text, fontWeight: 'bold' }}
            subtitleStyle={{ color: theme.custom.textSecondary }}
          />
          <Card.Content>
            <Text variant="bodyMedium" style={{ color: theme.custom.text, marginBottom: 10 }}>
              {product.description}
            </Text>
            <Text variant="labelMedium" style={{ color: theme.custom.text, fontWeight: 'bold', marginTop: 10 }}>
              Available at:
            </Text>
            {product.banks.map((bank) => (
              <Chip
                key={bank}
                label={bank}
                style={styles.bankChip}
                textStyle={{ fontSize: 12 }}
              />
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Flags/Issues */}
      {result.flags && result.flags.length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
          <Card.Title 
            title="Important Notes"
            titleStyle={{ color: theme.custom.text, fontWeight: 'bold' }}
          />
          <Card.Content>
            {result.flags.map((flag) => (
              <View key={flag} style={styles.flagRow}>
                <Text variant="bodySmall" style={{ color: '#FF9800' }}>
                  ⚠ {flag}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* AI Explanation */}
      {result.aiExplanation && (
        <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
          <Card.Title 
            title="AI Advisor"
            titleStyle={{ color: theme.custom.text, fontWeight: 'bold' }}
          />
          <Card.Content>
            <Text variant="bodySmall" style={{ color: theme.custom.text, lineHeight: 20 }}>
              {result.aiExplanation}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={[styles.button, { backgroundColor: theme.custom.primary }]}
          onPress={() => router.push('/(main)')}
        >
          Back to Home
        </Button>
        <Button
          mode="outlined"
          style={styles.button}
          textColor={theme.custom.primary}
          onPress={() => router.push('/(main)/eligibility')}
        >
          New Check
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, margin: 15, borderRadius: 12, marginBottom: 20 },
  resultTitle: { fontWeight: 'bold' },
  card: { margin: 15, borderRadius: 12, elevation: 2 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreText: { fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  flagRow: { marginBottom: 10 },
  bankChip: { marginRight: 8, marginBottom: 8 },
  buttonContainer: { paddingHorizontal: 15, paddingBottom: 40 },
  button: { marginBottom: 10 },
});
