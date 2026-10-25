import { Pressable, StyleSheet, View } from 'react-native';
import { resolveTheme } from '@dev-team/design-system';
import { THEME_NAMES, useTheme } from '../theme';

/** Sélecteur de thème : une pastille par pré set, accent du design system. */
export function ThemePicker() {
  const { theme, themeName, setThemeName } = useTheme();

  return (
    <View style={{ flexDirection: 'row', gap: theme.space.sm, flexWrap: 'wrap' }}>
      {THEME_NAMES.map((name) => {
        const accent = resolveTheme(name).tokens.accent;
        const active = name === themeName;
        return (
          <Pressable
            key={name}
            onPress={() => setThemeName(name)}
            accessibilityRole="button"
            accessibilityLabel={`Thème ${name}`}
            accessibilityState={{ selected: active }}
            style={[
              styles.swatch,
              {
                backgroundColor: accent,
                width: theme.space.xl,
                height: theme.space.xl,
                borderRadius: theme.radii.full,
                borderColor: active ? theme.colors.text : theme.colors.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  swatch: {
    borderWidth: 2,
  },
});
