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

  const headerContentColor = theme.dark ? theme.colors.onPrimaryContainer : '#FFFFFF';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
      <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.surface }}>
        {/* Sidebar Header */}
        <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primary }]}>
          {loading ? (
            <ActivityIndicator color={headerContentColor} />
          ) : (
            <>
              <Avatar.Icon 
                size={60} 
                icon="account" 
                style={{ backgroundColor: theme.dark ? theme.colors.primaryContainer : 'rgba(255, 255, 255, 0.2)' }} 
                color={headerContentColor}
              />
              <Text variant="titleMedium" style={[styles.userName, { color: headerContentColor }]}>
                {userData?.fullName || 'App User'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.dark ? theme.colors.onPrimaryContainer : 'rgba(255, 255, 255, 0.7)' }}>
                {userData?.email || auth.currentUser?.email || 'No email found'}
              </Text>
            </>
          )}
        </View>
        
        {/* Main Navigation Items */}
        <View style={{ marginTop: 10 }}>
           <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button at Bottom */}
      <View style={[styles.logoutSection, { backgroundColor: theme.colors.surface }]}>
        <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />
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

// eslint-disable-next-line react/prop-types, react/display-name
const createDrawerIcon = (icon) => ({ color, size }) => (
  <Avatar.Icon size={size} icon={icon} style={{ backgroundColor: 'transparent' }} color={color} />
);

export default function MainLayout() {
  const theme = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: theme.colors.surface, elevation: 0, shadowOpacity: 0 },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { color: theme.colors.onSurface },
    drawerActiveBackgroundColor: theme.colors.primaryContainer,
    drawerActiveTintColor: theme.colors.onPrimaryContainer,
    drawerInactiveTintColor: theme.colors.onSurfaceVariant,
    drawerStyle: { width: 280, backgroundColor: theme.colors.surface },
    drawerLabelStyle: { fontWeight: 'bold' }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={screenOptions}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: 'Home',
            title: 'Dashboard',
            drawerIcon: createDrawerIcon('home'),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Profile',
            title: 'My Profile',
            drawerIcon: createDrawerIcon('account'),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: 'Settings',
            title: 'App Settings',
            drawerIcon: createDrawerIcon('cog'),
          }}
        />
        <Drawer.Screen
          name="eligibility/index"
          options={{
            drawerLabel: 'Check Eligibility',
            title: 'Loan Eligibility',
            drawerIcon: createDrawerIcon('clipboard-check'),
          }}
        />
        <Drawer.Screen
          name="eligibility/manual"
          options={{
            drawerLabel: 'Eligibility Form',
            title: 'Fill Eligibility Form',
            drawerIcon: createDrawerIcon('form-textbox'),
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="eligibility/result"
          options={{
            drawerLabel: 'Results',
            title: 'Eligibility Results',
            drawerIcon: createDrawerIcon('chart-pie'),
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="tracker/index"
          options={{
            drawerLabel: 'Expense Tracker',
            title: 'Expense Tracker',
            drawerIcon: createDrawerIcon('cash-multiple'),
          }}
        />
        <Drawer.Screen
          name="products/index"
          options={{
            drawerLabel: 'Islamic Products',
            title: 'Islamic Products',
            drawerIcon: createDrawerIcon('bank'),
          }}
        />
        <Drawer.Screen
          name="tracker/add-expense"
          options={{
            title: 'Add Expense',
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  logoutSection: {
    padding: 15,
    paddingBottom: 30,
  },
  logoutButton: {
    justifyContent: 'flex-start',
  }
});
