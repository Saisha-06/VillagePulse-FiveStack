import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface Props {
  onSwitchToSignup: () => void;
}

const LoginPage: React.FC<Props> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Welcome', `Logged in as ${email}`);
      // TODO: Navigate to app main screen after successful login
    } catch (err: any) {
      Alert.alert('Login Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Log In</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 16, borderRadius: 6 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 16, borderRadius: 6 }}
      />
      <Button title={loading ? 'Logging in...' : 'Log In'} onPress={handleLogin} disabled={loading} />

      <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
        <Text>No account yet? </Text>
        <TouchableOpacity onPress={onSwitchToSignup}>
          <Text style={{ color: 'blue' }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginPage;
