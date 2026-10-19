import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

const STORAGE_KEY = 'move-to-germany-budget-v1';
const GREEN = '#176B45';
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';

type Budget = {
  city: string;
  rent: string;
  utilities: string;
  food: string;
  insurance: string;
  transport: string;
  phone: string;
  study: string;
  other: string;
  setup: string;
  months: string;
};

const DEFAULT_BUDGET: Budget = {
  city: 'Stuttgart',
  rent: '550',
  utilities: '100',
  food: '250',
  insurance: '145',
  transport: '35',
  phone: '15',
  study: '40',
  other: '100',
  setup: '1800',
  months: '3',
};

const CITY_PRESETS: Record<string, Partial<Budget>> = {
  Stuttgart: { rent: '550', utilities: '100' },
  Berlin: { rent: '600', utilities: '110' },
  Munich: { rent: '750', utilities: '120' },
  Frankfurt: { rent: '650', utilities: '110' },
  Göttingen: { rent: '400', utilities: '90' },
  'Other city': { rent: '500', utilities: '100' },
};

function amount(value: string): number {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function money(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BudgetScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [budget, setBudget] = useState<Budget>(DEFAULT_BUDGET);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<Budget>;
            setBudget({ ...DEFAULT_BUDGET, ...parsed });
          } catch {
            setBudget(DEFAULT_BUDGET);
          }
        }
      })
      .catch((error) => console.error('Could not load budget:', error))
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budget)).catch((error) =>
      console.error('Could not save budget:', error),
    );
  }, [budget, ready]);

  const monthly = useMemo(
    () =>
      ['rent', 'utilities', 'food', 'insurance', 'transport', 'phone', 'study', 'other']
        .reduce((total, key) => total + amount(budget[key as keyof Budget] as string), 0),
    [budget],
  );
  const reserveMonths = Math.max(1, Math.min(12, Math.round(amount(budget.months) || 1)));
  const setup = amount(budget.setup);
  const arrivalTarget = setup + monthly * reserveMonths;

  function update(key: keyof Budget, value: string) {
    setBudget((current) => ({ ...current, [key]: value }));
  }

  function chooseCity(city: string) {
    setBudget((current) => ({ ...current, city, ...(CITY_PRESETS[city] || {}) }));
  }

  function renderField(key: keyof Budget, label: string, helper?: string) {
    return (
      <View style={styles.field} key={key}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.inputRow}>
          <Text style={styles.euro}>€</Text>
          <TextInput
            value={budget[key]}
            onChangeText={(value) => update(key, value.replace(/[^0-9.,]/g, ''))}
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel={label}
            placeholder="0"
          />
          <Text style={styles.perMonth}>/ month</Text>
        </View>
        {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.content, isWide && styles.wideContent]}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.brand}>MOVE TO GERMANY</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>PLAN YOUR MONEY</Text>
            <Text style={styles.title}>Student budget planner</Text>
            <Text style={styles.subtitle}>
              Build a personal estimate for living in Germany. Change every amount to match your own situation.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>ESTIMATED MONTHLY COST</Text>
            <Text style={styles.monthlyTotal}>{money(monthly)}</Text>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summarySecondary}>Estimated annual cost</Text>
              <Text style={styles.summaryValue}>{money(monthly * 12)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summarySecondary}>Suggested arrival fund</Text>
              <Text style={styles.summaryValue}>{money(arrivalTarget)}</Text>
            </View>
            <Text style={styles.summaryNote}>
              Arrival fund = your setup costs plus {reserveMonths} month(s) of estimated living costs.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Choose your city</Text>
            <Text style={styles.sectionIntro}>Rent is one of the biggest variables. A preset is only a starting estimate.</Text>
            <View style={styles.cityGrid}>
              {Object.keys(CITY_PRESETS).map((city) => (
                <TouchableOpacity
                  key={city}
                  onPress={() => chooseCity(city)}
                  style={[styles.cityChip, budget.city === city && styles.cityChipSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: budget.city === city }}
                >
                  <Text style={[styles.cityChipText, budget.city === city && styles.cityChipTextSelected]}>{city}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionTitle}>2. Monthly expenses</Text>
            <Text style={styles.sectionIntro}>Amounts are in euros. Include the costs you personally expect to pay.</Text>
            <View style={styles.fieldsGrid}>
              {renderField('rent', 'Rent / room', 'Include warm rent if utilities are already included.')}
              {renderField('utilities', 'Utilities not included in rent')}
              {renderField('food', 'Groceries and household items')}
              {renderField('insurance', 'Health insurance', 'Check your actual student contribution and eligibility.')}
              {renderField('transport', 'Transport')}
              {renderField('phone', 'Phone and internet')}
              {renderField('study', 'Study materials and fees')}
              {renderField('other', 'Personal and other costs')}
            </View>
            <Text style={styles.sectionTitle}>3. Arrival money</Text>
            {renderField('setup', 'One-off setup costs', 'For example, deposit, initial purchases, and travel to Germany. This is not a monthly cost.')}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Months of living costs to keep aside</Text>
              <View style={styles.monthButtons}>
                {[1, 2, 3, 4, 6].map((months) => (
                  <TouchableOpacity
                    key={months}
                    onPress={() => update('months', String(months))}
                    style={[styles.monthButton, reserveMonths === months && styles.monthButtonSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: reserveMonths === months }}
                  >
                    <Text style={[styles.monthButtonText, reserveMonths === months && styles.monthButtonTextSelected]}>{months}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What this estimate means</Text>
            <Text style={styles.bullet}>• This is a planning tool, not an official cost-of-living or visa-funds calculation.</Text>
            <Text style={styles.bullet}>• Your rent, insurance status, semester contribution, lifestyle and city can change the total significantly.</Text>
            <Text style={styles.bullet}>• For visa or residence-permit financial requirements, check the current official German mission and local authority guidance.</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setBudget(DEFAULT_BUDGET)}
              accessibilityRole="button"
            >
              <Text style={styles.resetText}>Reset to example amounts</Text>
            </TouchableOpacity>
            <Text style={styles.savedText}>{ready ? 'Your budget is saved on this device.' : 'Loading your saved budget…'}</Text>
          </View>

          <Text style={styles.footer}>Illustrative estimates only. Prices and requirements can change; verify actual costs before making financial or immigration decisions.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  page: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 48 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  wideContent: { maxWidth: 900 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backButton: { paddingVertical: 8, paddingRight: 12 },
  backText: { color: GREEN, fontWeight: '800', fontSize: 13 },
  brand: { color: GREEN, fontWeight: '900', fontSize: 10, letterSpacing: 1.5 },
  hero: { marginBottom: 24 },
  eyebrow: { color: GREEN, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  title: { color: DARK, fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: MUTED, fontSize: 15, lineHeight: 23, marginTop: 10, maxWidth: 650 },
  summaryCard: { backgroundColor: GREEN, borderRadius: 20, padding: 24, marginBottom: 20 },
  summaryLabel: { color: '#D8EBDD', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  monthlyTotal: { color: '#FFFFFF', fontSize: 38, fontWeight: '900', marginTop: 8, marginBottom: 18 },
  summaryDivider: { height: 1, backgroundColor: '#4A8064', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 8 },
  summarySecondary: { color: '#E2EFE5', fontSize: 13, flex: 1 },
  summaryValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  summaryNote: { color: '#D8EBDD', fontSize: 11, lineHeight: 17, marginTop: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E5EAE4', marginBottom: 18 },
  sectionTitle: { color: DARK, fontSize: 18, fontWeight: '900', marginTop: 6, marginBottom: 8 },
  sectionIntro: { color: MUTED, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  cityChip: { paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: '#DDE5DC', backgroundColor: '#FFFFFF' },
  cityChipSelected: { backgroundColor: '#E5F1E7', borderColor: GREEN },
  cityChipText: { color: DARK, fontSize: 12, fontWeight: '700' },
  cityChipTextSelected: { color: GREEN },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  field: { width: '100%', marginBottom: 15 },
  fieldLabel: { color: DARK, fontSize: 12, fontWeight: '800', marginBottom: 7 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDE5DC', borderRadius: 10, backgroundColor: '#FBFCFA', paddingHorizontal: 12, minHeight: 46 },
  euro: { color: GREEN, fontWeight: '900', fontSize: 15, marginRight: 8 },
  input: { flex: 1, color: DARK, fontSize: 15, paddingVertical: 10, minWidth: 0 },
  perMonth: { color: MUTED, fontSize: 11 },
  helper: { color: MUTED, fontSize: 11, lineHeight: 16, marginTop: 6 },
  monthButtons: { flexDirection: 'row', gap: 8, marginTop: 2 },
  monthButton: { minWidth: 42, paddingVertical: 10, alignItems: 'center', borderRadius: 9, borderWidth: 1, borderColor: '#DDE5DC' },
  monthButtonSelected: { backgroundColor: '#E5F1E7', borderColor: GREEN },
  monthButtonText: { color: DARK, fontWeight: '800' },
  monthButtonTextSelected: { color: GREEN },
  bullet: { color: MUTED, fontSize: 13, lineHeight: 21, marginTop: 8 },
  resetButton: { alignSelf: 'flex-start', marginTop: 20, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: '#DDE5DC' },
  resetText: { color: GREEN, fontSize: 12, fontWeight: '800' },
  savedText: { color: MUTED, fontSize: 11, marginTop: 14 },
  footer: { color: '#788179', fontSize: 11, lineHeight: 17, marginTop: 4 },
});
