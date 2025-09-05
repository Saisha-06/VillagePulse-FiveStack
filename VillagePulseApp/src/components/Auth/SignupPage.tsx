import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

interface Props {
  onSwitchToLogin: () => void;
}

const SignupPage: React.FC<Props> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created! Please login.');
      setEmail('');
      setPassword('');
      onSwitchToLogin();
    } catch (err: any) {
      Alert.alert('Signup Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 28, marginBottom: 20 }}>Sign Up</Text>
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

      <Button title={loading ? 'Creating Account...' : 'Sign Up'} onPress={handleSignup} disabled={loading} />

      <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center' }}>
        <Text>Have an account? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={{ color: 'blue' }}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupPage;
