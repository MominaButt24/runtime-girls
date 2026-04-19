import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, useTheme, Avatar } from 'react-native-paper';
import PropTypes from 'prop-types';



export default function ProductCard({ product }) {
  const theme = useTheme();

  if (!product) return null;

  const icon = product.icon || '🏦';

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={[styles.emojiContainer, { backgroundColor: theme.colors.primaryContainer }]}>
            <Text style={styles.emojiIcon}>{icon}</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]}>{product.name}</Text>
            <Text style={[styles.urdu, { color: theme.colors.onSurfaceVariant }]}>{product.nameUrdu}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: theme.colors.onSurface, marginTop: 12 }]}>
          {product.description}
        </Text>

        {product.explanation ? (
          <Text style={[styles.explanation, { color: theme.colors.onSurfaceVariant }]}>
            {product.explanation}
          </Text>
        ) : null}

        {product.purpose ? (
          <Text style={[styles.purpose, { color: theme.colors.onSurfaceVariant }]}>
            Purpose: {product.purpose}
          </Text>
        ) : null}

        <Text style={[styles.bankLabel, { color: theme.colors.primary, marginTop: 12 }]}>
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
    explanation: PropTypes.string,
    banks: PropTypes.arrayOf(PropTypes.string).isRequired,
    purpose: PropTypes.string,
  }).isRequired,
};

const styles = StyleSheet.create({
  card: { marginBottom: 15, borderRadius: 12, elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center' },
  emojiContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiIcon: { fontSize: 26 },
  titleSection: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16 },
  urdu: { fontSize: 12, marginTop: 2 },
  description: { fontSize: 13, lineHeight: 18 },
  explanation: { 
    fontSize: 13, 
    marginTop: 8, 
    marginBottom: 8, 
    lineHeight: 20 
  },
  purpose: { marginTop: 8, fontSize: 12 },
  bankLabel: { fontWeight: 'bold', fontSize: 12 },
  banksContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  bankChip: { marginRight: 8, marginBottom: 8 },
});
