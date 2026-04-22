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
  const [lastSyncId, setLastSyncId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return { ...prev, [field]: '' };
    });
  };

  useEffect(() => {
    if (params?.syncId && params.syncId !== lastSyncId) {
      setLastSyncId(params.syncId);
      
      if (params.clearForm === 'true') {
        // Explicitly entered via "Enter Manually" - user wants a clean slate
        setMonthlyIncome('');
        setExistingObligations('');
        setLoanAmount('');
        setPurpose('');
        setAge('');
      } else {
        // Explicitly entered via "Use Expense Tracker" - force apply overrides
        if (params.monthlyIncome !== undefined) setMonthlyIncome(String(params.monthlyIncome));
        if (params.existingObligations !== undefined) setExistingObligations(String(params.existingObligations));
      }
    }
  }, [params?.syncId]);

  const getFieldValidationErrors = (values) => {
    const nextErrors = {};

    if (!values.monthlyIncome || Number.isNaN(values.incomeNum)) {
      nextErrors.monthlyIncome = 'Monthly income is required.';
    } else if (values.incomeNum < 1000) {
      nextErrors.monthlyIncome = 'Monthly income must be at least 1000.';
    }

    if (!values.employmentType) {
      nextErrors.employmentType = 'Employment type is required.';
    }

    if (!values.existingObligations || Number.isNaN(values.obligationsNum)) {
      nextErrors.existingObligations = 'Existing obligations are required.';
    } else if (values.obligationsNum < 0) {
      nextErrors.existingObligations = 'Existing obligations cannot be negative.';
    } else if (
      !Number.isNaN(values.incomeNum) &&
      values.monthlyIncome &&
      values.obligationsNum > values.incomeNum
    ) {
      nextErrors.existingObligations = 'Existing obligations cannot exceed monthly income.';
    }

    if (!values.loanAmount || Number.isNaN(values.loanNum)) {
      nextErrors.loanAmount = 'Loan amount is required.';
    } else if (values.loanNum < 1000) {
      nextErrors.loanAmount = 'Loan amount must be at least 1000.';
    }

    if (!values.repaymentPeriod || !REPAYMENT_OPTIONS.includes(values.repaymentPeriod)) {
      nextErrors.repaymentPeriod = 'Please select a valid repayment period.';
    }

    if (!values.purpose) {
      nextErrors.purpose = 'Purpose is required.';
    }

    if (!values.creditHistory) {
      nextErrors.creditHistory = 'Credit history is required.';
    }

    if (!values.age || Number.isNaN(values.ageNum)) {
      nextErrors.age = 'Age is required.';
    } else if (values.ageNum < 18 || values.ageNum > 70) {
      nextErrors.age = 'Age must be between 18 and 70.';
    }

    return nextErrors;
  };



  const validateForm = () => {
    const incomeNum = Number(monthlyIncome);
    const obligationsNum = Number(existingObligations);
    const loanNum = Number(loanAmount);
    const ageNum = Number(age);

    const nextErrors = getFieldValidationErrors({
      monthlyIncome,
      incomeNum,
      employmentType,
      existingObligations,
      obligationsNum,
      loanAmount,
      loanNum,
      repaymentPeriod,
      purpose,
      creditHistory,
      age,
      ageNum,
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Please fix the highlighted fields before submitting.',
        type: 'warning',
      });
      return false;
    }



    setErrors({});
    return true;
  };

  const isRequiredFieldMissing =
    !monthlyIncome ||
    !employmentType ||
    !existingObligations ||
    !loanAmount ||
    !repaymentPeriod ||
    !purpose ||
    !creditHistory ||
    !age;

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
        productDetails: JSON.stringify(product),
        aiExplanation,
      };

      await saveEligibilityCheck(checkData);

      setLoading(false);

      router.push({
        pathname: '/(main)/eligibility/result',
        params: {
          result: JSON.stringify(checkData),
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
          <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Basic Info</Text>
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  label="Monthly Income"
                  mode="outlined"
                  keyboardType="number-pad"
                  value={monthlyIncome}
                  onChangeText={(value) => {
                    setMonthlyIncome(value);
                    clearFieldError('monthlyIncome');
                  }}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 12 }}
                />
                {errors.monthlyIncome ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.monthlyIncome}</Text>
                ) : null}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <TextInput
                  label="Age"
                  mode="outlined"
                  keyboardType="number-pad"
                  value={age}
                  onChangeText={(value) => {
                    setAge(value);
                    clearFieldError('age');
                  }}
                  style={styles.input}
                  outlineStyle={{ borderRadius: 12 }}
                />
                {errors.age ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.age}</Text>
                ) : null}
              </View>
            </View>

            <Text variant="labelMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurfaceVariant }]}>Employment Type</Text>
            <Dropdown
              options={EMPLOYMENT_OPTIONS.map((opt) => opt.label)}
              selectedValue={employmentType}
              onValueChange={(value) => {
                const selected = EMPLOYMENT_OPTIONS.find((opt) => opt.label === value);
                setEmploymentType(selected?.value || '');
                clearFieldError('employmentType');
              }}
              placeholder="Select type"
              theme={theme.colors}
            />
            {errors.employmentType ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.employmentType}</Text>
            ) : null}

            <Divider style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

            <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Financing Details</Text>

            <TextInput
              label="Existing Monthly Obligations"
              mode="outlined"
              keyboardType="number-pad"
              value={existingObligations}
              onChangeText={(value) => {
                setExistingObligations(value);
                clearFieldError('existingObligations');
              }}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />
            {errors.existingObligations ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.existingObligations}</Text>
            ) : null}

            <TextInput
              label="Loan Amount Needed"
              mode="outlined"
              keyboardType="number-pad"
              value={loanAmount}
              onChangeText={(value) => {
                setLoanAmount(value);
                clearFieldError('loanAmount');
              }}
              style={styles.input}
              outlineStyle={{ borderRadius: 12 }}
            />
            {errors.loanAmount ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.loanAmount}</Text>
            ) : null}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text variant="labelSmall" style={[styles.dropdownLabel, { color: theme.colors.onSurfaceVariant }]}>Repayment (Months)</Text>
                <Dropdown
                  options={REPAYMENT_OPTIONS}
                  selectedValue={repaymentPeriod}
                  onValueChange={(value) => {
                    setRepaymentPeriod(value);
                    clearFieldError('repaymentPeriod');
                  }}
                  placeholder="Period"
                  theme={theme.colors}
                />
                {errors.repaymentPeriod ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.repaymentPeriod}</Text>
                ) : null}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text variant="labelSmall" style={[styles.dropdownLabel, { color: theme.colors.onSurfaceVariant }]}>Credit History</Text>
                <Dropdown
                  options={CREDIT_HISTORY_OPTIONS}
                  selectedValue={creditHistory}
                  onValueChange={(value) => {
                    setCreditHistory(value);
                    clearFieldError('creditHistory');
                  }}
                  placeholder="History"
                  theme={theme.colors}
                />
                {errors.creditHistory ? (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.creditHistory}</Text>
                ) : null}
              </View>
            </View>

            <Text variant="labelMedium" style={[styles.dropdownLabel, { color: theme.colors.onSurfaceVariant }]}>Purpose of Financing</Text>
            <Dropdown
              options={PURPOSE_OPTIONS.map((opt) => opt.label)}
              selectedValue={purpose}
              onValueChange={(value) => {
                const selected = PURPOSE_OPTIONS.find((opt) => opt.label === value);
                setPurpose(selected?.value || '');
                clearFieldError('purpose');
              }}
              placeholder="Select purpose"
              theme={theme.colors}
            />
            {errors.purpose ? (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.purpose}</Text>
            ) : null}

            <View style={styles.guarantorRow}>
              <View>
                <Text variant="bodyLarge" style={{ fontWeight: '600', color: theme.colors.onSurface }}>Has Guarantor?</Text>
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
              disabled={loading || isRequiredFieldMissing}
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
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  errorText: {
    marginTop: -8,
    marginBottom: 8,
    fontSize: 12,
  },
  dropdownLabel: {
    marginBottom: 6,
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
