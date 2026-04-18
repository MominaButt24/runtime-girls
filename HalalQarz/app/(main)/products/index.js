import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, Surface, Avatar, Divider } from 'react-native-paper';
import ProductCard from '../../../src/components/ProductCard';
import { ISLAMIC_PRODUCTS } from '../../../src/utils/islamicProducts';

export default function ProductsScreen() {
  const theme = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Islamic Financing
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Explore Shariah-compliant financial products
        </Text>
      </Surface>

      <View style={styles.content}>
        <Card style={styles.eduCard} mode="elevated">
          <Card.Content>
            <View style={styles.eduHeader}>
              <Avatar.Icon size={40} icon="school-outline" style={{ backgroundColor: theme.colors.primaryContainer }} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.eduTitle}>Understanding the Basics</Text>
            </View>
            
            <Text variant="bodyMedium" style={styles.eduDescription}>
              Islamic financing follows Shariah principles and excludes interest (Riba). Instead of charging interest, Islamic banks use:
            </Text>

            <View style={styles.bulletContainer}>
              {[
                { icon: 'handshake-outline', text: 'Profit-sharing (Mudarabah)' },
                { icon: 'home-city-outline', text: 'Co-ownership (Musharaka)' },
                { icon: 'key-chain-variant', text: 'Leasing services (Ijara)' },
                { icon: 'heart-outline', text: 'Benevolent loans (Qard-ul-Hasan)' }
              ].map((item, index) => (
                <View key={index} style={styles.bulletItem}>
                  <Avatar.Icon size={24} icon={item.icon} style={{ backgroundColor: 'transparent' }} color={theme.colors.primary} />
                  <Text variant="bodySmall" style={styles.bulletText}>{item.text}</Text>
                </View>
              ))}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Conventional</Text>
                <Text variant="bodySmall" style={styles.comparisonDesc}>Interest-based lending</Text>
              </View>
              <View style={[styles.comparisonItem, { alignItems: 'flex-end' }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Islamic</Text>
                <Text variant="bodySmall" style={[styles.comparisonDesc, { textAlign: 'right', color: theme.colors.primary }]}>Profit/Loss sharing & Assets</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Our Featured Products
            </Text>
            <Surface style={styles.countBadge} elevation={0}>
              <Text variant="labelSmall" style={{ fontWeight: 'bold' }}>5</Text>
            </Surface>
          </View>
          {ISLAMIC_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>
      </View>
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
    paddingBottom: 40,
  },
  eduCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 25,
  },
  eduHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  eduTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  eduDescription: {
    lineHeight: 22,
    color: '#424242',
    marginBottom: 15,
  },
  bulletContainer: {
    marginVertical: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletText: {
    marginLeft: 8,
    color: '#616161',
  },
  divider: {
    marginVertical: 15,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    flex: 1,
  },
  comparisonDesc: {
    marginTop: 2,
    fontWeight: '500',
  },
  productsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontWeight: 'bold' },
  countBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
});
