import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, Switch, useTheme, Surface, Divider } from 'react-native-paper';
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

      const monthlyPayment = calculateMonthlyPayment(loanNum, periodNum);

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

      const product = matchProduct(purpose);

      const aiExplanation = await getAIExplanation({
        result: eligibilityResult.result,
        firRatio: eligibilityResult.firRatio,
        monthlyPayment,
        monthlyIncome: incomeNum,
        loanAmount: loanNum,
        recommendedProduct: product.name,
        purpose,
      });

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Eligibility Form
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Please provide your financial information
          </Text>
        </Surface>

        <View style={styles.formContainer}>
          <Surface style={styles.formCard} elevation={2}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Basic Info</Text>
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  label="Monthly Income"
                  mode="outlined"
                  keyboardType="number-pad"
                  value={monthlyIncome}
                  onChangeText={setMonthlyIncome}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 12 }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <TextInput
                  label="Age"
                  mode="outlined"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={setAge}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 12 }}
                />
              </View>
            </View>

            <Text variant="labelMedium" style={styles.dropdownLabel}>Employment Type</Text>
            <Dropdown
              options={EMPLOYMENT_OPTIONS.map((opt) => opt.label)}
              selectedValue={employmentType}
              onValueChange={(value) => {
                const selected = EMPLOYMENT_OPTIONS.find((opt) => opt.label === value);
                setEmploymentType(selected?.value || '');
              }}
              placeholder="Select type"
              theme={theme.colors}
            />

            <Divider style={styles.divider} />

            <Text variant="titleMedium" style={styles.sectionTitle}>Financing Details</Text>

            <TextInput
              label="Existing Monthly Obligations"
              mode="outlined"
              keyboardType="number-pad"
              value={existingObligations}
              onChangeText={setExistingObligations}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />

            <TextInput
              label="Loan Amount Needed"
              mode="outlined"
              keyboardType="number-pad"
              value={loanAmount}
              onChangeText={setLoanAmount}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="labelSmall" style={styles.dropdownLabel}>Repayment (Months)</Text>
                <Dropdown
                  options={REPAYMENT_OPTIONS}
                  selectedValue={repaymentPeriod}
                  onValueChange={setRepaymentPeriod}
                  placeholder="Period"
                  theme={theme.colors}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text variant="labelSmall" style={styles.dropdownLabel}>Credit History</Text>
                <Dropdown
                  options={CREDIT_HISTORY_OPTIONS}
                  selectedValue={creditHistory}
                  onValueChange={setCreditHistory}
                  placeholder="History"
                  theme={theme.colors}
                />
              </View>
            </View>

            <Text variant="labelMedium" style={styles.dropdownLabel}>Purpose of Financing</Text>
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

            <View style={styles.guarantorRow}>
              <View>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>Has Guarantor?</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Does someone vouch for you?</Text>
              </View>
              <Switch
                value={hasGuarantor}
                onValueChange={setHasGuarantor}
                color={theme.colors.primary}
              />
            </View>

            <Button
              mode="contained"
              style={styles.submitButton}
              contentStyle={{ height: 52 }}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              icon="calculator"
            >
              Check Eligibility
            </Button>
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
    </KeyboardAvoidingView>
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
  formContainer: {
    paddingHorizontal: 16,
    marginTop: -30,
    paddingBottom: 40,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownLabel: {
    marginBottom: 6,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 20,
    height: 1,
  },
  guarantorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  submitButton: {
    borderRadius: 14,
    elevation: 2,
  },
});
