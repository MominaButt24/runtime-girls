import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';

const getFIRColor = (value) => {
  if (value < 40) return '#2E7D32';
  if (value <= 50) return '#F57C00';
  return '#C62828';
};

export default function ProgressBar({ value, label, max = 100, color, height = 8 }) {
  const theme = useTheme();
  const percentage = Math.min((value / max) * 100, 100);
  const computedColor = color || getFIRColor(value);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.custom.text }]}>{label}</Text>
          <Text style={[styles.percent, { color: computedColor }]}>{Math.round(percentage)}%</Text>
        </View>
      ) : null}
      <View style={[styles.container, { height }]}> 
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: computedColor,
              height,
            },
          ]}
        />
      </View>
      {label ? null : (
        <Text style={[styles.percentStandalone, { color: computedColor }]}>{Math.round(percentage)}%</Text>
      )}
    </View>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string,
  max: PropTypes.number,
  color: PropTypes.string,
  height: PropTypes.number,
};

ProgressBar.defaultProps = {
  label: '',
  max: 100,
  color: undefined,
  height: 8,
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  percent: {
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  percentStandalone: {
    marginTop: 6,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
});
