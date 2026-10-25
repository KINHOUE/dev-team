import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../theme';

interface AppTabsProps {
  active: 'tasks' | 'finance';
}

/** Barre de navigation principale entre les deux modules. */
export function AppTabs({ active }: AppTabsProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const t = theme.colors;

  const items = [
    { key: 'finance' as const, label: 'Finances', href: '/finance' as const },
    { key: 'tasks' as const, label: 'Tâches', href: '/tasks' as const },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: t.border,
        backgroundColor: t.surface,
        paddingBottom: 4,
      }}
    >
      {items.map((item) => {
        const selected = active === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => router.replace(item.href)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: theme.space.sm,
              gap: 2,
            }}
          >
            <Text
              style={{
                color: selected ? t.accent : t.textMuted,
                fontSize: theme.fontSizes.sm,
                fontWeight: selected ? theme.fontWeights.bold : theme.fontWeights.medium,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
