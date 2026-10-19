import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const GREEN = '#176B45';
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';
const ARRIVAL_DATE_KEY = 'move-to-germany-arrival-planner-date';
const ARRIVAL_DONE_KEY = 'move-to-germany-arrival-planner-completed';

type PlannerTask = {
  id: string;
  title: string;
  description: string;
  phase: string;
  offset: number;
  timing: string;
  url?: string;
  linkLabel?: string;
};

const TASKS: PlannerTask[] = [
  { id: 'a1', title: 'Confirm your accommodation and arrival details', description: 'Save your address, landlord or residence contact, check-in instructions and rental documents.', phase: 'Before arrival', offset: -7, timing: 'Before travelling' },
  { id: 'a2', title: 'Keep essential documents together', description: 'Prepare your passport, visa, admission letter, financial evidence, insurance proof and university instructions.', phase: 'Before arrival', offset: -3, timing: 'Before travelling', url: 'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-studentenvisum-606690', linkLabel: 'Federal Foreign Office guidance' },
  { id: 'a3', title: 'Confirm health insurance and enrollment requirements', description: 'Ask your insurer and university which proof must be sent and how it will be transmitted.', phase: 'Before arrival', offset: -3, timing: 'Before travelling', url: 'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning', linkLabel: 'Official study guidance' },
  { id: 'a4', title: 'Check how to register your address', description: 'Find the responsible local registration office and check the local process, documents and appointment availability. Deadlines and procedures can vary by municipality.', phase: 'First week', offset: 3, timing: 'As soon as you have moved in', url: 'https://www.make-it-in-germany.com/en/living-in-germany/discover-germany/registration', linkLabel: 'Registration guidance' },
  { id: 'a5', title: 'Complete university enrollment steps', description: 'Check your student portal for missing documents, semester contributions, insurance notifications and enrollment deadlines.', phase: 'First week', offset: 5, timing: 'Follow your university deadline' },
  { id: 'a6', title: 'Set up essential daily services', description: 'Arrange a mobile connection, learn your local transport options and choose a secure way to pay rent and bills.', phase: 'First week', offset: 6, timing: 'During your first week' },
  { id: 'a7', title: 'Check your residence-permit requirements', description: 'Review your visa expiry date and check with the responsible local immigration authority whether and when you must apply. Do not treat this suggested date as an official deadline.', phase: 'First month', offset: 10, timing: 'Promptly; follow your visa and local authority instructions', url: 'https://www.make-it-in-germany.com/en/visa-residence/types/studying', linkLabel: 'Official student residence guidance' },
  { id: 'a8', title: 'Find a family doctor (Hausarzt)', description: 'Search nearby practices and ask whether they accept new patients and your type of insurance.', phase: 'First month', offset: 14, timing: 'When practical, before routine care is needed', url: 'https://arztsuche.116117.de/', linkLabel: 'Official doctor search' },
  { id: 'a9', title: 'Review your first month and remaining deadlines', description: 'Check university emails, local authority letters, rent payments, insurance membership and any outstanding documents.', phase: 'First month', offset: 30, timing: 'At the end of your first month' },
];

const PHASES = [
  { name: 'Before arrival', subtitle: 'Prepare the essentials before travelling.' },
  { name: 'First week', subtitle: 'Prioritise setup tasks after you arrive.' },
  { name: 'First month', subtitle: 'Follow up on local and university requirements.' },
];

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function dateWithOffset(date: Date, offset: number): string {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + offset);
  const year = next.getUTCFullYear();
  const month = String(next.getUTCMonth() + 1).padStart(2, '0');
  const day = String(next.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value: string): string {
  const parsed = parseDate(value);
  if (!parsed) return value;
  return `${String(parsed.getUTCDate()).padStart(2, '0')}.${String(parsed.getUTCMonth() + 1).padStart(2, '0')}.${parsed.getUTCFullYear()}`;
}

export default function ArrivalPlannerScreen() {
  const params = useLocalSearchParams<{ city?: string; arrivalDate?: string }>();
  const city = params.city || 'your German city';
  const [arrivalDate, setArrivalDate] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(ARRIVAL_DATE_KEY),
      AsyncStorage.getItem(ARRIVAL_DONE_KEY),
    ]).then(([savedDate, savedDone]) => {
      if (!active) return;
      setArrivalDate(savedDate || params.arrivalDate || '');
      try {
        const parsed: unknown = savedDone ? JSON.parse(savedDone) : [];
        setCompleted(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
      } catch {
        setCompleted([]);
      }
    }).catch((error) => {
      console.error('Could not load arrival planner:', error);
    }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, [params.arrivalDate]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(ARRIVAL_DATE_KEY, arrivalDate).catch((error) => console.error('Could not save arrival date:', error));
  }, [arrivalDate, ready]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(ARRIVAL_DONE_KEY, JSON.stringify(completed)).catch((error) => console.error('Could not save planner tasks:', error));
  }, [completed, ready]);

  const validArrivalDate = useMemo(() => parseDate(arrivalDate), [arrivalDate]);
  const doneCount = TASKS.filter((task) => completed.includes(task.id)).length;
  const progress = Math.round((doneCount / TASKS.length) * 100);

  function toggleTask(id: string) {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function openLink(url?: string) {
    if (!url) return;
    try { await Linking.openURL(url); } catch (error) { console.error('Could not open official link:', error); }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.brand}>MOVE TO GERMANY</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>YOUR FIRST 30 DAYS</Text>
            <Text style={styles.title}>Arrival planner</Text>
            <Text style={styles.subtitle}>A practical timeline for settling into {city}. Dates are planning suggestions, not official deadlines.</Text>
          </View>

          <View style={styles.dateCard}>
            <Text style={styles.sectionTitle}>When do you arrive?</Text>
            <Text style={styles.body}>Enter the date in YYYY-MM-DD format. Your suggested task dates update automatically.</Text>
            <TextInput
              value={arrivalDate}
              onChangeText={(value) => { setArrivalDate(value); setDateError(''); }}
              placeholder="2026-11-01"
              placeholderTextColor="#89948C"
              keyboardType="numbers-and-punctuation"
              autoCapitalize="none"
              style={styles.dateInput}
              accessibilityLabel="Arrival date in YYYY-MM-DD format"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={() => setDateError(parseDate(arrivalDate) ? '' : 'Enter a real date in YYYY-MM-DD format, for example 2026-11-01.')} accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Validate arrival date</Text>
            </TouchableOpacity>
            {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
            {validArrivalDate ? <Text style={styles.dateSuccess}>Arrival date saved: {formatDate(arrivalDate)}</Text> : <Text style={styles.helper}>Leave the date blank if you have not booked your trip yet.</Text>}
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressText}>
                <Text style={styles.progressTitle}>Your plan</Text>
                <Text style={styles.progressSubtitle}>{ready ? `${doneCount} of ${TASKS.length} tasks completed` : 'Loading saved progress…'}</Text>
              </View>
              <Text style={styles.percentage}>{ready ? `${progress}%` : '—'}</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
          </View>

          {PHASES.map((phase) => {
            const phaseTasks = TASKS.filter((task) => task.phase === phase.name);
            return (
              <View key={phase.name} style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>{phase.name}</Text>
                <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>
                {phaseTasks.map((task) => {
                  const isDone = completed.includes(task.id);
                  const suggestedDate = validArrivalDate ? dateWithOffset(validArrivalDate, task.offset) : '';
                  return (
                    <View key={task.id} style={[styles.taskCard, isDone && styles.taskDone]}>
                      <TouchableOpacity style={styles.checkButton} onPress={() => toggleTask(task.id)} accessibilityRole="checkbox" accessibilityState={{ checked: isDone }} accessibilityLabel={`${isDone ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}>
                        <View style={[styles.checkbox, isDone && styles.checkboxDone]}>{isDone ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                      </TouchableOpacity>
                      <View style={styles.taskBody}>
                        <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{task.title}</Text>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                        <View style={styles.timingBox}>
                          <Text style={styles.timingLabel}>SUGGESTED TIMING</Text>
                          <Text style={styles.timingText}>{task.timing}</Text>
                          {suggestedDate ? <Text style={styles.dateBadge}>Suggested date: {formatDate(suggestedDate)}</Text> : null}
                        </View>
                        {task.url && task.linkLabel ? <TouchableOpacity style={styles.linkButton} onPress={() => openLink(task.url)} accessibilityRole="link"><Text style={styles.linkText}>↗ {task.linkLabel}</Text></TouchableOpacity> : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Important</Text>
            <Text style={styles.noticeText}>This is a general planning aid, not legal or immigration advice. Local registration procedures, university deadlines and residence-permit rules vary. Always follow your university, visa conditions and the responsible local authority. A suggested date is not a guaranteed legal deadline.</Text>
          </View>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/checklist')} accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>← Return to full checklist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  page: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 18, alignItems: 'center' },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, gap: 12 },
  backButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#E7EEE7' },
  backText: { color: GREEN, fontWeight: '700', fontSize: 13 },
  brand: { color: GREEN, fontSize: 11, letterSpacing: 1.4, fontWeight: '800' },
  hero: { marginBottom: 24 },
  eyebrow: { color: GREEN, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
  title: { color: DARK, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1, marginBottom: 10 },
  subtitle: { color: MUTED, fontSize: 15, lineHeight: 23, maxWidth: 640 },
  dateCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E0E7DF', marginBottom: 20 },
  sectionTitle: { color: DARK, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  body: { color: MUTED, fontSize: 14, lineHeight: 21, marginBottom: 14 },
  dateInput: { backgroundColor: '#FAFBF8', borderWidth: 1, borderColor: '#D5DED4', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: DARK, fontSize: 16, marginBottom: 12 },
  primaryButton: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  errorText: { color: '#B42318', fontSize: 13, marginTop: 10 },
  dateSuccess: { color: GREEN, fontWeight: '700', fontSize: 13, marginTop: 12 },
  helper: { color: MUTED, fontSize: 12, marginTop: 12 },
  progressCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, marginBottom: 22, borderWidth: 1, borderColor: '#E5EAE4' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  progressText: { flex: 1 },
  progressTitle: { color: DARK, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  progressSubtitle: { color: MUTED, fontSize: 13 },
  percentage: { color: GREEN, fontSize: 24, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#E8EEE7', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: GREEN, borderRadius: 999 },
  phaseCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#E5EAE4', marginBottom: 18 },
  phaseTitle: { color: DARK, fontSize: 21, fontWeight: '800', marginBottom: 5 },
  phaseSubtitle: { color: MUTED, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  taskCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderTopWidth: 1, borderTopColor: '#E9EEE8', paddingTop: 16, paddingBottom: 14 },
  taskDone: { opacity: 0.72 },
  checkButton: { paddingTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 1.5, borderColor: '#B8C5B9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  checkboxDone: { backgroundColor: GREEN, borderColor: GREEN },
  checkmark: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  taskBody: { flex: 1, minWidth: 0 },
  taskTitle: { color: DARK, fontSize: 15, lineHeight: 21, fontWeight: '800', marginBottom: 6 },
  taskTitleDone: { textDecorationLine: 'line-through', color: MUTED },
  taskDescription: { color: MUTED, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  timingBox: { backgroundColor: '#F4F7F1', borderRadius: 10, padding: 11, marginBottom: 10 },
  timingLabel: { color: GREEN, fontSize: 9, letterSpacing: 1, fontWeight: '800', marginBottom: 5 },
  timingText: { color: DARK, fontSize: 12, lineHeight: 18 },
  dateBadge: { color: GREEN, fontSize: 12, fontWeight: '800', marginTop: 6 },
  linkButton: { alignSelf: 'flex-start', paddingVertical: 7 },
  linkText: { color: GREEN, fontSize: 12, fontWeight: '800' },
  notice: { backgroundColor: '#FFF7E8', borderColor: '#F0D7A5', borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 20 },
  noticeTitle: { color: '#805600', fontSize: 14, fontWeight: '800', marginBottom: 5 },
  noticeText: { color: '#6C5A38', fontSize: 12, lineHeight: 19 },
  secondaryButton: { alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#D5DED4', backgroundColor: '#FFFFFF', marginBottom: 28 },
  secondaryButtonText: { color: GREEN, fontSize: 14, fontWeight: '800' },
});
