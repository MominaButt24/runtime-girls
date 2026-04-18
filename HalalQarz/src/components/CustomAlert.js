

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Text, Button, useTheme, Avatar } from 'react-native-paper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomAlert = ({ visible, title, message, type, onClose, onConfirm }) => {
  const theme = useTheme();

  if (!visible) return null;

  const alertConfig = {
    success: {
      icon: 'check-circle',
      color: theme.custom.success,
      buttonText: 'Great!',
    },
    error: {
      icon: 'close-circle',
      color: theme.custom.error,
      buttonText: 'Try Again',
    },
    confirm: {
      icon: 'help-circle',
      color: theme.custom.primary,
      buttonText: 'Confirm',
    },
    info: {
      icon: 'information',
      color: theme.custom.accent,
      buttonText: 'Got it',
    },
    warning: {
      icon: 'alert-circle',
      color: '#FFC107',
      buttonText: 'OK',
    }
  };

  const config = alertConfig[type] || alertConfig.info;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: theme.custom.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Avatar.Icon 
                size={60} 
                icon={config.icon} 
                style={{ backgroundColor: 'transparent' }} 
                color={config.color} 
            />
          </View>
          
          <Text variant="headlineSmall" style={[styles.title, { color: theme.custom.text }]}>{title}</Text>
          {message ? (
            <Text variant="bodyMedium" style={[styles.message, { color: theme.custom.textSecondary }]}>
                {message}
            </Text>
          ) : null}

          <View style={styles.buttonWrapper}>
            {type === 'confirm' ? (
              <View style={styles.rowButtons}>
                <Button 
                  mode="outlined" 
                  onPress={onClose} 
                  style={styles.flexButton}
                  textColor={theme.custom.textSecondary}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }} 
                  style={[styles.flexButton, { backgroundColor: config.color }]}
                >
                  {config.buttonText}
                </Button>
              </View>
            ) : (
              <Button 
                mode="contained" 
                onPress={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }} 
                style={[styles.fullButton, { backgroundColor: config.color }]}
              >
                {config.buttonText}
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  buttonWrapper: {
    width: '100%',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  flexButton: {
    flex: 1,
    borderRadius: 12,
  },
  fullButton: {
    width: '100%',
    borderRadius: 12,
  },
});

export default CustomAlert;
