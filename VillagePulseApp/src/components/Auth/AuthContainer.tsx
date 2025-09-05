import React, { useState } from 'react';
import SignupPage from './SignupPage';
import LoginPage from './LoginPage';

const AuthContainer: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);

  return isLogin ? (
    <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
  );
};

export default AuthContainer;
