import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';

const PRODUCT_ICONS = {
  murabaha: '🏦',
  'diminishing-musharaka': '🏠',
  mudaraba: '💼',
  ijara: '🚗',
  'qard-ul-hasan': '🤝',
};

export default function ProductCard({ product }) {
  const theme = useTheme();

  if (!product) return null;

  const icon = product.icon || PRODUCT_ICONS[product.id] || '💳';

  return (
    <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.titleSection}>
            <Text style={[styles.name, { color: theme.custom.text }]}>{product.name}</Text>
            <Text style={[styles.urdu, { color: theme.custom.textSecondary }]}>{product.nameUrdu}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: theme.custom.text, marginTop: 12 }]}>
          {product.description}
        </Text>

        {product.purpose ? (
          <Text style={[styles.purpose, { color: theme.custom.textSecondary }]}>
            Purpose: {product.purpose}
          </Text>
        ) : null}

        <Text style={[styles.bankLabel, { color: theme.custom.primary, marginTop: 12 }]}>
          Available at:
        </Text>

        <View style={styles.banksContainer}>
          {product.banks.map((bank) => (
            <Chip key={bank} style={styles.bankChip} textStyle={{ fontSize: 12 }}>
              {bank}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameUrdu: PropTypes.string.isRequired,
    icon: PropTypes.string,
    description: PropTypes.string.isRequired,
    banks: PropTypes.arrayOf(PropTypes.string).isRequired,
    purpose: PropTypes.string,
  }).isRequired,
};

const styles = StyleSheet.create({
  card: { marginBottom: 15, borderRadius: 12, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 32, marginRight: 12 },
  titleSection: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  urdu: { fontSize: 12, marginTop: 2 },
  description: { fontSize: 13, lineHeight: 18 },
  purpose: { marginTop: 8, fontSize: 12 },
  bankLabel: { fontWeight: 'bold', fontSize: 12 },
  banksContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  bankChip: { marginRight: 8, marginBottom: 8 },
});
