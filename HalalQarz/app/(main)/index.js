import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={[styles.header, { backgroundColor: theme.custom.surface }]}>
        <Text variant="headlineMedium" style={[styles.title, { color: theme.custom.text }]}>
          Hackathon Dashboard
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.custom.textSecondary }}>
          Welcome to your project manager
        </Text>
      </View>

      <View style={styles.grid}>
        <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
          <Card.Title 
            title="Active Tasks" 
            titleStyle={{ color: theme.custom.text }}
            left={(props) => <Avatar.Icon {...props} icon="format-list-bulleted" style={{ backgroundColor: theme.custom.primaryContainer }} color={theme.custom.primary} />} 
          />
          <Card.Content>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>5 Pending Tasks</Text>
          </Card.Content>
          <Card.Actions>
            <Button textColor={theme.custom.primary}>View All</Button>
          </Card.Actions>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
          <Card.Title 
            title="Team Chat" 
            titleStyle={{ color: theme.custom.text }}
            left={(props) => <Avatar.Icon {...props} icon="chat" style={{ backgroundColor: theme.custom.primaryContainer }} color={theme.custom.primary} />} 
          />
          <Card.Content>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>3 New Messages</Text>
          </Card.Content>
          <Card.Actions>
            <Button textColor={theme.custom.primary}>Open Chat</Button>
          </Card.Actions>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.custom.surface }]}>
          <Card.Title 
            title="Resource Hub" 
            titleStyle={{ color: theme.custom.text }}
            left={(props) => <Avatar.Icon {...props} icon="folder" style={{ backgroundColor: theme.custom.primaryContainer }} color={theme.custom.primary} />} 
          />
          <Card.Content>
            <Text variant="bodyLarge" style={{ color: theme.custom.text }}>AI & Backend Docs</Text>
          </Card.Content>
          <Card.Actions>
            <Button textColor={theme.custom.primary}>Explore</Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 40, paddingTop: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontWeight: 'bold', marginBottom: 5 },
  grid: { padding: 15 },
  card: { marginBottom: 15, elevation: 2, borderRadius: 15 },
});
