import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import ProductCard from '../../../src/components/ProductCard';
import { ISLAMIC_PRODUCTS } from '../../../src/utils/islamicProducts';

export default function ProductsScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={[styles.header, { backgroundColor: theme.custom.primaryContainer }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.primary }]}>
          Islamic Financing Products
        </Text>
        <Text variant="bodySmall" style={{ color: theme.custom.onPrimaryContainer }}>
          Explore Halal financing options
        </Text>
      </View>

      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: theme.custom.text }]}>
            📚 Understanding Islamic Finance
          </Text>
          <Text variant="bodySmall" style={[styles.educationalText, { color: theme.custom.text }]}>
            Islamic financing follows Shariah principles and excludes interest (Riba). Instead of charging interest, Islamic banks:
          </Text>
          <Text variant="bodySmall" style={[styles.bulletPoint, { color: theme.custom.text }]}>
            • Profit-share with customers
          </Text>
          <Text variant="bodySmall" style={[styles.bulletPoint, { color: theme.custom.text }]}>
            • Co-own assets (Musharaka)
          </Text>
          <Text variant="bodySmall" style={[styles.bulletPoint, { color: theme.custom.text }]}>
            • Provide leasing services (Ijara)
          </Text>
          <Text variant="bodySmall" style={[styles.bulletPoint, { color: theme.custom.text }]}>
            • Offer benevolent loans (Qard-ul-Hasan)
          </Text>

          <Text variant="bodySmall" style={[styles.comparisonText, { color: theme.custom.text, marginTop: 12 }]}>
            <Text style={{ fontWeight: 'bold' }}>Conventional Finance:</Text> Bank charges interest (Riba) on loans.
          </Text>
          <Text variant="bodySmall" style={[styles.comparisonText, { color: theme.custom.primary }]}>
            <Text style={{ fontWeight: 'bold' }}>Islamic Finance:</Text> Bank and customer share profits or own assets together.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.productsSection}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.custom.text }]}>
          Our 5 Islamic Products
        </Text>
        {ISLAMIC_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, margin: 15, borderRadius: 15, marginBottom: 10 },
  title: { fontWeight: 'bold', marginBottom: 5 },
  card: { margin: 15, borderRadius: 12, elevation: 2, marginBottom: 20 },
  cardTitle: { fontWeight: 'bold', marginBottom: 10 },
  educationalText: { marginBottom: 10, lineHeight: 18 },
  bulletPoint: { marginLeft: 8, marginBottom: 6, lineHeight: 16 },
  comparisonText: { lineHeight: 18 },
  productsSection: { padding: 15, paddingTop: 0 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 15 },
});
