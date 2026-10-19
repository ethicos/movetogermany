
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
    TouchableOpacity,
    View,
} from 'react-native';
import {
    loadCompletedTasks,
    saveCompletedTasks,
} from '../storage/checklistStorage';

const GREEN = '#176B45';
const BG = '#F5F7F2';
const DARK = '#18251E';
const MUTED = '#647067';
const INSURANCE_KEY = 'move-to-germany-insurance-provider';

type InsuranceProvider = {
  name: string;
  type: 'Statutory' | 'Private' | 'Other';
  description: string;
  url: string;
};

const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  {
    name: 'TK (Techniker Krankenkasse)',
    type: 'Statutory',
    description: 'Student information, services, and member support.',
    url: 'https://www.tk.de/en',
  },
  {
    name: 'AOK',
    type: 'Statutory',
    description: 'Choose the relevant regional AOK for your place of residence.',
    url: 'https://www.aok.de/',
  },
  {
    name: 'BARMER',
    type: 'Statutory',
    description: 'Student insurance information and member benefits.',
    url: 'https://www.barmer.de/en/students',
  },
  {
    name: 'DAK-Gesundheit',
    type: 'Statutory',
    description: 'Check student membership, benefits, and support.',
    url: 'https://www.dak.de/',
  },
  {
    name: 'Private insurance',
    type: 'Private',
    description: 'Benefits depend on your exact tariff and contract.',
    url: 'https://www.pkv.de/english/',
  },
  {
    name: 'Another statutory insurer',
    type: 'Other',
    description: 'Use your insurer’s official website or member app.',
    url: 'https://www.bundesgesundheitsministerium.de/en.html',
  },
];

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  stage: string;
  priority: 'High' | 'Medium' | 'Low';
  timing: string;
  resourceLabel?: string;
  resourceUrl?: string;
};

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Prepare your university documents',
    description:
      'Check your admission letter, certificates, enrollment instructions, and any documents your university requests.',
    category: 'University',
    stage: 'Before arriving',
    priority: 'High',
    timing: 'Before your university deadline',
    resourceLabel: 'Government study guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning',
  },
  {
    id: '2',
    title: 'Check your health insurance requirements',
    description:
      'Confirm which insurance cover is accepted for your situation and obtain the proof required for enrollment.',
    category: 'Health',
    stage: 'Before arriving',
    priority: 'High',
    timing: 'Before enrollment',
    resourceLabel: 'Government study guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning',
  },
  {
    id: '3',
    title: 'Arrange accommodation',
    description:
      'Confirm your housing arrangements and keep your rental contract and accommodation details accessible.',
    category: 'Housing',
    stage: 'Before arriving',
    priority: 'High',
    timing: 'Before travelling',
    resourceLabel: 'Government study guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning',
  },
  {
    id: '4',
    title: 'Prepare your arrival documents',
    description:
      'Keep your passport, visa, admission letter, financial evidence, and accommodation details accessible.',
    category: 'Documents',
    stage: 'Before arriving',
    priority: 'High',
    timing: 'Before travelling',
    resourceLabel: 'Federal Foreign Office',
    resourceUrl:
      'https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-studentenvisum-606690',
  },
  {
    id: '5',
    title: 'Register your address',
    description:
      'Find your local Bürgeramt or registration office. Check appointment availability and which documents are required.',
    category: 'Administration',
    stage: 'Just arrived',
    priority: 'High',
    timing: 'Check the local deadline immediately after moving in',
    resourceLabel: 'Government arrival guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning',
  },
  {
    id: '6',
    title: 'Complete university enrollment',
    description:
      'Review your university portal and submit any outstanding documents, payments, or enrollment requirements.',
    category: 'University',
    stage: 'Just arrived',
    priority: 'High',
    timing: 'By your university deadline',
    resourceLabel: 'Government study guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning',
  },
  {
    id: '7',
    title: 'Understand your residence permit process',
    description:
      'Check whether you need a residence permit, which authority is responsible, and when you must apply.',
    category: 'Administration',
    stage: 'Just arrived',
    priority: 'High',
    timing: 'Check your visa expiry and local requirements promptly',
    resourceLabel: 'Government student visa guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/visa-residence/types/studying',
  },
  {
    id: '8',
    title: 'Explore German banking options',
    description:
      'Compare account fees and eligibility. Check which identification and address documents each bank requires.',
    category: 'Finance',
    stage: 'Just arrived',
    priority: 'Medium',
    timing: 'After arrival, as needed',
    resourceLabel: 'Government study guide',
    resourceUrl:
      'https://www.make-it-in-germany.com/en/study-vocational-training/studies-in-germany/planning',
  },
  {
    id: '9',
    title: 'Learn local public transport',
    description:
      'Check local tickets, routes, and student discounts. Compare options for your regular journeys.',
    category: 'Daily life',
    stage: 'Just arrived',
    priority: 'Low',
    timing: 'During your first week',
  },
  {
    id: '10',
    title: 'Save important emergency contacts',
    description:
      'Save emergency numbers, your university support contacts, your accommodation contact, and your insurer.',
    category: 'Daily life',
    stage: 'Already living in Germany',
    priority: 'Medium',
    timing: 'As soon as possible',
  },
  {
    id: '11',
    title: 'Find a family doctor (Hausarzt)',
    description:
      'Search for a nearby general practice and ask whether it accepts new patients and your type of insurance. You can say: „Guten Tag, nehmen Sie neue Patienten auf? Ich bin bei [insurer] versichert und möchte einen Termin vereinbaren.“ Bring your health insurance card, ID, and a list of medicines or relevant medical records.',
    category: 'Health',
    stage: 'Just arrived',
    priority: 'Medium',
    timing: 'During your first weeks, before you need routine care',
    resourceLabel: 'Official 116117 doctor search',
    resourceUrl: 'https://arztsuche.116117.de/',
  },
  {
    id: '12',
    title: 'Check what your health insurance covers',
    description:
      'Ask your insurer for a benefits overview and how to access care. Statutory insurance (GKV) covers a defined range of medically necessary services; private insurance (PKV) depends on your specific tariff and contract. Confirm coverage and any co-payment before planned or optional treatment.',
    category: 'Health',
    stage: 'Before arriving',
    priority: 'High',
    timing: 'Before enrollment or as soon as your insurance is active',
    resourceLabel: 'Federal Ministry of Health',
    resourceUrl: 'https://www.bundesgesundheitsministerium.de/en.html',
  },
  {
    id: '13',
    title: 'Check preventive check-ups and screenings',
    description:
      'Ask your insurer which preventive check-ups and screenings you are eligible for based on your age, health needs, and insurance. Some services are covered only at specified ages or intervals; optional check-ups may cost extra.',
    category: 'Health',
    stage: 'Already living in Germany',
    priority: 'Low',
    timing: 'When your insurance is active; check eligibility before booking',
    resourceLabel: 'Federal Joint Committee (G-BA)',
    resourceUrl: 'https://www.g-ba.de/english/',
  },
  {
    id: '14',
    title: 'Check vaccination coverage',
    description:
      'Review your vaccination record with a doctor and ask your insurer whether recommended vaccinations are covered. Routine vaccinations and travel vaccinations may be treated differently, so confirm the specific vaccine and any reimbursement rules first.',
    category: 'Health',
    stage: 'Just arrived',
    priority: 'Medium',
    timing: 'During your first medical appointment or before travel',
    resourceLabel: 'Robert Koch Institute vaccination information',
    resourceUrl: 'https://www.rki.de/EN/Content/infections/Vaccination/vaccination_node.html',
  },
  {
    id: '15',
    title: 'Understand dental benefits and possible costs',
    description:
      'Ask your insurer what routine dental check-ups and necessary treatments are covered. Professional teeth cleaning and some materials or treatments may not be fully covered by statutory insurance; private plans differ. Request a cost estimate before agreeing to non-urgent treatment.',
    category: 'Health',
    stage: 'Already living in Germany',
    priority: 'Low',
    timing: 'Before booking optional dental treatments',
    resourceLabel: 'Federal Ministry of Health',
    resourceUrl: 'https://www.bundesgesundheitsministerium.de/en.html',
  },
  {
    id: '16',
    title: 'Explore your insurer’s extra benefits and bonus programmes',
    description:
      'Check your insurer’s own website or app for health courses, bonus programmes, refunds, and additional services. These vary between insurers and plans, and may require participation, receipts, prior approval, or a minimum activity threshold. Do not assume an advertised benefit is automatically free.',
    category: 'Health',
    stage: 'Already living in Germany',
    priority: 'Low',
    timing: 'After your insurance membership is confirmed',
    resourceLabel: 'BARMER student information',
    resourceUrl: 'https://www.barmer.de/en/students',
  },
  {
    id: '17',
    title: 'Know where to get urgent medical help',
    description:
      'Call 112 for a life-threatening emergency. For urgent medical problems that are not life-threatening, call 116117 or use its website to find out-of-hours medical care. For routine concerns, contact your Hausarzt. The 116117 service is primarily for statutory-insurance patients.',
    category: 'Health',
    stage: 'Just arrived',
    priority: 'High',
    timing: 'Save these contacts as soon as you arrive',
    resourceLabel: 'Official 116117 service',
    resourceUrl: 'https://www.116117.de/',
  },
];

const FILTERS = [
  'All',
  'University',
  'Administration',
  'Housing',
  'Health',
  'Documents',
  'Finance',
  'Daily life',
];

const STAGE_ORDER = [
  'Before arriving',
  'Just arrived',
  'Already living in Germany',
];

const TIMELINE_GROUPS = [
  {
    stage: 'Before arriving',
    title: '1. Before arrival',
    subtitle: 'Prepare essentials before you travel.',
  },
  {
    stage: 'Just arrived',
    title: '2. Your first week',
    subtitle: 'Handle important setup tasks after landing.',
  },
  {
    stage: 'Already living in Germany',
    title: '3. Your first month and beyond',
    subtitle: 'Build routines and check ongoing benefits.',
  },
];

export default function ChecklistScreen() {
  const params = useLocalSearchParams<{
    city?: string;
    arrivalDate?: string;
    stage?: string;
  }>();

  const city = params.city || 'Germany';
  const stage = params.stage || 'Before arriving';

  const [completed, setCompleted] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [insuranceReady, setInsuranceReady] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(INSURANCE_KEY)
      .then((savedProvider) => {
        if (active && savedProvider) setSelectedInsurance(savedProvider);
      })
      .catch((error) => {
        console.error('Could not load insurance selection:', error);
      })
      .finally(() => {
        if (active) setInsuranceReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!insuranceReady) return;

    const saveSelection = async () => {
      try {
        if (selectedInsurance) {
          await AsyncStorage.setItem(INSURANCE_KEY, selectedInsurance);
        } else {
          await AsyncStorage.removeItem(INSURANCE_KEY);
        }
      } catch (error) {
        console.error('Could not save insurance selection:', error);
      }
    };

    saveSelection();
  }, [selectedInsurance, insuranceReady]);

  useEffect(() => {
    let active = true;

    loadCompletedTasks()
      .then((ids) => {
        if (active) setCompleted(ids);
      })
      .catch((error) => {
        console.error('Could not load saved tasks:', error);
      })
      .finally(() => {
        if (active) setStorageReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    saveCompletedTasks(completed).catch((error) => {
      console.error('Could not save completed tasks:', error);
    });
  }, [completed, storageReady]);

  const relevantTasks = useMemo(() => {
    const selectedIndex = Math.max(0, STAGE_ORDER.indexOf(stage));

    return TASKS.filter(
      (task) => STAGE_ORDER.indexOf(task.stage) >= selectedIndex,
    );
  }, [stage]);

  const filteredTasks = relevantTasks.filter((task) => {
    const matchesCategory =
      filter === 'All' || task.category === filter;
    const matchesCompletion =
      showCompleted || !completed.includes(task.id);

    return matchesCategory && matchesCompletion;
  });

  const doneCount = relevantTasks.filter((task) =>
    completed.includes(task.id),
  ).length;

  const progress =
    relevantTasks.length === 0
      ? 0
      : Math.round((doneCount / relevantTasks.length) * 100);

  function toggleTask(id: string) {
    if (!storageReady) return;

    setCompleted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function openResource(url?: string) {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Could not open resource:', error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => router.replace('/')}
              style={styles.backButton}
              accessibilityRole="button"
            >
              <Text style={styles.backText}>← Home</Text>
            </TouchableOpacity>

            <Text style={styles.brand}>MOVE TO GERMANY</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.eyebrow}>YOUR PERSONAL PLAN</Text>
            <Text style={styles.title}>Your Germany checklist</Text>
            <Text style={styles.subtitle}>
              A practical starting point for your journey to {city}.
            </Text>
            {params.arrivalDate ? (
              <Text style={styles.arrivalDate}>
                Planned arrival: {params.arrivalDate}
              </Text>
            ) : null}
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressText}>
                <Text style={styles.progressTitle}>Your progress</Text>
                <Text style={styles.progressSubtitle}>
                  {storageReady
                    ? `${doneCount} of ${relevantTasks.length} tasks completed`
                    : 'Loading your saved progress...'}
                </Text>
              </View>

              <Text style={styles.percentage}>
                {storageReady ? `${progress}%` : '—'}
              </Text>
            </View>

            <View
              style={styles.progressTrack}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: progress,
              }}
            >
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.budgetShortcut}
            onPress={() => router.push('/budget')}
            accessibilityRole="button"
          >
            <View style={styles.budgetShortcutTextWrap}>
              <Text style={styles.budgetShortcutEyebrow}>PLAN YOUR MONEY</Text>
              <Text style={styles.budgetShortcutTitle}>Student budget planner</Text>
              <Text style={styles.budgetShortcutSubtitle}>
                Estimate monthly living costs and your arrival budget.
              </Text>
            </View>
            <Text style={styles.budgetShortcutArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.documentsShortcut}
            onPress={() => router.push('/documents')}
            accessibilityRole="button"
          >
            <View style={styles.documentsShortcutTextWrap}>
              <Text style={styles.documentsShortcutEyebrow}>KEEP THINGS ORGANIZED</Text>
              <Text style={styles.documentsShortcutTitle}>Document tracker</Text>
              <Text style={styles.documentsShortcutSubtitle}>
                Track passports, university papers, insurance records and deadlines.
              </Text>
            </View>
            <Text style={styles.documentsShortcutArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.servicesShortcut}
            onPress={() => router.push('/services')}
            accessibilityRole="button"
          >
            <View style={styles.documentsShortcutTextWrap}>
              <Text style={styles.documentsShortcutEyebrow}>OFFICIAL HELP</Text>
              <Text style={styles.documentsShortcutTitle}>Appointments & services</Text>
              <Text style={styles.documentsShortcutSubtitle}>
                Find city registration, immigration, university and healthcare links.
              </Text>
            </View>
            <Text style={styles.documentsShortcutArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.faqShortcut}
            onPress={() => router.push('/faq')}
            accessibilityRole="button"
          >
            <View style={styles.documentsShortcutTextWrap}>
              <Text style={styles.documentsShortcutEyebrow}>QUICK ANSWERS</Text>
              <Text style={styles.documentsShortcutTitle}>Student FAQ</Text>
              <Text style={styles.documentsShortcutSubtitle}>
                Search common questions about visas, Anmeldung, insurance and student work.
              </Text>
            </View>
            <Text style={styles.documentsShortcutArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrivalShortcut}
            onPress={() => router.push({ pathname: '/arrival', params: { city, arrivalDate: params.arrivalDate || '' } })}
            accessibilityRole="button"
          >
            <View style={styles.documentsShortcutTextWrap}>
              <Text style={styles.documentsShortcutEyebrow}>YOUR FIRST 30 DAYS</Text>
              <Text style={styles.documentsShortcutTitle}>Arrival planner</Text>
              <Text style={styles.documentsShortcutSubtitle}>
                Build a date-based plan for registration, enrollment and settling in.
              </Text>
            </View>
            <Text style={styles.documentsShortcutArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.jobsShortcut}
            onPress={() => router.push('/jobs')}
            accessibilityRole="button"
          >
            <View style={styles.documentsShortcutTextWrap}>
              <Text style={styles.documentsShortcutEyebrow}>WORK & CAREER</Text>
              <Text style={styles.documentsShortcutTitle}>Student job planner</Text>
              <Text style={styles.documentsShortcutSubtitle}>
                Prepare applications, explore official job sources and check work conditions.
              </Text>
            </View>
            <Text style={styles.documentsShortcutArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.insuranceCard}>
            <Text style={styles.insuranceEyebrow}>HEALTH & INSURANCE</Text>
            <Text style={styles.insuranceTitle}>Which health insurer do you use?</Text>
            <Text style={styles.insuranceIntro}>
              Choose your provider to keep its official information handy. Your
              selection is saved on this device.
            </Text>

            <View style={styles.insuranceOptions}>
              {INSURANCE_PROVIDERS.map((provider) => {
                const selected = selectedInsurance === provider.name;

                return (
                  <TouchableOpacity
                    key={provider.name}
                    style={[
                      styles.insuranceOption,
                      selected && styles.insuranceOptionSelected,
                    ]}
                    onPress={() => setSelectedInsurance(provider.name)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.insuranceOptionText}>
                      <Text
                        style={[
                          styles.insuranceProviderName,
                          selected && styles.insuranceProviderNameSelected,
                        ]}
                      >
                        {provider.name}
                      </Text>
                      <Text style={styles.insuranceProviderDescription}>
                        {provider.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.insuranceRadio,
                        selected && styles.insuranceRadioSelected,
                      ]}
                    >
                      {selected ? <View style={styles.insuranceRadioInner} /> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedInsurance ? (
              <View style={styles.insuranceSelectedInfo}>
                <Text style={styles.insuranceSelectedTitle}>
                  Selected: {selectedInsurance}
                </Text>
                <Text style={styles.insuranceSelectedDescription}>
                  Check your personal benefits before booking optional services.
                  Coverage, co-payments, and reimbursement rules depend on your
                  membership and, for private insurance, your contract.
                </Text>
                <TouchableOpacity
                  style={styles.insuranceLinkButton}
                  onPress={() => {
                    const provider = INSURANCE_PROVIDERS.find(
                      (item) => item.name === selectedInsurance,
                    );
                    if (provider) openResource(provider.url);
                  }}
                  accessibilityRole="link"
                >
                  <Text style={styles.insuranceLinkText}>
                    ↗ Open official provider information
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.insuranceHint}>
                Select an insurer to show a link to its official information.
              </Text>
            )}
          </View>

          <View style={styles.comparisonCard}>
            <Text style={styles.insuranceEyebrow}>2026 STUDENT COMPARISON</Text>
            <Text style={styles.insuranceTitle}>Compare statutory insurers</Text>
            <Text style={styles.insuranceIntro}>
              Example monthly totals for a student aged 23 or older with no children.
              Amounts are published 2026 figures; confirm your personal rate with the insurer.
            </Text>

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonProvider}>
                <Text style={styles.comparisonName}>TK</Text>
                <Text style={styles.comparisonDetail}>Digital services and bonus programme</Text>
              </View>
              <Text style={styles.comparisonPrice}>€146.29/mo</Text>
            </View>
            <TouchableOpacity
              onPress={() => openResource('https://www.tk.de/en/contribution-foreign-students-german-health-insurance-2038022')}
              style={styles.comparisonLink}
              accessibilityRole="link"
            >
              <Text style={styles.insuranceLinkText}>Official TK student costs ↗</Text>
            </TouchableOpacity>

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonProvider}>
                <Text style={styles.comparisonName}>AOK Baden-Württemberg</Text>
                <Text style={styles.comparisonDetail}>Regional insurer; check local services and extras</Text>
              </View>
              <Text style={styles.comparisonPrice}>€148.85/mo</Text>
            </View>
            <TouchableOpacity
              onPress={() => openResource('https://www.aok.de/pk/krankenkassenbeitraege/studenten-client-bw/')}
              style={styles.comparisonLink}
              accessibilityRole="link"
            >
              <Text style={styles.insuranceLinkText}>Official AOK Baden-Württemberg costs ↗</Text>
            </TouchableOpacity>

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonProvider}>
                <Text style={styles.comparisonName}>BARMER</Text>
                <Text style={styles.comparisonDetail}>English support and bonus programme</Text>
              </View>
              <Text style={styles.comparisonPrice}>€151.42/mo</Text>
            </View>
            <TouchableOpacity
              onPress={() => openResource('https://www.barmer.de/unsere-leistungen/beitraege-tarife/krankenversicherung-studierende')}
              style={styles.comparisonLink}
              accessibilityRole="link"
            >
              <Text style={styles.insuranceLinkText}>Official BARMER student costs ↗</Text>
            </TouchableOpacity>

            <View style={styles.comparisonNote}>
              <Text style={styles.comparisonNoteText}>
                Important: this is a price snapshot, not a ranking. Core statutory benefits are broadly similar; extra benefits and eligibility rules differ. Some treatments also involve co-payments. Always check the current terms before choosing.
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <Text style={styles.sectionTitle}>Your tasks</Text>
              <Text style={styles.sectionSubtitle}>
                Start with the high-priority items.
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowCompleted((current) => !current)}
              accessibilityRole="button"
            >
              <Text style={styles.filterCompleted}>
                {showCompleted ? 'Hide completed' : 'Show completed'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterChip,
                  filter === item && styles.filterSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === item }}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.taskList}>
            {TIMELINE_GROUPS.map((group) => {
              const groupTasks = filteredTasks.filter(
                (task) => task.stage === group.stage,
              );

              if (groupTasks.length === 0) return null;

              return (
                <View key={group.stage} style={styles.timelineGroup}>
                  <View style={styles.timelineHeading}>
                    <Text style={styles.timelineTitle}>{group.title}</Text>
                    <Text style={styles.timelineSubtitle}>{group.subtitle}</Text>
                    <Text style={styles.timelineCount}>
                      {groupTasks.filter((task) => completed.includes(task.id)).length} of {groupTasks.length} complete
                    </Text>
                  </View>
                  <View style={styles.timelineTasks}>
                    {groupTasks.map((task) => {
                      const isDone = completed.includes(task.id);

                      return (
                        <View
                          key={task.id}
                          style={[styles.taskCard, isDone && styles.taskDone]}
                        >
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => toggleTask(task.id)}
                    disabled={!storageReady}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isDone }}
                    accessibilityLabel={`Mark ${task.title} ${
                      isDone ? 'incomplete' : 'complete'
                    }`}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isDone && styles.checkboxDone,
                      ]}
                    >
                      {isDone && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  <View style={styles.taskBody}>
                    <View style={styles.taskMeta}>
                      <Text style={styles.category}>{task.category}</Text>
                      <Text
                        style={[
                          styles.priority,
                          task.priority === 'High' && styles.highPriority,
                          task.priority === 'Low' && styles.lowPriority,
                        ]}
                      >
                        {task.priority} priority
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.taskTitle,
                        isDone && styles.taskTitleDone,
                      ]}
                    >
                      {task.title}
                    </Text>

                    <Text style={styles.taskDescription}>
                      {task.description}
                    </Text>

                    <View style={styles.timingBox}>
                      <Text style={styles.timingLabel}>
                        SUGGESTED TIMING
                      </Text>
                      <Text style={styles.timingText}>{task.timing}</Text>
                    </View>

                    <Text style={styles.stageLabel}>{task.stage}</Text>

                    {task.resourceUrl && task.resourceLabel ? (
                      <TouchableOpacity
                        style={styles.resourceButton}
                        onPress={() => openResource(task.resourceUrl)}
                        accessibilityRole="link"
                      >
                        <Text style={styles.resourceText}>
                          ↗ {task.resourceLabel}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {filteredTasks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nothing to show</Text>
                <Text style={styles.emptyText}>
                  Try another category or show completed tasks.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Important about deadlines</Text>
            <Text style={styles.noticeText}>
              Suggested timings are reminders, not legal deadlines. For
              example, the general address-registration deadline is often
              two weeks after moving in, but rules and exceptions can vary.
              Confirm the applicable deadline with your local registration
              office. Follow your university's deadlines and your own visa
              or residence-permit conditions.
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            This is a starter checklist, not a definitive legal or immigration
            guide. External resources may change. Verify important requirements
            with the responsible authority and your university.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  page: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE5DC',
  },
  backText: {
    color: GREEN,
    fontWeight: '700',
    fontSize: 13,
  },
  brand: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '800',
    color: MUTED,
  },
  hero: {
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    color: DARK,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 10,
    color: MUTED,
    fontSize: 15,
    lineHeight: 23,
  },
  arrivalDate: {
    marginTop: 8,
    color: GREEN,
    fontSize: 13,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E3E9E1',
    marginBottom: 28,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  progressText: {
    gap: 5,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: DARK,
  },
  progressSubtitle: {
    fontSize: 13,
    color: MUTED,
  },
  percentage: {
    fontSize: 28,
    fontWeight: '800',
    color: GREEN,
  },
  progressTrack: {
    height: 9,
    borderRadius: 10,
    backgroundColor: '#E5EBE4',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 10,
  },
  budgetShortcut: {
    backgroundColor: '#E8F2E8',
    borderRadius: 20,
    padding: 22,
    marginTop: -8,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D7E7D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  budgetShortcutTextWrap: {
    flex: 1,
  },
  budgetShortcutEyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  budgetShortcutTitle: {
    color: DARK,
    fontSize: 18,
    fontWeight: '800',
  },
  budgetShortcutSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  budgetShortcutArrow: {
    color: GREEN,
    fontSize: 27,
    fontWeight: '700',
  },
  documentsShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 0,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D7E7D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  documentsShortcutTextWrap: { flex: 1 },
  documentsShortcutEyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 7,
  },
  documentsShortcutTitle: { color: DARK, fontSize: 18, fontWeight: '800' },
  documentsShortcutSubtitle: { color: MUTED, fontSize: 13, lineHeight: 19, marginTop: 6 },
  documentsShortcutArrow: { color: GREEN, fontSize: 27, fontWeight: '700' },
  servicesShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 0,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D7E7D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  faqShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 0,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D7E7D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  arrivalShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 0,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D7E7D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  jobsShortcut: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginTop: 0,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#D7E7D8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  insuranceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E3E9E1',
    marginBottom: 24,
  },
  insuranceEyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  insuranceTitle: {
    color: DARK,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
  },
  insuranceIntro: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 15,
  },
  insuranceOptions: {
    gap: 8,
  },
  insuranceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E6E0',
    backgroundColor: '#FFFFFF',
  },
  insuranceOptionSelected: {
    borderColor: GREEN,
    backgroundColor: '#F0F6F0',
  },
  insuranceOptionText: {
    flex: 1,
    minWidth: 0,
  },
  insuranceProviderName: {
    color: DARK,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
  },
  insuranceProviderNameSelected: {
    color: GREEN,
  },
  insuranceProviderDescription: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  insuranceRadio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#AAB6AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insuranceRadioSelected: {
    borderColor: GREEN,
  },
  insuranceRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  insuranceSelectedInfo: {
    backgroundColor: '#F5F7F2',
    borderRadius: 12,
    padding: 13,
    marginTop: 14,
  },
  insuranceSelectedTitle: {
    color: DARK,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '800',
  },
  insuranceSelectedDescription: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  insuranceLinkButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#E5F1E7',
  },
  insuranceLinkText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  insuranceHint: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E3E9E1',
    marginBottom: 24,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#E9EDE8',
  },
  comparisonProvider: {
    flex: 1,
    minWidth: 0,
  },
  comparisonName: {
    color: DARK,
    fontSize: 13,
    fontWeight: '800',
  },
  comparisonDetail: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  comparisonPrice: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  comparisonLink: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    paddingVertical: 5,
  },
  comparisonNote: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF8E8',
  },
  comparisonNoteText: {
    color: '#665A40',
    fontSize: 11,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 17,
  },
  sectionTitleArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: DARK,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  filterCompleted: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
  },
  filters: {
    gap: 8,
    paddingBottom: 18,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDE4DC',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  filterSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  taskList: {
    gap: 22,
  },
  timelineGroup: {
    gap: 12,
  },
  timelineHeading: {
    paddingHorizontal: 2,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE4DC',
  },
  timelineTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: '800',
  },
  timelineSubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  timelineCount: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 7,
  },
  timelineTasks: {
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8E1',
    backgroundColor: '#FFFFFF',
  },
  taskDone: {
    backgroundColor: '#F0F5EF',
  },
  checkButton: {
    paddingTop: 2,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#AAB6AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  taskBody: {
    flex: 1,
    minWidth: 0,
  },
  taskMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },
  category: {
    color: GREEN,
    backgroundColor: '#E5F1E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '800',
  },
  priority: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
  },
  highPriority: {
    color: '#A45127',
  },
  lowPriority: {
    color: '#647067',
  },
  taskTitle: {
    color: DARK,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  taskTitleDone: {
    color: MUTED,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  timingBox: {
    marginTop: 13,
    padding: 10,
    backgroundColor: '#F5F7F2',
    borderRadius: 9,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  timingLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: MUTED,
    marginBottom: 4,
  },
  timingText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    color: DARK,
    flexShrink: 1,
  },
  stageLabel: {
    color: '#7A847C',
    fontSize: 10,
    marginTop: 11,
  },
  resourceButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: '#E5F1E7',
    borderRadius: 8,
  },
  resourceText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    padding: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: DARK,
  },
  emptyText: {
    color: MUTED,
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
  },
  notice: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F0E4C8',
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: DARK,
    marginBottom: 7,
  },
  noticeText: {
    color: '#665A40',
    fontSize: 12,
    lineHeight: 19,
  },
  disclaimer: {
    fontSize: 11,
    lineHeight: 17,
    color: '#788179',
    marginTop: 20,
    marginBottom: 20,
  },
});
