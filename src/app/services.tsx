import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

const GREEN = '#176B45';
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';

type Resource = {
  category: string;
  title: string;
  description: string;
  url: string;
  label?: string;
};

const STUTTGART_RESOURCES: Resource[] = [
  {
    category: 'CITY REGISTRATION',
    title: 'Register your address (Anmeldung)',
    description:
      'Official Stuttgart guidance on registering your home, required documents and online options. Stuttgart guidance says registration is due within two weeks of moving in.',
    url: 'https://welcome.stuttgart.de/ankommen/anmelden',
    label: 'City of Stuttgart',
  },
  {
    category: 'RESIDENCE & IMMIGRATION',
    title: 'Ausländerbehörde: appointments and contact',
    description:
      'Find the correct contact route and appointment process for residence-related matters. Visits generally require an appointment confirmation.',
    url: 'https://www.stuttgart.de/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/auslaenderbehoerde-terminvereinbarung',
    label: 'City of Stuttgart',
  },
  {
    category: 'RESIDENCE & IMMIGRATION',
    title: 'Residence permit online applications',
    description:
      'Check which residence-related applications and supporting documents can be submitted online.',
    url: 'https://www.stuttgart.de/kontakt-und-antrag-auslaenderbehoerde',
    label: 'City of Stuttgart',
  },
  {
    category: 'UNIVERSITY SUPPORT',
    title: 'University of Stuttgart — International Office',
    description:
      'International student information, contact details and current consultation hours. Other universities have their own international offices.',
    url: 'https://www.uni-stuttgart.de/universitaet/international/service/',
    label: 'University of Stuttgart',
  },
];

const GENERAL_RESOURCES: Resource[] = [
  {
    category: 'HEALTHCARE',
    title: 'Find a doctor or book an appointment',
    description:
      'The official 116117 patient service provides a doctor search and appointment service for statutory-insurance patients.',
    url: 'https://www.116117.de/de/patientenservice.php',
    label: '116117 patient service',
  },
  {
    category: 'HEALTHCARE',
    title: 'Medical help when practices are closed',
    description:
      'Find out when the 116117 on-call service may help. For a life-threatening emergency, call 112.',
    url: 'https://www.116117.de/de/index.php',
    label: '116117 patient service',
  },
  {
    category: 'OFFICIAL INFORMATION',
    title: 'Make it in Germany',
    description:
      'Federal information for international students, workers and other people planning a stay in Germany.',
    url: 'https://www.make-it-in-germany.com/en/',
    label: 'Federal government portal',
  },
  {
    category: 'OFFICIAL INFORMATION',
    title: 'Service portal for Baden-Württemberg',
    description:
      'Look up state and local administrative services. Availability and process depend on your city and situation.',
    url: 'https://www.service-bw.de/',
    label: 'Baden-Württemberg',
  },
];

const CITIES = ['Stuttgart', 'Berlin', 'Munich', 'Frankfurt', 'Göttingen', 'Other city'];

export default function ServicesScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [city, setCity] = useState('Stuttgart');
  const [category, setCategory] = useState('ALL');
  const resources = useMemo(
    () => (city === 'Stuttgart' ? [...STUTTGART_RESOURCES, ...GENERAL_RESOURCES] : GENERAL_RESOURCES),
    [city],
  );
  const categories = ['ALL', ...Array.from(new Set(resources.map((item) => item.category)))];
  const filtered = category === 'ALL' ? resources : resources.filter((item) => item.category === category);

  async function openResource(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // Linking failures are handled silently; the user can try again.
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.page, isWide && styles.pageWide]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>MOVE TO GERMANY</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>OFFICIAL HELP, IN ONE PLACE</Text>
          <Text style={styles.title}>Appointments & services</Text>
          <Text style={styles.subtitle}>
            Shortcuts to city registration, immigration, university support and healthcare. Always check the official page for the latest requirements before travelling to an office.
          </Text>
        </View>

        <View style={styles.cityCard}>
          <Text style={styles.sectionLabel}>YOUR CITY</Text>
          <Text style={styles.cityIntro}>Choose where you live to see local links when available.</Text>
          <View style={styles.cityOptions}>
            {CITIES.map((item) => {
              const selected = city === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => { setCity(item); setCategory('ALL'); }}
                  style={[styles.cityOption, selected && styles.cityOptionSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.cityOptionText, selected && styles.cityOptionTextSelected]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {city !== 'Stuttgart' ? (
            <Text style={styles.cityNotice}>
              Local appointment links for {city} are not added yet. The general official resources below remain available; use your city’s official website for local registration and immigration procedures.
            </Text>
          ) : null}
        </View>

        <View style={styles.filterWrap}>
          <Text style={styles.sectionLabel}>BROWSE RESOURCES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            {categories.map((item) => {
              const selected = category === item;
              return (
                <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.filter, selected && styles.filterSelected]}>
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item === 'ALL' ? 'All' : item.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.resourceList}>
          {filtered.map((resource) => (
            <View key={resource.title} style={styles.resourceCard}>
              <Text style={styles.resourceCategory}>{resource.category}</Text>
              <Text style={styles.resourceTitle}>{resource.title}</Text>
              <Text style={styles.resourceDescription}>{resource.description}</Text>
              <Text style={styles.resourceSource}>{resource.label}</Text>
              <TouchableOpacity style={styles.openButton} onPress={() => openResource(resource.url)} accessibilityRole="link">
                <Text style={styles.openButtonText}>Open official website ↗</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Before you go</Text>
          <Text style={styles.noticeText}>
            Bring the documents listed by the relevant authority and verify whether an appointment is required. Procedures can differ by city, residence status and individual case. This app is a guide, not an authority or legal adviser.
          </Text>
        </View>
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/checklist')}>
          <Text style={styles.homeButtonText}>Return to my checklist</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  page: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48, width: '100%', maxWidth: 760, alignSelf: 'center' },
  pageWide: { paddingHorizontal: 32, paddingTop: 22 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 34 },
  backButton: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E1E8E0' },
  backButtonText: { color: GREEN, fontSize: 13, fontWeight: '700' },
  brand: { color: GREEN, fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  hero: { marginBottom: 24 },
  eyebrow: { color: GREEN, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  title: { color: DARK, fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: MUTED, fontSize: 14, lineHeight: 22, marginTop: 12 },
  cityCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E5EAE4', marginBottom: 24 },
  sectionLabel: { color: GREEN, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  cityIntro: { color: MUTED, fontSize: 13, lineHeight: 19, marginTop: 7, marginBottom: 14 },
  cityOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityOption: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#DCE5DB', backgroundColor: '#FFFFFF' },
  cityOptionSelected: { backgroundColor: '#E8F2E8', borderColor: GREEN },
  cityOptionText: { color: DARK, fontSize: 12, fontWeight: '600' },
  cityOptionTextSelected: { color: GREEN, fontWeight: '800' },
  cityNotice: { color: MUTED, backgroundColor: '#F5F7F2', borderRadius: 10, padding: 12, marginTop: 14, fontSize: 12, lineHeight: 18 },
  filterWrap: { marginBottom: 16 },
  filters: { gap: 8, paddingVertical: 12 },
  filter: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#DCE5DB', backgroundColor: '#FFFFFF' },
  filterSelected: { backgroundColor: GREEN, borderColor: GREEN },
  filterText: { color: DARK, fontSize: 12, fontWeight: '600' },
  filterTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  resourceList: { gap: 12 },
  resourceCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E5EAE4' },
  resourceCategory: { color: GREEN, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8 },
  resourceTitle: { color: DARK, fontSize: 18, lineHeight: 24, fontWeight: '800' },
  resourceDescription: { color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 8 },
  resourceSource: { color: '#7B857D', fontSize: 11, fontWeight: '700', marginTop: 10 },
  openButton: { marginTop: 14, alignSelf: 'flex-start', backgroundColor: '#E8F2E8', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 13 },
  openButtonText: { color: GREEN, fontSize: 12, fontWeight: '800' },
  noticeCard: { marginTop: 24, backgroundColor: '#FFF8E8', borderColor: '#F0E3C5', borderWidth: 1, borderRadius: 16, padding: 16 },
  noticeTitle: { color: DARK, fontSize: 15, fontWeight: '800' },
  noticeText: { color: MUTED, fontSize: 12, lineHeight: 19, marginTop: 7 },
  homeButton: { marginTop: 20, backgroundColor: GREEN, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  homeButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
