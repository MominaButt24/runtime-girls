import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text, Avatar, useTheme, Divider, Button } from 'react-native-paper';
import { logoutUser } from '../../src/api/auth';
import { subscribeToUserProfile } from '../../src/api/user';
import { auth } from '../../src/api/firebase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

function CustomDrawerContent(props) {
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = subscribeToUserProfile(user.uid, (data) => {
        setUserData(data);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.custom.background }}>
      <DrawerContentScrollView {...props}>
        {/* Sidebar Header */}
        <View style={styles.drawerHeader}>
          {loading ? (
            <ActivityIndicator color={theme.custom.primary} />
          ) : (
            <>
              <Avatar.Icon 
                size={60} 
                icon="account" 
                style={{ backgroundColor: theme.custom.primary }} 
              />
              <Text variant="titleMedium" style={[styles.userName, { color: theme.custom.text }]}>
                {userData?.fullName || 'App User'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.custom.textSecondary }}>
                {userData?.email || auth.currentUser?.email || 'No email found'}
              </Text>
            </>
          )}
        </View>
        <Divider style={styles.divider} />
        
        {/* Main Navigation Items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Button at Bottom */}
      <View style={styles.logoutSection}>
        <Divider />
        <Button 
          icon="logout" 
          mode="text" 
          onPress={handleLogout} 
          textColor={theme.colors.error}
          contentStyle={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
    </View>
  );
}

export default function MainLayout() {
  const theme = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: theme.custom.background },
          headerTintColor: theme.custom.primary,
          headerTitleStyle: { color: theme.custom.text },
          drawerActiveBackgroundColor: theme.custom.primaryContainer,
          drawerActiveTintColor: theme.custom.primary,
          drawerInactiveTintColor: theme.custom.textSecondary,
          drawerStyle: { width: 280, backgroundColor: theme.custom.background },
          drawerLabelStyle: { fontWeight: 'bold' }
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            title: 'Dashboard',
            drawerIcon: ({ color, size }) => <Avatar.Icon size={size} icon="home" style={{backgroundColor: 'transparent'}} color={color} />,
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Profile',
            title: 'My Profile',
            drawerIcon: ({ color, size }) => <Avatar.Icon size={size} icon="account" style={{backgroundColor: 'transparent'}} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            title: 'App Settings',
            drawerIcon: ({ color, size }) => <Avatar.Icon size={size} icon="cog" style={{backgroundColor: 'transparent'}} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  userName: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
  },
  logoutSection: {
    padding: 15,
    paddingBottom: 30,
  },
  logoutButton: {
    justifyContent: 'flex-start',
  }
});
