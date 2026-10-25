import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';
import { Button } from '../components/Button';
import { AppTabs } from '../components/AppTabs';
import { ThemePicker } from '../components/ThemePicker';
import * as api from '../api/finance';
import type { Budget, Category, Dashboard, Expense, Forecast } from '../types';
import {
  CURRENCY_OPTIONS,
  centsToInput,
  currentMonthKey,
  formatDate,
  formatMoney,
  monthLabel,
  monthShortLabel,
  parseAmountToCents,
  todayInputValue,
} from '../lib/money';
import { categoryEmoji, ICON_KEYS } from '../lib/categoryEmoji';

type Tab = 'overview' | 'expenses' | 'budget' | 'forecasts' | 'categories' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Dashboard' },
  { key: 'expenses', label: 'Dépenses' },
  { key: 'budget', label: 'Budget' },
  { key: 'forecasts', label: 'Prévisions' },
  { key: 'categories', label: 'Catég.' },
  { key: 'settings', label: 'Paramètres' },
];

export default function FinanceScreen() {
  const { token, user, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const t = theme.colors;
  const currency = user?.currency ?? 'XOF';

  const [tab, setTab] = useState<Tab>('overview');
  const [month, setMonth] = useState(currentMonthKey());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [globalBudget, setGlobalBudget] = useState<Budget | null>(null);
  const [categoryBudgets, setCategoryBudgets] = useState<Budget[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  // Formulaires
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [dateInput, setDateInput] = useState(todayInputValue());
  const [categoryInput, setCategoryInput] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [globalBudgetInput, setGlobalBudgetInput] = useState('');

  const [forecastAmount, setForecastAmount] = useState('');
  const [forecastNote, setForecastNote] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('tag');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [cats, exp, bud, fc, dash] = await Promise.all([
        api.listCategories(token),
        api.listExpenses(token, month),
        api.getBudgets(token, month),
        api.listForecasts(token, month),
        api.getDashboard(token, month),
      ]);
      setCategories(cats);
      setExpenses(exp);
      setGlobalBudget(bud.global);
      setCategoryBudgets(bud.categories);
      setForecasts(fc.forecasts);
      setDashboard(dash);
      setGlobalBudgetInput(bud.global ? centsToInput(bud.global.amountCents) : '');
      const nextInputs: Record<string, string> = {};
      for (const b of bud.categories) {
        if (b.categoryId) nextInputs[b.categoryId] = centsToInput(b.amountCents);
      }
      setBudgetInputs(nextInputs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [token, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      try {
        await action();
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : fallback);
      }
    },
    [load],
  );

  const addExpense = async () => {
    if (!token) return;
    const amountCents = parseAmountToCents(amountInput);
    if (amountCents <= 0) {
      Alert.alert('Montant invalide', 'Saisissez un montant supérieur à zéro.');
      return;
    }
    setSaving(true);
    try {
      await api.createExpense(token, {
        amountCents,
        categoryId: categoryInput,
        date: dateInput,
        note: noteInput.trim() || null,
        source: 'manual',
      });
      setAmountInput('');
      setNoteInput('');
      setCategoryInput(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'ajouter la dépense");
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = (expense: Expense) => {
    if (!token) return;
    Alert.alert('Supprimer la dépense', `${formatMoney(expense.amountCents, currency)} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          void run(() => api.deleteExpense(token, expense.id), 'Suppression impossible'),
      },
    ]);
  };

  const saveGlobalBudget = async () => {
    if (!token) return;
    const amountCents = parseAmountToCents(globalBudgetInput);
    if (amountCents <= 0) {
      Alert.alert('Montant invalide', 'Saisissez un montant supérieur à zéro.');
      return;
    }
    await run(
      () => api.upsertBudget(token, { month, categoryId: null, amountCents }),
      'Enregistrement impossible',
    );
  };

  const saveCategoryBudget = async (categoryId: string) => {
    if (!token) return;
    const amountCents = parseAmountToCents(budgetInputs[categoryId] ?? '');
    if (amountCents <= 0) return;
    await run(
      () => api.upsertBudget(token, { month, categoryId, amountCents }),
      'Enregistrement impossible',
    );
  };

  const addForecast = async () => {
    if (!token) return;
    const amountCents = parseAmountToCents(forecastAmount);
    if (amountCents <= 0) {
      Alert.alert('Montant invalide', 'Saisissez un montant supérieur à zéro.');
      return;
    }
    setSaving(true);
    try {
      await api.createForecast(token, {
        month,
        categoryId: null,
        amountCents,
        note: forecastNote.trim() || null,
      });
      setForecastAmount('');
      setForecastNote('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'ajouter la prévision");
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    if (!token || !newCategoryName.trim()) return;
    setSaving(true);
    try {
      await api.createCategory(token, {
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
      });
      setNewCategoryName('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Création impossible');
    } finally {
      setSaving(false);
    }
  };

  const changeCurrency = async (code: string) => {
    if (!token) return;
    await run(() => api.updateCurrency(token, code), 'Changement impossible');
  };

  const shiftMonth = (delta: number) => {
    const [year, m] = month.split('-').map(Number);
    const d = new Date(year, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const spendList = useMemo(
    () => (dashboard ? dashboard.byCategory.filter((c) => c.spentCents > 0).sort((a, b) => b.spentCents - a.spentCents) : []),
    [dashboard],
  );
  const maxSpend = spendList.length > 0 ? spendList[0].spentCents : 1;

  const inputStyle = {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    color: t.text,
    height: theme.space.xxl,
    fontSize: theme.fontSizes.base,
    paddingHorizontal: theme.space.md,
  };

  const cardStyle = {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: theme.radii.lg,
    padding: theme.space.md,
    gap: theme.space.sm,
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.background, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: theme.space.md, gap: theme.space.md }}>
        {/* En-tête */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: t.text, fontSize: theme.fontSizes.xl, fontWeight: theme.fontWeights.bold }}>
            Finances
          </Text>
          <Pressable onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Se déconnecter">
            <Text style={{ color: t.accentMuted, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium }}>
              Déconnexion
            </Text>
          </Pressable>
        </View>
        <ThemePicker />

        {/* Sélecteur de mois */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button title="‹" variant="secondary" size="sm" onPress={() => shiftMonth(-1)} />
          <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.medium, textTransform: 'capitalize' }}>
            {monthLabel(month)}
          </Text>
          <Button title="›" variant="secondary" size="sm" onPress={() => shiftMonth(1)} />
        </View>

        {/* Onglets */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.space.xs }}>
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={{
                  paddingVertical: theme.space.sm,
                  paddingHorizontal: theme.space.md,
                  borderRadius: theme.radii.full,
                  backgroundColor: active ? t.accent : t.surface,
                  borderWidth: 1,
                  borderColor: active ? t.accent : t.border,
                }}
              >
                <Text style={{ color: active ? t.accentContrast : t.textMuted, fontSize: theme.fontSizes.sm, fontWeight: theme.fontWeights.medium }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {error ? <Text style={{ color: t.danger, fontSize: theme.fontSizes.sm }}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator color={t.accent} style={{ marginTop: theme.space.xl }} />
        ) : (
          <>
            {/* SYNTHÈSE */}
            {tab === 'overview' && dashboard ? (
              <View style={{ gap: theme.space.sm }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}>
                  {[
                    { label: 'Dépensé', value: formatMoney(dashboard.totalSpentCents, currency) },
                    {
                      label: 'Budget',
                      value:
                        dashboard.budgetTotalCents === null
                          ? '—'
                          : formatMoney(dashboard.budgetTotalCents, currency),
                    },
                    {
                      label: dashboard.remainingCents !== null && dashboard.remainingCents < 0 ? 'Dépassement' : 'Reste',
                      value:
                        dashboard.remainingCents === null
                          ? '—'
                          : formatMoney(Math.abs(dashboard.remainingCents), currency),
                      danger: dashboard.remainingCents !== null && dashboard.remainingCents < 0,
                    },
                    { label: 'Prévisions', value: formatMoney(dashboard.forecastTotalCents, currency) },
                  ].map((kpi) => (
                    <View key={kpi.label} style={[cardStyle, { flexBasis: '47%', flexGrow: 1 }]}>
                      <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm, textTransform: 'uppercase' }}>
                        {kpi.label}
                      </Text>
                      <Text style={{ color: kpi.danger ? t.danger : t.text, fontSize: theme.fontSizes.lg, fontWeight: theme.fontWeights.bold }}>
                        {kpi.value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Répartition par catégorie
                  </Text>
                  {spendList.length === 0 ? (
                    <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm }}>
                      Aucune dépense ce mois.
                    </Text>
                  ) : (
                    spendList.map((item) => (
                      <View key={item.categoryId ?? item.name} style={{ gap: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: t.text, fontSize: theme.fontSizes.sm }}>
                            {categoryEmoji(item.icon)} {item.name}
                          </Text>
                          <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm }}>
                            {formatMoney(item.spentCents, currency)}
                          </Text>
                        </View>
                        <View style={{ height: 8, borderRadius: 4, backgroundColor: t.surfaceRaised, overflow: 'hidden' }}>
                          <View
                            style={{
                              height: '100%',
                              width: `${Math.max(4, (item.spentCents / maxSpend) * 100)}%`,
                              backgroundColor: t.accent,
                            }}
                          />
                        </View>
                      </View>
                    ))
                  )}
                </View>

                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Dépenses des 6 derniers mois
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: theme.space.xs, height: 110 }}>
                    {dashboard.months.map((m) => {
                      const max = Math.max(1, ...dashboard.months.map((x) => x.spentCents));
                      const h = m.spentCents > 0 ? Math.max(6, (m.spentCents / max) * 90) : 3;
                      return (
                        <View key={m.month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                          <View
                            style={{
                              width: '100%',
                              height: h,
                              borderRadius: 4,
                              backgroundColor: m.month === month ? t.accent : t.accentSoft,
                            }}
                          />
                          <Text style={{ color: t.textMuted, fontSize: 10 }}>
                            {monthShortLabel(m.month)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            ) : null}

            {/* DÉPENSES */}
            {tab === 'expenses' ? (
              <View style={{ gap: theme.space.sm }}>
                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Nouvelle dépense
                  </Text>
                  <TextInput
                    value={amountInput}
                    onChangeText={setAmountInput}
                    keyboardType="decimal-pad"
                    placeholder={`Montant (${currency})`}
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <TextInput
                    value={dateInput}
                    onChangeText={setDateInput}
                    placeholder="AAAA-MM-JJ"
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <TextInput
                    value={noteInput}
                    onChangeText={setNoteInput}
                    placeholder="Note (optionnel)"
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.space.xs }}>
                    <Pressable
                      onPress={() => setCategoryInput(null)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: theme.space.sm,
                        borderRadius: theme.radii.full,
                        borderWidth: 1,
                        borderColor: categoryInput === null ? t.accent : t.border,
                        backgroundColor: categoryInput === null ? t.accentSoft : 'transparent',
                      }}
                    >
                      <Text style={{ color: categoryInput === null ? t.accent : t.textMuted, fontSize: theme.fontSizes.sm }}>
                        Sans catégorie
                      </Text>
                    </Pressable>
                    {categories.map((category) => {
                      const selected = categoryInput === category.id;
                      return (
                        <Pressable
                          key={category.id}
                          onPress={() => setCategoryInput(category.id)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: theme.space.sm,
                            borderRadius: theme.radii.full,
                            borderWidth: 1,
                            borderColor: selected ? t.accent : t.border,
                            backgroundColor: selected ? t.accentSoft : 'transparent',
                          }}
                        >
                          <Text style={{ color: selected ? t.accent : t.textMuted, fontSize: theme.fontSizes.sm }}>
                            {categoryEmoji(category.icon)} {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                  <Button title="Ajouter la dépense" onPress={addExpense} loading={saving} />
                  <Text style={{ color: t.textMuted, fontSize: 11 }}>
                    La dictée vocale est disponible sur la version web / PWA.
                  </Text>
                </View>

                {expenses.length === 0 ? (
                  <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm, textAlign: 'center', padding: theme.space.md }}>
                    Aucune dépense ce mois.
                  </Text>
                ) : (
                  expenses.map((expense) => (
                    <View key={expense.id} style={[cardStyle, { flexDirection: 'row', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 20 }}>{categoryEmoji(expense.category?.icon ?? 'tag')}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text, fontSize: theme.fontSizes.base }}>
                          {expense.category?.name ?? 'Sans catégorie'}
                        </Text>
                        <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm }}>
                          {formatDate(expense.date)}
                          {expense.note ? ` · ${expense.note}` : ''}
                        </Text>
                      </View>
                      <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                        −{formatMoney(expense.amountCents, currency)}
                      </Text>
                      <Pressable onPress={() => removeExpense(expense)} accessibilityLabel="Supprimer" hitSlop={8}>
                        <Text style={{ color: t.danger, fontSize: theme.fontSizes.lg }}>✕</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            ) : null}

            {/* BUDGET */}
            {tab === 'budget' ? (
              <View style={{ gap: theme.space.sm }}>
                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Budget global du mois
                  </Text>
                  <TextInput
                    value={globalBudgetInput}
                    onChangeText={setGlobalBudgetInput}
                    keyboardType="decimal-pad"
                    placeholder={`Montant (${currency})`}
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <Button title="Enregistrer le budget global" onPress={saveGlobalBudget} />
                </View>

                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Budgets par catégorie
                  </Text>
                  {categories.map((category) => (
                    <View key={category.id} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
                      <Text style={{ flex: 1, color: t.text, fontSize: theme.fontSizes.sm }}>
                        {categoryEmoji(category.icon)} {category.name}
                      </Text>
                      <TextInput
                        value={budgetInputs[category.id] ?? ''}
                        onChangeText={(value) => setBudgetInputs((prev) => ({ ...prev, [category.id]: value }))}
                        keyboardType="decimal-pad"
                        placeholder="—"
                        placeholderTextColor={t.textMuted}
                        style={[inputStyle, { width: 100, textAlign: 'right' }]}
                      />
                      <Button title="OK" size="sm" variant="secondary" onPress={() => saveCategoryBudget(category.id)} />
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* PRÉVISIONS */}
            {tab === 'forecasts' ? (
              <View style={{ gap: theme.space.sm }}>
                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Nouvelle prévision
                  </Text>
                  <TextInput
                    value={forecastAmount}
                    onChangeText={setForecastAmount}
                    keyboardType="decimal-pad"
                    placeholder={`Montant prévu (${currency})`}
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <TextInput
                    value={forecastNote}
                    onChangeText={setForecastNote}
                    placeholder="Note (optionnel)"
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <Button title="Ajouter la prévision" onPress={addForecast} loading={saving} />
                </View>

                {forecasts.length === 0 ? (
                  <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm, textAlign: 'center', padding: theme.space.md }}>
                    Aucune prévision enregistrée.
                  </Text>
                ) : (
                  forecasts.map((forecast) => (
                    <View key={forecast.id} style={[cardStyle, { flexDirection: 'row', alignItems: 'center' }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.text, fontSize: theme.fontSizes.base }}>
                          {forecast.category?.name ?? 'Prévision globale'}
                        </Text>
                        {forecast.note ? (
                          <Text style={{ color: t.textMuted, fontSize: theme.fontSizes.sm }}>{forecast.note}</Text>
                        ) : null}
                      </View>
                      <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                        {formatMoney(forecast.amountCents, currency)}
                      </Text>
                      <Pressable
                        onPress={() => {
                          if (!token) return;
                          Alert.alert('Supprimer la prévision', 'Confirmer ?', [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: 'Supprimer',
                              style: 'destructive',
                              onPress: () => void run(() => api.deleteForecast(token, forecast.id), 'Suppression impossible'),
                            },
                          ]);
                        }}
                        accessibilityLabel="Supprimer"
                        hitSlop={8}
                      >
                        <Text style={{ color: t.danger, fontSize: theme.fontSizes.lg }}>✕</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            ) : null}

            {/* CATÉGORIES */}
            {tab === 'categories' ? (
              <View style={{ gap: theme.space.sm }}>
                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Nouvelle catégorie
                  </Text>
                  <TextInput
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    placeholder="Nom de la catégorie"
                    placeholderTextColor={t.textMuted}
                    style={inputStyle}
                  />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.xs }}>
                    {ICON_KEYS.map((icon) => (
                      <Pressable
                        key={icon}
                        onPress={() => setNewCategoryIcon(icon)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: newCategoryIcon === icon }}
                        style={{
                          width: 44,
                          height: 44,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: theme.radii.md,
                          borderWidth: 1,
                          borderColor: newCategoryIcon === icon ? t.accent : t.border,
                          backgroundColor: newCategoryIcon === icon ? t.accentSoft : t.surface,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>{categoryEmoji(icon)}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Button title="Créer la catégorie" onPress={addCategory} loading={saving} />
                </View>

                {categories.map((category) => (
                  <View key={category.id} style={[cardStyle, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 20 }}>{categoryEmoji(category.icon)}</Text>
                    <Text style={{ flex: 1, color: t.text, fontSize: theme.fontSizes.base }}>{category.name}</Text>
                    <Pressable
                      onPress={() => {
                        if (!token) return;
                        Alert.alert(
                          'Supprimer la catégorie',
                          `« ${category.name} » ? Les dépenses seront conservées sans catégorie.`,
                          [
                            { text: 'Annuler', style: 'cancel' },
                            {
                              text: 'Supprimer',
                              style: 'destructive',
                              onPress: () => void run(() => api.deleteCategory(token, category.id), 'Suppression impossible'),
                            },
                          ],
                        );
                      }}
                      accessibilityLabel={`Supprimer ${category.name}`}
                      hitSlop={8}
                    >
                      <Text style={{ color: t.danger, fontSize: theme.fontSizes.lg }}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {/* RÉGLAGES */}
            {tab === 'settings' ? (
              <View style={{ gap: theme.space.sm }}>
                <View style={cardStyle}>
                  <Text style={{ color: t.text, fontSize: theme.fontSizes.base, fontWeight: theme.fontWeights.bold }}>
                    Devise du compte
                  </Text>
                  {CURRENCY_OPTIONS.map((option) => {
                    const active = currency === option.code;
                    return (
                      <Pressable
                        key={option.code}
                        onPress={() => void changeCurrency(option.code)}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: active }}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingVertical: theme.space.sm,
                          paddingHorizontal: theme.space.md,
                          borderRadius: theme.radii.md,
                          borderWidth: 1,
                          borderColor: active ? t.accent : t.border,
                          backgroundColor: active ? t.accentSoft : 'transparent',
                        }}
                      >
                        <Text style={{ color: active ? t.accent : t.text, fontSize: theme.fontSizes.sm }}>
                          {option.label}
                        </Text>
                        <Text style={{ color: active ? t.accent : t.textMuted, fontSize: theme.fontSizes.sm }}>
                          {active ? '✓' : ''}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={{ color: t.textMuted, fontSize: 11 }}>
                  Les montants existants ne sont pas convertis — seule la devise d'affichage change.
                </Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <AppTabs active="finance" />
    </View>
  );
}

const styles = StyleSheet.create({});
