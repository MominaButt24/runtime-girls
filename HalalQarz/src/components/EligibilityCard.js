import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme, Icon } from 'react-native-paper';
import PropTypes from 'prop-types';
import ResultBadge from './ResultBadge';
import { formatDate } from '../utils/formatters';

export default function EligibilityCard({ result, purpose, recommendedProduct, date, onPress }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Content style={styles.content}>
          {/* Status Badge */}
          <View style={styles.left}>
            <ResultBadge result={result} compact />
          </View>

          {/* Purpose & Product */}
          <View style={styles.middle}>
            <Text
              numberOfLines={1}
              variant="titleSmall"
              style={[styles.purpose, { color: theme.colors.onSurface }]}
            >
              {purpose || 'Eligibility Check'}
            </Text>
            <Text
              numberOfLines={1}
              variant="bodySmall"
              style={[styles.product, { color: theme.colors.onSurfaceVariant }]}
            >
              {recommendedProduct || 'Islamic Financing'}
            </Text>
          </View>

          {/* Date + Chevron */}
          <View style={styles.right}>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(date)}
            </Text>
            <Icon source="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

EligibilityCard.propTypes = {
  result: PropTypes.oneOf(['eligible', 'conditional', 'notEligible']).isRequired,
  recommendedProduct: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string]),
  purpose: PropTypes.string,
  onPress: PropTypes.func,
};

EligibilityCard.defaultProps = {
  recommendedProduct: '',
  date: null,
  purpose: null,
  onPress: undefined,
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  left: {
    marginRight: 12,
  },
  middle: {
    flex: 1,
    marginRight: 8,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  purpose: {
    fontWeight: '700',
    fontSize: 14,
  },
  product: {
    marginTop: 3,
    fontSize: 12,
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
});
