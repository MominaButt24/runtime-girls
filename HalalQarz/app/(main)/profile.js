import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Avatar, useTheme, Card, Divider } from 'react-native-paper';
import { auth } from '../../src/api/firebase';
import { getUserProfile } from '../../src/api/user';

export default function ProfileScreen() {
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const data = await getUserProfile(user.uid);
        setUserData(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.custom.background }]}>
        <ActivityIndicator size="large" color={theme.custom.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.custom.background }]}>
      <View style={styles.header}>
        <Avatar.Icon size={100} icon="account" style={{ backgroundColor: theme.custom.primary }} />
        <Text variant="headlineMedium" style={[styles.name, { color: theme.custom.text }]}>
          {userData?.fullName || 'No Name Set'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="labelLarge" style={{ color: theme.custom.primary }}>Email Address</Text>
          <Text variant="bodyLarge" style={{ marginTop: 5 }}>{userData?.email || auth.currentUser?.email}</Text>
          <Divider style={{ marginVertical: 15 }} />
          
          <Text variant="labelLarge" style={{ color: theme.custom.primary }}>Account Created</Text>
          <Text variant="bodyLarge" style={{ marginTop: 5 }}>
            {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Statistics" subtitle="Your learning progress" />
        <Card.Content>
          <Text variant="bodyMedium">Check your dashboard for detailed analytics.</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  name: { marginTop: 15, fontWeight: 'bold' },
  card: { marginBottom: 15, borderRadius: 12, elevation: 2 }
});
