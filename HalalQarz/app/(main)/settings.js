import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, List, Switch, useTheme, Divider } from 'react-native-paper';

export default function SettingsScreen() {
  const theme = useTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.primary }]}>
        Settings
      </Text>

      <List.Section>
        <List.Subheader>App Preferences</List.Subheader>
        <List.Item
          title="Notifications"
          right={() => (
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled} 
              color={theme.custom.primary}
            />
          )}
        />
        <Divider />
        <List.Item
          title="Version"
          description="1.0.0"
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { marginTop: 40, marginBottom: 20, fontWeight: 'bold' },
});
