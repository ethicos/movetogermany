import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
    Linking,
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
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';

type FAQ = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sourceLabel: string;
  sourceUrl: string;
};

const FAQS: FAQ[] = [
  {
    id: 'blocked-account', category: 'Before arrival',
    question: 'How much money do I need to show for a student visa?',
    answer: 'The required proof of funds can change. The federal “Make it in Germany” study-visa page currently lists €11,904 for 2026 for a blocked account, scholarship or declaration of commitment may also be accepted. Check the German mission or Consular Services Portal responsible for your application before transferring money.',
    sourceLabel: 'Official study visa guidance', sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
  },
  {
    id: 'blocked-account-what', category: 'Before arrival',
    question: 'What is a blocked account (Sperrkonto)?',
    answer: 'It is an account used as proof that you can support yourself. Money is deposited in advance and only a permitted amount can usually be withdrawn each month. Providers charge different fees, so compare terms carefully and follow the amount and rules specified for your visa application.',
    sourceLabel: 'Federal Foreign Office', sourceUrl: 'https://www.auswaertiges-amt.de/en/visa-service/visabestimmungen-node/sperrkonto-seite',
  },
  {
    id: 'anmeldung', category: 'After arrival',
    question: 'When should I register my German address (Anmeldung)?',
    answer: 'Address registration rules and appointment processes depend on the municipality and your circumstances. Once you move into accommodation, check your city’s official registration page promptly for the applicable deadline, appointment process and documents. Do not rely on a generic deadline if your city gives specific instructions.',
    sourceLabel: 'Stuttgart registration information', sourceUrl: 'https://www.stuttgart.de/',
  },
  {
    id: 'health-insurance', category: 'Health insurance',
    question: 'Do international students need health insurance?',
    answer: 'Yes. Students enrolling at a state or state-recognised higher education institution must provide evidence of health insurance. The suitable route can depend on age, employment, previous insurance and whether statutory or private coverage applies. Confirm your eligibility with the insurer and university before enrollment.',
    sourceLabel: 'Federal health information portal', sourceUrl: 'https://gesund.bund.de/en/krankenversicherung-studierende',
  },
  {
    id: 'doctor', category: 'Health insurance',
    question: 'How do I find a family doctor (Hausarzt)?',
    answer: 'Use the official 116117 doctor search to look for practices and check their details. Contact a practice directly to ask whether it is accepting new patients and whether it accepts your insurance. For urgent situations, use the official 116117 service information; emergencies requiring immediate help should use the emergency number 112.',
    sourceLabel: '116117 doctor search', sourceUrl: 'https://arztsuche.116117.de/',
  },
  {
    id: 'residence-permit', category: 'After arrival',
    question: 'How do I apply for a residence permit after arriving?',
    answer: 'Follow the instructions of the foreigners authority responsible for your registered address. Required documents, online forms and appointment procedures vary by city. Start early, check the authority’s official page and keep proof of any application or appointment. A booking alone does not guarantee approval.',
    sourceLabel: 'Stuttgart residence-permit FAQ', sourceUrl: 'https://www.stuttgart.de/en/buergerinnen-und-buerger/migranten/informationen-der-auslaenderbehoerde/haeufig-gestellte-fragen-aufenthaltstitel',
  },
  {
    id: 'work', category: 'Work & study',
    question: 'How much can I work on a student residence permit?',
    answer: 'The general rules for international students include a 140-full-day or 280-half-day annual working-day account, with special rules for some student jobs and other circumstances. The legal rules can be nuanced, so check the conditions printed on your residence document and the current official guidance before accepting work. Self-employment is a separate issue and should not be assumed to be allowed.',
    sourceLabel: 'Official study visa and work guidance', sourceUrl: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
  },
  {
    id: 'enrolment', category: 'Work & study',
    question: 'What should I do if the university says my enrollment is incomplete?',
    answer: 'Read the message from your university and use its student portal or contact office to identify the missing item. Common items may include proof of insurance, payment of the semester contribution or requested documents, but the exact list and deadline are university-specific. Follow your university’s instructions rather than a general checklist.',
    sourceLabel: 'University of Stuttgart', sourceUrl: 'https://www.uni-stuttgart.de/en/study/',
  },
];

const CATEGORIES = ['All', 'Before arrival', 'After arrival', 'Health insurance', 'Work & study'];

export default function FAQScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>('blocked-account');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return FAQS.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesSearch = !term || `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const openLink = async (url: string) => {
    try { await Linking.openURL(url); } catch { /* Keep the app usable if a link cannot open. */ }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.page, isWide && styles.pageWide]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR GERMANY GUIDE</Text>
          <Text style={styles.title}>Student FAQ</Text>
          <Text style={styles.subtitle}>Straightforward answers to common questions for Indian students moving to Germany, with official sources to check the details.</Text>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Always verify the latest rules</Text>
            <Text style={styles.noticeText}>Visa conditions, deadlines, work permissions and local procedures can change. This guide is general information, not legal or immigration advice.</Text>
          </View>
        </View>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions, e.g. Anmeldung"
          placeholderTextColor="#7B857E"
          style={styles.search}
          accessibilityLabel="Search frequently asked questions"
          returnKeyType="search"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.filter, category === item && styles.filterActive]} accessibilityRole="button" accessibilityState={{ selected: category === item }}>
              <Text style={[styles.filterText, category === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.sectionTitle}>Common questions</Text>
          <Text style={styles.resultCount}>{filtered.length} found</Text>
        </View>

        {filtered.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <View key={item.id} style={styles.faqCard}>
              <TouchableOpacity style={styles.questionButton} onPress={() => setExpanded(isOpen ? null : item.id)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
                <View style={styles.questionCopy}>
                  <Text style={styles.categoryLabel}>{item.category.toUpperCase()}</Text>
                  <Text style={styles.question}>{item.question}</Text>
                </View>
                <Text style={styles.expandIcon}>{isOpen ? '−' : '+'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={styles.answerArea}>
                  <Text style={styles.answer}>{item.answer}</Text>
                  <TouchableOpacity style={styles.sourceButton} onPress={() => openLink(item.sourceUrl)} accessibilityRole="link">
                    <Text style={styles.sourceButtonText}>Read official guidance ↗</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matching questions</Text>
            <Text style={styles.emptyText}>Try another search term or choose “All”.</Text>
          </View>
        )}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Need help with your own situation?</Text>
          <Text style={styles.footerText}>Use the official link for your city, university or insurer. Requirements can differ between authorities and individual cases.</Text>
          <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/services')} accessibilityRole="button">
            <Text style={styles.footerButtonText}>Open appointments & services →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  page: { padding: 20, paddingBottom: 44, gap: 16 },
  pageWide: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 36 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12 },
  backText: { color: GREEN, fontWeight: '800', fontSize: 14 },
  hero: { marginBottom: 2 },
  eyebrow: { color: GREEN, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8 },
  title: { color: DARK, fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: MUTED, fontSize: 15, lineHeight: 23, marginTop: 10, maxWidth: 680 },
  notice: { backgroundColor: '#E8F2E8', borderColor: '#D5E6D6', borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 18 },
  noticeTitle: { color: DARK, fontSize: 14, fontWeight: '800', marginBottom: 5 },
  noticeText: { color: '#44564A', fontSize: 13, lineHeight: 19 },
  search: { backgroundColor: '#FFFFFF', borderColor: '#DCE4DC', borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: DARK },
  filters: { gap: 8, paddingBottom: 2 },
  filter: { borderWidth: 1, borderColor: '#DCE4DC', backgroundColor: '#FFFFFF', borderRadius: 30, paddingVertical: 9, paddingHorizontal: 13 },
  filterActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterText: { color: '#4D5A51', fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  sectionTitle: { color: DARK, fontSize: 20, fontWeight: '900' },
  resultCount: { color: MUTED, fontSize: 12, fontWeight: '700' },
  faqCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E7E0', borderRadius: 16, overflow: 'hidden' },
  questionButton: { flexDirection: 'row', alignItems: 'center', padding: 17, gap: 12 },
  questionCopy: { flex: 1 },
  categoryLabel: { color: GREEN, fontSize: 9, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7 },
  question: { color: DARK, fontSize: 15, lineHeight: 21, fontWeight: '800' },
  expandIcon: { color: GREEN, fontSize: 27, fontWeight: '500', paddingHorizontal: 3 },
  answerArea: { paddingHorizontal: 17, paddingBottom: 17, borderTopWidth: 1, borderTopColor: '#EEF1ED', paddingTop: 14 },
  answer: { color: '#46534A', fontSize: 14, lineHeight: 22 },
  sourceButton: { alignSelf: 'flex-start', backgroundColor: '#E8F2E8', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14 },
  sourceButtonText: { color: GREEN, fontSize: 12, fontWeight: '800' },
  emptyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E1E7E0' },
  emptyTitle: { color: DARK, fontWeight: '800', fontSize: 16 },
  emptyText: { color: MUTED, marginTop: 6, fontSize: 13 },
  footerCard: { backgroundColor: DARK, borderRadius: 18, padding: 20, marginTop: 8 },
  footerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  footerText: { color: '#D5DED7', fontSize: 13, lineHeight: 20, marginTop: 8 },
  footerButton: { alignSelf: 'flex-start', backgroundColor: '#DDF0DF', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 11, marginTop: 15 },
  footerButtonText: { color: GREEN, fontSize: 12, fontWeight: '900' },
});
