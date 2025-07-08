
import { useRouter } from 'expo-router';
import React, { ReactNode, useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

interface Props {
  children: ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // React Native doesn't support window events; rely on try-catch in components
    return () => {};
  }, []);

  if (hasError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Button
          title="Reload App"
          onPress={() => {
            setHasError(false);
            setErrorMessage('');
          }}
        />
        <Button
          title="Log In"
          onPress={() => router.replace('/login')}
        />
      </View>
    );
  }
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
