import styles from '../styles/components/SignIn.module.css';

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Input from './Input';
import { useSignInEmailPassword } from '@nhost/react';
import Spinner from './Spinner';
import { FiYoutube } from 'react-icons/fi';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const {
    signInEmailPassword,
    isLoading,
    isSuccess,
    needsEmailVerification,
    isError,
    error,
  } = useSignInEmailPassword();

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    signInEmailPassword(email, password);
  };

  if (isSuccess) {
    return <Navigate to="/" replace />;
  }

  const disableForm = isLoading || needsEmailVerification;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles['logo-wrapper']}>
            <div className="flex justify-center items-center">
              <FiYoutube className="h-6 w-6 text-red-600" />
              <span className="ml-2 text-xl font-semibold">VideoSummarizer</span>
            </div>
        </div>

        {needsEmailVerification ? (
          <p className={styles['verification-text']}>
            Please check your mailbox and follow the verification link to verify your email.
          </p>
        ) : (
          <form onSubmit={handleOnSubmit} className={styles.form}>
            <Input
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={disableForm}
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={disableForm}
            />

            <button
              type="submit"
              className={styles.button}
              disabled={disableForm}
            >
              {isLoading ? <Spinner size="sm" /> : 'Sign In'}
            </button>

            {isError && (
              <p className={styles['error-text']}>
                {error?.message || 'Something went wrong. Please try again.'}
              </p>
            )}
          </form>
        )}
      </div>

      <p className={styles.text}>
        No account yet?{' '}
        <Link to="/sign-up" className={styles.link}>
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
