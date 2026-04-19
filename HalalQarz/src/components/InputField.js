import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import PropTypes from 'prop-types';

export default function InputField({
	label,
	value,
	onChangeText,
	keyboardType,
	placeholder,
	secureTextEntry,
	editable,
}) {
	const theme = useTheme();

	return (
		<View style={styles.wrapper}>
			{label ? (
				<Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
			) : null}
			<TextInput
				mode="outlined"
				value={value}
				onChangeText={onChangeText}
				keyboardType={keyboardType}
				placeholder={placeholder}
				placeholderTextColor={theme.colors.onSurfaceVariant}
				secureTextEntry={secureTextEntry}
				editable={editable}
				style={[styles.input, { backgroundColor: theme.colors.surface }]}
				outlineStyle={{ borderColor: theme.colors.outline }}
				textColor={theme.colors.onSurface}
			/>
		</View>
	);
}

InputField.propTypes = {
	label: PropTypes.string,
	value: PropTypes.string,
	onChangeText: PropTypes.func,
	keyboardType: PropTypes.string,
	placeholder: PropTypes.string,
	secureTextEntry: PropTypes.bool,
	editable: PropTypes.bool,
};

InputField.defaultProps = {
	label: '',
	value: '',
	onChangeText: undefined,
	keyboardType: 'default',
	placeholder: '',
	secureTextEntry: false,
	editable: true,
};

const styles = StyleSheet.create({
	wrapper: {
		marginBottom: 12,
	},
	label: {
		marginBottom: 6,
		fontWeight: '600',
		fontSize: 13,
	},
	input: {
		height: 48,
	},
});
