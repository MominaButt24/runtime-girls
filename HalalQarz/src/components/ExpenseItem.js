import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../utils/formatters';

const CATEGORY_ICONS = {
  rent: '🏠',
  food: '🍔',
  transport: '🚗',
  education: '📚',
  zakat: '🕌',
  medical: '💊',
  emi: '💳',
  other: '📦',
};

export default function ExpenseItem({ item, category, amount, description, onDelete }) {
  const theme = useTheme();
  const expenseCategory = category || item?.category || 'other';
  const expenseAmount = typeof amount === 'number' ? amount : Number(item?.amount || 0);
  const expenseDescription = description || item?.description || '';
  const expenseDate = item?.date || item?.createdAt;
  const expenseId = item?.id;

  const icon = CATEGORY_ICONS[expenseCategory?.toLowerCase()] || '📦';

  return (
    <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
      <Card.Content>
        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={styles.icon}>{icon}</Text>
            <View style={styles.details}>
              <Text style={[styles.category, { color: theme.custom.text }]}>
                {expenseCategory}
              </Text>
              {expenseDescription ? (
                <Text style={[styles.description, { color: theme.custom.textSecondary }]}>
                  {expenseDescription}
                </Text>
              ) : null}
              {expenseDate ? (
                <Text style={[styles.date, { color: theme.custom.textSecondary }]}> 
                  {formatDate(expenseDate)}
                </Text>
              ) : null}
            </View>
          </View>
          <View style={styles.amountSection}>
            <Text style={[styles.amount, { color: theme.custom.primary }]}>
              {formatCurrency(expenseAmount)}
            </Text>
            {onDelete && (
              <Button
                icon="delete"
                mode="text"
                compact
                textColor="#F44336"
                onPress={() => onDelete(expenseId)}
              />
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

ExpenseItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    category: PropTypes.string,
    amount: PropTypes.number,
    description: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string]),
    createdAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string]),
  }),
  category: PropTypes.string,
  amount: PropTypes.number,
  description: PropTypes.string,
  onDelete: PropTypes.func,
};

ExpenseItem.defaultProps = {
  item: null,
  category: '',
  amount: 0,
  description: '',
  onDelete: null,
};

const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  content: { flexDirection: 'row', flex: 1, alignItems: 'flex-start' },
  icon: { fontSize: 24, marginRight: 12 },
  details: { flex: 1 },
  category: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 12, marginBottom: 4 },
  date: { fontSize: 11 },
  amountSection: { alignItems: 'flex-end' },
  amount: { fontWeight: 'bold', fontSize: 14 },
});
