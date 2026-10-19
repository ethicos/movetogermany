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

const STORAGE_KEY = 'move-to-germany-documents-v1';
const GREEN = '#176B45';
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';

type DocumentStatus = 'Not started' | 'In progress' | 'Ready';
type DocumentItem = {
  id: string;
  title: string;
  description: string;
  stage: string;
  deadline: string;
  status: DocumentStatus;
  note: string;
};

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  { id: 'passport', title: 'Passport', description: 'Check validity and keep track of when it expires.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'visa', title: 'Visa / residence documents', description: 'Track your visa, appointment confirmation and any documents requested by the relevant authority.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'admission', title: 'University admission letter', description: 'Keep your admission letter and any conditions or enrollment instructions in order.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'finance', title: 'Proof of funds / blocked account', description: 'Track the documents required for your own visa or residence process.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'insurance', title: 'Health insurance certificate', description: 'Check which proof your university and immigration authority require.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'housing', title: 'Accommodation documents', description: 'Rental agreement, booking confirmation and landlord contact details.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'education', title: 'Academic certificates and transcripts', description: 'Prepare originals, copies and translations if specifically required.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'travel', title: 'Travel and arrival records', description: 'Keep flight details and important arrival information accessible.', stage: 'Before arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'registration', title: 'Address registration (Anmeldung)', description: 'Track your appointment and required paperwork, including the landlord confirmation where applicable.', stage: 'After arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'enrollment', title: 'University enrollment confirmation', description: 'Save the final enrollment confirmation and student number.', stage: 'After arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'bank', title: 'Banking and payment setup', description: 'Track account setup and any confirmation documents you receive.', stage: 'After arrival', deadline: '', status: 'Not started', note: '' },
  { id: 'permit', title: 'Residence permit appointment', description: 'Record the local authority appointment and the documents they request.', stage: 'After arrival', deadline: '', status: 'Not started', note: '' },
];

const STATUS_OPTIONS: DocumentStatus[] = ['Not started', 'In progress', 'Ready'];

export default function DocumentsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_DOCUMENTS);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Before arrival' | 'After arrival'>('All');
  const [expandedId, setExpandedId] = useState<string | null>('passport');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        try {
          const saved = JSON.parse(raw) as DocumentItem[];
          if (Array.isArray(saved)) {
            const savedById = new Map(saved.filter((item) => item && typeof item.id === 'string').map((item) => [item.id, item]));
            setDocuments(DEFAULT_DOCUMENTS.map((item) => ({ ...item, ...(savedById.get(item.id) ?? {}) })));
          }
        } catch {
          // Keep the safe default list if saved data cannot be parsed.
        }
      })
      .catch((error) => console.error('Could not load document tracker:', error))
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(documents)).catch((error) => {
      console.error('Could not save document tracker:', error);
    });
  }, [documents, ready]);

  const updateDocument = (id: string, changes: Partial<DocumentItem>) => {
    setDocuments((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  };

  const readyCount = documents.filter((item) => item.status === 'Ready').length;
  const progress = Math.round((readyCount / documents.length) * 100);
  const visibleDocuments = useMemo(
    () => documents.filter((item) => filter === 'All' || item.stage === filter),
    [documents, filter],
  );
  const overdueCount = documents.filter((item) => {
    if (!item.deadline.trim() || item.status === 'Ready') return false;
    const date = new Date(`${item.deadline}T23:59:59`);
    return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
  }).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.page, isWide && styles.pageWide]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>MOVE TO GERMANY</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>KEEP THE IMPORTANT THINGS IN ORDER</Text>
          <Text style={styles.title}>Document tracker</Text>
          <Text style={styles.subtitle}>Track important documents, their deadlines and your preparation status in one place.</Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Privacy first</Text>
          <Text style={styles.noticeText}>This feature stores document names, deadlines, status and notes on this device. It does not upload or securely store passport scans, visa files or other document images. Keep sensitive files in a secure location.</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressTextWrap}>
              <Text style={styles.cardTitle}>Documents ready</Text>
              <Text style={styles.muted}>{ready ? `${readyCount} of ${documents.length} marked ready` : 'Loading your saved tracker…'}</Text>
            </View>
            <Text style={styles.progressNumber}>{ready ? `${progress}%` : '—'}</Text>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
          {overdueCount > 0 ? <Text style={styles.overdueText}>{overdueCount} item(s) have a past deadline and are not marked ready. Check whether action is still needed.</Text> : null}
        </View>

        <View style={styles.filters}>
          {(['All', 'Before arrival', 'After arrival'] as const).map((item) => (
            <TouchableOpacity key={item} style={[styles.filterButton, filter === item && styles.filterButtonActive]} onPress={() => setFilter(item)} accessibilityRole="button" accessibilityState={{ selected: filter === item }}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {visibleDocuments.map((item) => {
          const expanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.documentCard}>
              <TouchableOpacity style={styles.documentHeader} onPress={() => setExpandedId(expanded ? null : item.id)} accessibilityRole="button" accessibilityState={{ expanded }}>
                <View style={styles.documentHeaderText}>
                  <View style={styles.stagePill}><Text style={styles.stagePillText}>{item.stage}</Text></View>
                  <Text style={styles.documentTitle}>{item.title}</Text>
                  <Text style={styles.documentDescription}>{item.description}</Text>
                </View>
                <View style={styles.statusBadgeWrap}><Text style={[styles.statusBadge, item.status === 'Ready' && styles.statusReady, item.status === 'In progress' && styles.statusInProgress]}>{item.status}</Text><Text style={styles.chevron}>{expanded ? '−' : '+'}</Text></View>
              </TouchableOpacity>

              {expanded ? (
                <View style={styles.editor}>
                  <Text style={styles.fieldLabel}>Preparation status</Text>
                  <View style={styles.statusOptions}>
                    {STATUS_OPTIONS.map((status) => (
                      <TouchableOpacity key={status} style={[styles.statusOption, item.status === status && styles.statusOptionActive]} onPress={() => updateDocument(item.id, { status })} accessibilityRole="button" accessibilityState={{ selected: item.status === status }}>
                        <Text style={[styles.statusOptionText, item.status === status && styles.statusOptionTextActive]}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.fieldLabel}>Deadline (optional)</Text>
                  <TextInput value={item.deadline} onChangeText={(deadline) => updateDocument(item.id, { deadline })} placeholder="YYYY-MM-DD" placeholderTextColor="#8A948C" style={styles.input} autoCapitalize="none" accessibilityLabel={`${item.title} deadline`} />
                  <Text style={styles.helperText}>Use YYYY-MM-DD, for example 2026-11-15. Verify actual deadlines with your university or the relevant authority.</Text>
                  <Text style={styles.fieldLabel}>Your note (optional)</Text>
                  <TextInput value={item.note} onChangeText={(note) => updateDocument(item.id, { note })} placeholder="e.g. Original in folder, copy needed" placeholderTextColor="#8A948C" style={[styles.input, styles.noteInput]} multiline textAlignVertical="top" accessibilityLabel={`${item.title} note`} />
                </View>
              ) : null}
            </View>
          );
        })}

        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/checklist')} accessibilityRole="button"><Text style={styles.secondaryButtonText}>← Back to checklist</Text></TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={() => setDocuments(DEFAULT_DOCUMENTS)} accessibilityRole="button"><Text style={styles.resetButtonText}>Reset tracker</Text></TouchableOpacity>
        </View>
        <Text style={styles.footerNote}>This is a planning aid, not legal advice or an official document checklist. Requirements depend on your circumstances and the authority handling your case.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  page: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 50, width: '100%', maxWidth: 820, alignSelf: 'center' },
  pageWide: { paddingHorizontal: 34, paddingTop: 28 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 34 },
  backButton: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 10, backgroundColor: '#E8EEE6' },
  backText: { color: GREEN, fontWeight: '800', fontSize: 13 },
  brand: { color: GREEN, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  hero: { marginBottom: 24 },
  eyebrow: { color: GREEN, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  title: { color: DARK, fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: MUTED, fontSize: 15, lineHeight: 23, marginTop: 10, maxWidth: 650 },
  notice: { backgroundColor: '#FFF8E8', borderColor: '#F1E0B5', borderWidth: 1, borderRadius: 16, padding: 17, marginBottom: 18 },
  noticeTitle: { color: '#805A12', fontSize: 14, fontWeight: '900', marginBottom: 5 },
  noticeText: { color: '#6D5B35', fontSize: 13, lineHeight: 20 },
  progressCard: { backgroundColor: '#FFFFFF', borderColor: '#E5EAE4', borderWidth: 1, borderRadius: 18, padding: 20, marginBottom: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  progressTextWrap: { flex: 1, gap: 5 },
  cardTitle: { color: DARK, fontSize: 17, fontWeight: '900' },
  muted: { color: MUTED, fontSize: 13 },
  progressNumber: { color: GREEN, fontSize: 27, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 10, backgroundColor: '#E5EBE4', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 10, backgroundColor: GREEN },
  overdueText: { color: '#9A4D18', fontSize: 12, lineHeight: 18, marginTop: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterButton: { borderRadius: 20, paddingVertical: 9, paddingHorizontal: 14, borderWidth: 1, borderColor: '#DCE4DB', backgroundColor: '#FFFFFF' },
  filterButtonActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterText: { color: MUTED, fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#FFFFFF' },
  documentCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5EAE4', borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  documentHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: 17 },
  documentHeaderText: { flex: 1 },
  stagePill: { alignSelf: 'flex-start', backgroundColor: '#E8F2E8', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, marginBottom: 8 },
  stagePillText: { color: GREEN, fontSize: 10, fontWeight: '900' },
  documentTitle: { color: DARK, fontSize: 16, lineHeight: 22, fontWeight: '900' },
  documentDescription: { color: MUTED, fontSize: 12, lineHeight: 18, marginTop: 5 },
  statusBadgeWrap: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { overflow: 'hidden', color: '#59645C', backgroundColor: '#EEF0ED', fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  statusReady: { color: '#176B45', backgroundColor: '#E0F2E5' },
  statusInProgress: { color: '#8A5B13', backgroundColor: '#FFF1D2' },
  chevron: { color: GREEN, fontSize: 21, fontWeight: '700' },
  editor: { borderTopWidth: 1, borderTopColor: '#EDF0EB', padding: 17, paddingTop: 14 },
  fieldLabel: { color: DARK, fontSize: 12, fontWeight: '900', marginTop: 9, marginBottom: 8 },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  statusOption: { borderRadius: 9, borderWidth: 1, borderColor: '#DCE4DB', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF' },
  statusOptionActive: { borderColor: GREEN, backgroundColor: '#E8F2E8' },
  statusOptionText: { color: MUTED, fontSize: 11, fontWeight: '800' },
  statusOptionTextActive: { color: GREEN },
  input: { minHeight: 44, borderWidth: 1, borderColor: '#DCE4DB', borderRadius: 10, backgroundColor: '#FCFDFC', paddingHorizontal: 12, paddingVertical: 10, color: DARK, fontSize: 14 },
  noteInput: { minHeight: 72 },
  helperText: { color: MUTED, fontSize: 11, lineHeight: 16, marginTop: 6 },
  footerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 14 },
  secondaryButton: { backgroundColor: GREEN, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 11 },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  resetButton: { paddingVertical: 12, paddingHorizontal: 12 },
  resetButtonText: { color: '#9A4D18', fontSize: 12, fontWeight: '800' },
  footerNote: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: 20 },
});
