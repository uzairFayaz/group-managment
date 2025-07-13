
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ErrorBoundary from '../src/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="index" options={{headerShown:false}}/>
        <Stack.Screen name='otpVerfication'  options={{title:'Otp verify', headerShown: false}}/>
        <Stack.Screen name='createPost' options={{title:'Post' , headerShown: false}}/>
        <Stack.Screen name='verifyForgetPassword'  options={{title:'Otp verify', headerShown: false}}/>
        <Stack.Screen name='forgetPassword' options={{title:'Forget Password', headerShown: false}}/>
        <Stack.Screen name='resetPassword' options={{title:'Reset password', headerShown:false}}/>
        <Stack.Screen name="create" options={{ title: 'Create Group', headerShown: false }} />
        <Stack.Screen name="join" options={{ title: 'Join Group', headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Register' }} />
        <Stack.Screen name="profile" options={{ title: 'User Profile', headerShown:false }} />
        <Stack.Screen name="groups" options={{ title: 'Groups' }} />
        <Stack.Screen name="groups/[groupId]" options={{ title: 'Group Details', headerShown:false }} />
      </Stack>
      <StatusBar style="auto" />
    </ErrorBoundary>
  );
}
