import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { getEligibilityHistory } from '../../../src/api/firestore';
import EligibilityCard from '../../../src/components/EligibilityCard';

export default function EligibilityHistoryScreen() {
  const theme = useTheme();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const result = await getEligibilityHistory();
          setChecks(result.data || []);
        } catch (error) {
          console.error('Error fetching eligibility history:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }, [])
  );

  const openCheckDetail = (check) => {
    router.push({
      pathname: '/(main)/eligibility/result',
      params: { result: JSON.stringify(check) },
    });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (checks.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          No eligibility checks yet.{'\n'}Run your first check to get started!
        </Text>
        <Button
          mode="contained"
          style={{ marginTop: 24, borderRadius: 12 }}
          onPress={() => router.replace('/(main)/eligibility')}
        >
          Check Eligibility
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={checks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EligibilityCard
            result={item.result}
            recommendedProduct={item.recommendedProduct}
            date={item.createdAt}
            purpose={item.purpose}
            onPress={() => openCheckDetail(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
});
