
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="index" options={{headerShown:false}}/>
        <Stack.Screen name='forgetPassword' options={{title:'Forget Password', headerShown: false}}/>
        <Stack.Screen name="create" options={{ title: 'Create Group', headerShown: false }} />
        <Stack.Screen name="join" options={{ title: 'Join Group', headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="profile" options={{ title: 'User Profile' }} />
        <Stack.Screen name="groups" options={{ title: 'Groups' }} />
        <Stack.Screen name="groups/[groupId]" options={{ title: 'Group Details' }} />
      </Stack>
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}
