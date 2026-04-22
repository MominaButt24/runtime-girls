import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { auth } from '../src/api/firebase';

export default function Index() {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAuthState(user.emailVerified ? 'main' : 'verify');
      } else {
        setAuthState('login');
      }
    });
    return () => unsubscribe();
  }, []);

  if (authState === null) return null;
  if (authState === 'main') return <Redirect href="/(main)" />;
  if (authState === 'verify') return <Redirect href="/(auth)/verify-email" />;
  return <Redirect href="/(auth)/login" />;
}
