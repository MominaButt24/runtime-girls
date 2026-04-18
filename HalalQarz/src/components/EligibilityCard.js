import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';
import ResultBadge from './ResultBadge';
import { formatDate } from '../utils/formatters';

export default function EligibilityCard({ result, purpose, recommendedProduct, date, onPress }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}> 
        <Card.Content style={styles.content}>
          <View style={styles.left}>
            <ResultBadge result={result} compact />
          </View>

          <View style={styles.middle}>
            <Text numberOfLines={1} style={[styles.purpose, { color: theme.custom.text }]}> 
              {purpose || 'Eligibility Check'}
            </Text>
            <Text numberOfLines={1} style={[styles.product, { color: theme.custom.textSecondary }]}> 
              {recommendedProduct || 'Islamic Financing'}
            </Text>
          </View>

          <View style={styles.right}>
            <Text style={[styles.date, { color: theme.custom.textSecondary }]}>
              {formatDate(date)}
            </Text>
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
  card: { marginBottom: 10, borderRadius: 10, elevation: 1 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    marginRight: 10,
  },
  middle: {
    flex: 1,
    marginRight: 8,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 78,
  },
  purpose: {
    fontWeight: '700',
    fontSize: 13,
  },
  product: {
    marginTop: 2,
    fontSize: 12,
  },
  date: {
    fontSize: 11,
  },
});
