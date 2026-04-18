import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput, Switch, useTheme } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import Dropdown from '../../../src/components/Dropdown';
import CustomAlert from '../../../src/components/CustomAlert';
import { checkEligibility, calculateMonthlyPayment } from '../../../src/utils/eligibilityEngine';
import { matchProduct } from '../../../src/utils/islamicProducts';
import { getAIExplanation } from '../../../src/api/gemini';
import { saveEligibilityCheck } from '../../../src/api/firestore';
import { auth } from '../../../src/api/firebase';

const EMPLOYMENT_OPTIONS = [
  { label: 'Salaried', value: 'salaried' },
  { label: 'Self-Employed', value: 'self-employed' },
  { label: 'Business Owner', value: 'business' },
  { label: 'Student', value: 'student' },
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Unemployed', value: 'unemployed' },
];

const REPAYMENT_OPTIONS = ['12', '24', '36'];

const PURPOSE_OPTIONS = [
  { label: 'Home', value: 'home' },
  { label: 'Business', value: 'business' },
  { label: 'Vehicle', value: 'vehicle' },
  { label: 'Education', value: 'education' },
  { label: 'Medical', value: 'medical' },
  { label: 'Emergency', value: 'emergency' },
  { label: 'Other', value: 'other' },
];

const CREDIT_HISTORY_OPTIONS = ['Good', 'Average', 'Poor', 'None'];

export default function EligibilityManualScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const prefillsAppliedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  // Form fields
  const [monthlyIncome, setMonthlyIncome] = useState(params?.monthlyIncome || '');
  const [employmentType, setEmploymentType] = useState('');
  const [existingObligations, setExistingObligations] = useState(params?.existingObligations || '');
  const [loanAmount, setLoanAmount] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('12');
  const [purpose, setPurpose] = useState('');
  const [creditHistory, setCreditHistory] = useState('');
  const [age, setAge] = useState('');
  const [hasGuarantor, setHasGuarantor] = useState(false);

  useEffect(() => {
    if (prefillsAppliedRef.current) {
      return;
    }

    const hasMonthlyIncome = params?.monthlyIncome !== undefined;
    const hasExistingObligations = params?.existingObligations !== undefined;

    if (!hasMonthlyIncome && !hasExistingObligations) {
      return;
    }

    if (hasMonthlyIncome) {
      setMonthlyIncome(String(params.monthlyIncome));
    }

    if (hasExistingObligations) {
      setExistingObligations(String(params.existingObligations));
    }

    prefillsAppliedRef.current = true;
  }, [params?.monthlyIncome, params?.existingObligations]);

  const validateForm = () => {
    if (!monthlyIncome || Number.isNaN(Number(monthlyIncome)) || Number(monthlyIncome) <= 0) {
      setAlert({
        visible: true,
        title: 'Invalid Income',
        message: 'Please enter a valid monthly income',
        type: 'warning',
      });
      return false;
    }

    if (!employmentType) {
      setAlert({
        visible: true,
        title: 'Missing Field',
        message: 'Please select employment type',
        type: 'warning',
      });
      return false;
    }

    if (!existingObligations || Number.isNaN(Number(existingObligations)) || Number(existingObligations) < 0) {
      setAlert({
        visible: true,
        title: 'Invalid Obligations',
        message: 'Please enter valid existing obligations',
        type: 'warning',
      });
      return false;
    }

    if (!loanAmount || Number.isNaN(Number(loanAmount)) || Number(loanAmount) <= 0) {
      setAlert({
        visible: true,
        title: 'Invalid Loan Amount',
        message: 'Please enter a valid loan amount',
        type: 'warning',
      });
      return false;
    }

    if (!purpose) {
      setAlert({
        visible: true,
        title: 'Missing Field',
        message: 'Please select financing purpose',
        type: 'warning',
      });
      return false;
    }

    if (!creditHistory) {
      setAlert({
        visible: true,
        title: 'Missing Field',
        message: 'Please select credit history',
        type: 'warning',
      });
      return false;
    }

    if (!age || Number.isNaN(Number(age)) || Number(age) < 18 || Number(age) > 120) {
      setAlert({
        visible: true,
        title: 'Invalid Age',
        message: 'Please enter a valid age between 18 and 120',
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const incomeNum = Number(monthlyIncome);
      const obligationsNum = Number(existingObligations);
      const loanNum = Number(loanAmount);
      const periodNum = Number(repaymentPeriod);
      const ageNum = Number(age);

      // Calculate monthly payment
      const monthlyPayment = calculateMonthlyPayment(loanNum, periodNum);

      // Check eligibility
      const eligibilityResult = checkEligibility({
        monthlyIncome: incomeNum,
        existingObligations: obligationsNum,
        loanAmount: loanNum,
        period: periodNum,
        employmentType: employmentType.toLowerCase(),
        creditHistory: creditHistory.toLowerCase(),
        age: ageNum,
        hasGuarantor,
      });

      // Find matching product
      const product = matchProduct(purpose);

      // Get AI explanation
      const aiExplanation = await getAIExplanation({
        result: eligibilityResult.result,
        firRatio: eligibilityResult.firRatio,
        monthlyPayment,
        monthlyIncome: incomeNum,
        loanAmount: loanNum,
        recommendedProduct: product.name,
        purpose,
      });

      // Save to Firestore
      const checkData = {
        monthlyIncome: incomeNum,
        employmentType,
        existingObligations: obligationsNum,
        loanAmount: loanNum,
        repaymentPeriod: periodNum,
        purpose,
        creditHistory,
        age: ageNum,
        hasGuarantor,
        result: eligibilityResult.result,
        firRatio: eligibilityResult.firRatio,
        monthlyPayment,
        score: eligibilityResult.score,
        flags: eligibilityResult.flags,
        recommendedProduct: product.name,
        aiExplanation,
      };

      await saveEligibilityCheck(checkData);

      setLoading(false);

      // Navigate to result with all data
      router.push({
        pathname: '/(main)/eligibility/result',
        params: {
          result: JSON.stringify({
            ...checkData,
            productDetails: JSON.stringify(product),
          }),
        },
      });
    } catch (error) {
      setLoading(false);
      setAlert({
        visible: true,
        title: 'Error',
        message: error.message || 'Failed to check eligibility',
        type: 'error',
      });
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Eligibility Form
        </Text>
        <Text variant="bodySmall" style={[styles.subtitle, { color: theme.custom.textSecondary }]}>
          Please provide your financial information
        </Text>

        {/* Monthly Income */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Monthly Income *
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

        {/* Employment Type */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Employment Type *
        </Text>
        <Dropdown
          options={EMPLOYMENT_OPTIONS.map((opt) => opt.label)}
          selectedValue={employmentType}
          onValueChange={(value) => {
            const selected = EMPLOYMENT_OPTIONS.find((opt) => opt.label === value);
            setEmploymentType(selected?.value || '');
          }}
          placeholder="Select employment type"
          theme={theme.colors}
        />

        {/* Existing Monthly Obligations */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Existing Monthly Obligations *
        </Text>
        <TextInput
          label="Amount (Rs.)"
          mode="outlined"
          keyboardType="number-pad"
          value={existingObligations}
          onChangeText={setExistingObligations}
          style={styles.input}
          theme={{ colors: { primary: theme.custom.primary } }}
        />

        {/* Loan Amount */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Loan Amount Needed *
        </Text>
        <TextInput
          label="Amount (Rs.)"
          mode="outlined"
          keyboardType="number-pad"
          value={loanAmount}
          onChangeText={setLoanAmount}
          style={styles.input}
          theme={{ colors: { primary: theme.custom.primary } }}
        />

        {/* Repayment Period */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Repayment Period (Months) *
        </Text>
        <Dropdown
          options={REPAYMENT_OPTIONS}
          selectedValue={repaymentPeriod}
          onValueChange={setRepaymentPeriod}
          placeholder="Select period"
          theme={theme.colors}
        />

        {/* Purpose */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Purpose of Financing *
        </Text>
        <Dropdown
          options={PURPOSE_OPTIONS.map((opt) => opt.label)}
          selectedValue={purpose}
          onValueChange={(value) => {
            const selected = PURPOSE_OPTIONS.find((opt) => opt.label === value);
            setPurpose(selected?.value || '');
          }}
          placeholder="Select purpose"
          theme={theme.colors}
        />

        {/* Credit History */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Credit History *
        </Text>
        <Dropdown
          options={CREDIT_HISTORY_OPTIONS}
          selectedValue={creditHistory}
          onValueChange={setCreditHistory}
          placeholder="Select credit history"
          theme={theme.colors}
        />

        {/* Age */}
        <Text variant="labelMedium" style={[styles.label, { color: theme.custom.text }]}>
          Age *
        </Text>
        <TextInput
          label="Years"
          mode="outlined"
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
          style={styles.input}
          theme={{ colors: { primary: theme.custom.primary } }}
        />

        {/* Has Guarantor */}
        <View style={styles.guarantorRow}>
          <Text variant="labelMedium" style={{ color: theme.custom.text }}>
            Has Guarantor?
          </Text>
          <Switch
            value={hasGuarantor}
            onValueChange={setHasGuarantor}
            color={theme.custom.primary}
          />
        </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          style={[styles.submitButton, { backgroundColor: theme.custom.primary }]}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Checking Eligibility...' : 'Check Eligibility'}
        </Button>
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
  content: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: 'bold', marginBottom: 5 },
  subtitle: { marginBottom: 20 },
  label: { marginTop: 15, marginBottom: 8, fontWeight: '500' },
  input: { marginBottom: 15 },
  guarantorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  submitButton: { marginTop: 20, paddingVertical: 8 },
});
