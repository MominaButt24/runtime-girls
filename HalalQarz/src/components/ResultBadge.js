import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import PropTypes from 'prop-types';

export default function ResultBadge({ result, compact }) {
  const getConfig = (status) => {
    switch (status) {
      case 'eligible':
        return {
          icon: '✅',
          text: 'Likely Eligible',
          color: '#4CAF50',
          message: 'Alhamdulillah! You appear eligible.',
        };
      case 'conditional':
        return {
          icon: '⚠️',
          text: 'Conditionally Eligible',
          color: '#FF9800',
          message: 'You may qualify with adjustments.',
        };
      case 'notEligible':
        return {
          icon: '❌',
          text: 'Not Eligible Right Now',
          color: '#F44336',
          message: 'Not recommended to proceed right now.',
        };
      default:
        return {
          icon: '❓',
          text: 'Unknown',
          color: '#999',
          message: 'Please check your details.',
        };
    }
  };

  const config = getConfig(result);
  const containerStyle = compact ? styles.compactContainer : styles.container;
  const iconStyle = compact ? styles.compactIcon : styles.icon;
  const titleStyle = compact ? styles.compactTitle : styles.title;

  return (
    <View style={[containerStyle, { backgroundColor: config.color + '20', borderColor: config.color, borderWidth: 2 }]}> 
      <Text style={[iconStyle, { color: config.color }]}>{config.icon}</Text>
      <View style={compact ? styles.compactContent : styles.content}>
        <Text style={[titleStyle, { color: config.color }]}>{config.text}</Text>
        {compact ? null : <Text style={[styles.message, { color: config.color }]}>{config.message}</Text>}
      </View>
    </View>
  );
}

ResultBadge.propTypes = {
  result: PropTypes.oneOf(['eligible', 'conditional', 'notEligible']).isRequired,
  compact: PropTypes.bool,
};

ResultBadge.defaultProps = {
  compact: false,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 145,
  },
  compactContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 36, marginBottom: 8 },
  compactIcon: { fontSize: 18, marginRight: 6 },
  content: { flex: 1 },
  compactContent: { justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 4, textAlign: 'center' },
  compactTitle: { fontWeight: '700', fontSize: 11 },
  message: { fontSize: 13, textAlign: 'center' },
});
