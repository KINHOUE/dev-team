import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Bouton thématisé via les rôles sémantiques du design system (aucune couleur en dur). */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
}: ButtonProps) {
  const { theme } = useTheme();
  const t = theme.colors;

  const background =
    variant === 'primary'
      ? t.accent
      : variant === 'danger'
        ? t.dangerSoft
        : variant === 'ghost'
          ? 'transparent'
          : t.surfaceRaised;

  const foreground =
    variant === 'primary' ? t.accentContrast : variant === 'danger' ? t.danger : t.text;

  const borderColor = variant === 'secondary' ? t.border : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor,
          borderRadius: theme.radii.md,
          height: size === 'sm' ? theme.space.xl : theme.space.xxl,
          paddingHorizontal: size === 'sm' ? theme.space.sm : theme.space.md,
        },
        (pressed || disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <Text
          style={{
            color: foreground,
            fontSize: size === 'sm' ? theme.fontSizes.sm : theme.fontSizes.base,
            fontWeight: theme.fontWeights.semibold,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
