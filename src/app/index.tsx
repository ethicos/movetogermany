
import { router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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

const GREEN = '#176B45';
const GREEN_DARK = '#105638';
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⌂', path: '/' },
  { label: 'My checklist', icon: '☷', path: '/checklist' },
  { label: 'Settling in', icon: '⌖', path: '/checklist' },
  { label: 'Settings', icon: '⚙', path: '/' },
];

function parseArrivalDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Keep the server render and first browser render consistent.
  const isDesktop = mounted && width >= 760;
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [city, setCity] = useState('Stuttgart');
  const [arrivalDate, setArrivalDate] = useState('');
  const [stage, setStage] = useState('Before arriving');

  const parsedArrivalDate = parseArrivalDate(arrivalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilArrival = parsedArrivalDate
    ? Math.round((parsedArrivalDate.getTime() - today.getTime()) / 86400000)
    : null;
  const arrivalDateHasText = arrivalDate.trim().length > 0;
  const arrivalDateIsValid = !arrivalDateHasText || parsedArrivalDate !== null;

  const cities = [
    'Stuttgart',
    'Berlin',
    'Munich',
    'Frankfurt',
    'Hamburg',
    'Other city',
  ];

  const stages = [
    'Before arriving',
    'Just arrived',
    'Already living in Germany',
  ];

  function startChecklist() {
    if (!arrivalDateIsValid) return;
    router.push({
      pathname: '/checklist',
      params: { city, arrivalDate, stage },
    });
  }

  function navigate(path: string) {
    setMenuOpen(false);
    if (path !== pathname) router.push(path as any);
  }

  function Sidebar() {
    return (
      <View style={styles.sidebar}>
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => navigate('/')}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.brand}>Move to Germany</Text>
        </TouchableOpacity>

        <Text style={styles.navHeading}>YOUR JOURNEY</Text>

        {NAV_ITEMS.map((item) => {
          const active = item.path === pathname &&
            (item.label === 'Dashboard' || item.label === 'My checklist');

          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, active && styles.navActive]}
              onPress={() => navigate(item.path)}
            >
              <Text style={[styles.navIcon, active && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.sidebarBottom}>
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>A new beginning</Text>
            <Text style={styles.helpText}>
              One step at a time. You've got this.
            </Text>
          </View>
          <Text style={styles.sidebarFooter}>MADE FOR YOUR GERMANY JOURNEY</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.appLayout}>
        {isDesktop && <Sidebar />}

        {!isDesktop && menuOpen && (
          <View style={styles.mobileMenu}>
            <Sidebar />
          </View>
        )}

        <View style={styles.main}>
          {!isDesktop && (
            <View style={styles.mobileHeader}>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <Text style={styles.menuIcon}>
                  {menuOpen ? '✕' : '☰'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mobileBrand}
                onPress={() => navigate('/')}
              >
                <View style={styles.logo}>
                  <Text style={styles.logoText}>M</Text>
                </View>
                <Text style={styles.brand}>Move to Germany</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.contentInner}>
              <View style={styles.hero}>
                <Text style={styles.eyebrow}>
                  MADE FOR EVERYONE
                </Text>

                <Text style={styles.title}>
                  Germany is waiting.{' '}
                  <Text style={styles.green}>
                    Let's get you ready.
                  </Text>
                </Text>

                <Text style={styles.subtitle}>
                  Your personal guide to settling into Germany.
                  Know what to do, when to do it, and where to start.
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Let's personalise your journey
                </Text>
                <Text style={styles.cardSubtitle}>
                  A few details help us build your checklist.
                </Text>

                <Text style={styles.label}>YOUR DESTINATION CITY</Text>
                <View style={styles.cityGrid}>
                  {cities.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setCity(item)}
                      style={[
                        styles.cityOption,
                        city === item && styles.selectedOption,
                      ]}
                    >
                      <Text
                        style={[
                          styles.cityText,
                          city === item && styles.selectedText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>WHEN ARE YOU ARRIVING?</Text>
                <TextInput
                  value={arrivalDate}
                  onChangeText={setArrivalDate}
                  placeholder="YYYY-MM-DD (optional)"
                  placeholderTextColor="#8A918D"
                  style={styles.input}
                  maxLength={10}
                  keyboardType="numbers-and-punctuation"
                />
                {arrivalDateHasText && !arrivalDateIsValid && (
                  <Text style={styles.dateError}>Enter a valid date in YYYY-MM-DD format.</Text>
                )}
                {parsedArrivalDate && daysUntilArrival !== null && (
                  <View style={styles.countdownCard}>
                    <View style={styles.countdownNumberWrap}>
                      <Text style={styles.countdownNumber}>
                        {daysUntilArrival < 0 ? Math.abs(daysUntilArrival) : daysUntilArrival}
                      </Text>
                    </View>
                    <View style={styles.countdownTextWrap}>
                      <Text style={styles.countdownTitle}>
                        {daysUntilArrival > 0
                          ? 'days until your arrival'
                          : daysUntilArrival === 0
                            ? 'Your arrival day is today'
                            : 'days since your planned arrival'}
                      </Text>
                      <Text style={styles.countdownSubtitle}>
                        We’ll use this date to organise your preparation timeline.
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.label}>YOUR CURRENT STAGE</Text>
                <View style={styles.stageList}>
                  {stages.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setStage(item)}
                      style={[
                        styles.stageOption,
                        stage === item && styles.selectedOption,
                      ]}
                    >
                      <View style={styles.radio}>
                        {stage === item && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.stageText,
                          stage === item && styles.selectedText,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.button, !arrivalDateIsValid && styles.buttonDisabled]}
                  onPress={startChecklist}
                  disabled={!arrivalDateIsValid}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>
                    Build my checklist
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>

                <Text style={styles.privacy}>
                  No account needed. Your journey starts here.
                </Text>
              </View>

              <Text style={styles.footerText}>
                Built for your next chapter in Germany 🇩🇪
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateError: {
    color: '#B42318',
    fontSize: 12,
    marginTop: -15,
    marginBottom: 18,
  },
  countdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#F1F5EE',
    borderWidth: 1,
    borderColor: '#DDE8DA',
    marginTop: -10,
    marginBottom: 22,
  },
  countdownNumberWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: GREEN,
  },
  countdownTextWrap: {
    flex: 1,
  },
  countdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK,
    marginBottom: 4,
  },
  countdownSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: MUTED,
  },
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  appLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5EAE4',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 52,
    gap: 12,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  brand: {
    color: DARK,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  navHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#929B93',
    marginBottom: 14,
    marginLeft: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  navActive: {
    backgroundColor: '#E7F2E9',
  },
  navIcon: {
    width: 23,
    fontSize: 21,
    color: MUTED,
    textAlign: 'center',
  },
  navIconActive: {
    color: GREEN,
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#536057',
  },
  navTextActive: {
    color: GREEN,
    fontWeight: '800',
  },
  sidebarBottom: {
    marginTop: 'auto',
  },
  helpCard: {
    backgroundColor: '#F3F6F1',
    padding: 16,
    borderRadius: 15,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E7EDE5',
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: DARK,
    marginBottom: 7,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
  },
  sidebarFooter: {
    fontSize: 8,
    fontWeight: '800',
    color: '#89938B',
    letterSpacing: 0.5,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 40,
  },
  contentInner: {
    width: '100%',
    maxWidth: 680,
  },
  hero: {
    marginBottom: 32,
  },
  eyebrow: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -1.4,
  },
  green: {
    color: GREEN,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: MUTED,
    marginTop: 18,
    maxWidth: 500,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E5EAE3',
    shadowColor: '#183A25',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.045,
    shadowRadius: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#727B74',
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 21,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#58645B',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 23,
  },
  cityOption: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E1E6E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    backgroundColor: '#E5F1E7',
    borderColor: GREEN,
  },
  cityText: {
    fontSize: 13,
    color: '#48534B',
    fontWeight: '600',
  },
  selectedText: {
    color: GREEN,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E6E0',
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingVertical: 15,
    minHeight: 52,
    fontSize: 14,
    color: DARK,
    marginBottom: 23,
    backgroundColor: '#FBFCFA',
  },
  stageList: {
    gap: 9,
    marginBottom: 24,
  },
  stageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E6E0',
    backgroundColor: '#FFFFFF',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#AAB4AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: GREEN,
    borderRadius: 14,
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 17,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 10,
  },
  privacy: {
    textAlign: 'center',
    color: '#7A837C',
    fontSize: 11,
    marginTop: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#737D75',
    fontSize: 12,
    marginTop: 25,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAE4',
  },
  menuButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: BG,
  },
  menuIcon: {
    fontSize: 22,
    color: DARK,
  },
  mobileBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileMenu: {
    position: 'absolute',
    top: 66,
    bottom: 0,
    left: 0,
    zIndex: 10,
    elevation: 10,
    backgroundColor: '#FFFFFF',
  },
});
