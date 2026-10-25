import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Champ de saisie thématisé (aucune couleur / espacement / rayon en dur). */
export function Input({ label, error, style, ...props }: InputProps) {
  const { theme } = useTheme();
  const t = theme.colors;

  return (
    <View style={{ gap: theme.space.xs }}>
      {label ? (
        <Text
          style={{
            color: t.text,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.medium,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={t.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: t.surface,
            borderColor: error ? t.danger : t.border,
            color: t.text,
            borderRadius: theme.radii.md,
            height: theme.space.xxl,
            fontSize: theme.fontSizes.base,
            paddingHorizontal: theme.space.md,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={{ color: t.danger, fontSize: theme.fontSizes.sm }}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
});
