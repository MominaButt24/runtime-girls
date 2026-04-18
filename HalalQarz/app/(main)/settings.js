import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List, Switch, useTheme, Divider, Surface } from 'react-native-paper';

export default function SettingsScreen() {
  const theme = useTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  const headerContentColor = theme.dark ? theme.colors.onPrimaryContainer : '#FFFFFF';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Text variant="headlineMedium" style={[styles.headerTitle, { color: headerContentColor }]}>
          Settings
        </Text>
        <Text variant="bodyMedium" style={[styles.headerSubtitle, { color: theme.dark ? theme.colors.onPrimaryContainer : 'rgba(255, 255, 255, 0.8)' }]}>
          Manage your app preferences
        </Text>
      </Surface>

      <View style={styles.content}>
        <List.Section style={styles.section}>
          <List.Subheader style={[styles.subheader, { color: theme.colors.onSurfaceVariant }]}>Preferences</List.Subheader>
          <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title="Push Notifications"
              description="Receive alerts about your eligibility"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="bell-ring-outline" color={theme.colors.primary} />}
              right={() => (
                <Switch 
                  value={isNotificationsEnabled} 
                  onValueChange={setIsNotificationsEnabled} 
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider horizontalInset />
            <List.Item
              title="Dark Mode"
              description="Follows System Setting"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
              right={() => (
                <View style={{ justifyContent: 'center', paddingRight: 8 }}>
                   <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                     {theme.dark ? 'ON' : 'OFF'}
                   </Text>
                </View>
              )}
            />
          </Surface>
        </List.Section>

        <List.Section style={styles.section}>
          <List.Subheader style={[styles.subheader, { color: theme.colors.onSurfaceVariant }]}>Support & Legal</List.Subheader>
          <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <List.Item
              title="Help Center"
              titleStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="help-circle-outline" color={theme.colors.primary} />}
              onPress={() => {}}
            />
            <Divider horizontalInset />
            <List.Item
              title="Terms of Service"
              titleStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="file-document-outline" color={theme.colors.primary} />}
              onPress={() => {}}
            />
            <Divider horizontalInset />
            <List.Item
              title="Privacy Policy"
              titleStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="shield-check-outline" color={theme.colors.primary} />}
              onPress={() => {}}
            />
          </Surface>
        </List.Section>

        <View style={styles.footer}>
          <Text variant="labelLarge" style={{ color: theme.colors.outline }}>
            HalalQarz v1.0.0
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
            Shariah Compliant Financial Tool
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  headerTitle: { fontWeight: 'bold' },
  headerSubtitle: { },
  content: {
    padding: 16,
    marginTop: -20,
  },
  section: {
    marginBottom: 10,
  },
  subheader: {
    fontWeight: 'bold',
    paddingLeft: 8,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
});
