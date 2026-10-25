import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const t = theme.colors;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password);
      router.replace('/tasks');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Inscription impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.space.md,
          gap: theme.space.md,
        }}
      >
        <Text
          style={{
            color: t.text,
            fontSize: theme.fontSizes.xxl,
            fontWeight: theme.fontWeights.bold,
          }}
        >
          Inscription
        </Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="vous@exemple.com"
        />
        <Input
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
          placeholder="8 caractères minimum"
        />
        <Input
          label="Confirmer le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoComplete="password-new"
          placeholder="••••••••"
        />
        {error ? <Text style={{ color: t.danger, fontSize: theme.fontSizes.sm }}>{error}</Text> : null}
        <Button title="Créer le compte" onPress={onSubmit} loading={submitting} />
        <Link href="/login" style={{ color: t.accentMuted, textAlign: 'center' }}>
          Déjà un compte ? Se connecter
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
