import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl, StatusBar,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Config maps ──────────────────────────────────────────────────────────────
const LEVEL = {
  BEGINNER: { color: '#10B981', gradB: '#052e16', gradT: '#0d4f2a', icon: 'leaf', emoji: '🌱', label: 'Beginner', tagline: 'Perfect for starters' },
  BASIC: { color: '#60A5FA', gradB: '#0f172a', gradT: '#1e3a5f', icon: 'school', emoji: '📘', label: 'Basic', tagline: 'Build your foundation' },
  INTERMEDIATE: { color: '#FBBF24', gradB: '#1c1101', gradT: '#3d2a00', icon: 'flash', emoji: '⚡', label: 'Intermediate', tagline: 'Level up your fluency' },
  ADVANCED: { color: '#F87171', gradB: '#1c0000', gradT: '#4a0000', icon: 'rocket', emoji: '🚀', label: 'Advanced', tagline: 'Master the language' },
};

const STATUS = {
  UPCOMING: { color: '#60A5FA', label: 'Upcoming', dot: '#60A5FA', glow: 'rgba(96,165,250,0.18)' },
  ACTIVE: { color: '#10B981', label: 'Live Now', dot: '#10B981', glow: 'rgba(16,185,129,0.18)' },
  COMPLETED: { color: '#6B7280', label: 'Completed', dot: '#9CA3AF', glow: 'rgba(107,114,128,0.12)' },
  CANCELLED: { color: '#EF4444', label: 'Cancelled', dot: '#EF4444', glow: 'rgba(239,68,68,0.12)' },
};

const FILTERS = [
  { key: 'All', icon: 'apps', label: 'All' },
  { key: 'ACTIVE', icon: 'pulse', label: 'Live' },
  { key: 'UPCOMING', icon: 'time', label: 'Upcoming' },
  { key: 'BEGINNER', icon: 'leaf', label: 'Beginner' },
  { key: 'INTERMEDIATE', icon: 'flash', label: 'Intermediate' },
  { key: 'ADVANCED', icon: 'rocket', label: 'Advanced' },
];

function formatDate(d) {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

// ─── Featured (Hero) Card ─────────────────────────────────────────────────────
function FeaturedCard({ item, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const lv = LEVEL[item.level] || LEVEL.BEGINNER;
  const st = STATUS[item.status] || STATUS.UPCOMING;
  const spotsLeft = Math.max(0, (item.maxStudents || 30) - (item.enrollments?.length || 0));

  const onIn = () => Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 24 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onIn} onPressOut={onOut}
        style={styles.featuredOuter}>
        <LinearGradient colors={[lv.gradT, lv.gradB, '#080C14']} style={styles.featuredCard}>
          {/* Accent glow */}
          <View style={[styles.featuredGlow, { backgroundColor: lv.color + '15' }]} />

          {/* Top row */}
          <View style={styles.featuredTopRow}>

            <View style={[styles.statusChip, { backgroundColor: st.glow }]}>
              <View style={[styles.liveDot, { backgroundColor: st.dot }]} />
              <Text style={[styles.statusChipText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>

          <Text style={styles.featuredName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.featuredTagline}>{lv.tagline}</Text>

          {/* Stats */}
          <View style={styles.featuredStats}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNum, { color: lv.color }]}>{item.maxStudents}</Text>
              <Text style={styles.statLabel}>Max seats</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={[styles.statNum, { color: spotsLeft < 5 ? '#F87171' : '#fff' }]}>{spotsLeft}</Text>
              <Text style={styles.statLabel}>Spots left</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={[styles.statNum, { color: '#fff' }]}>{item.language}</Text>
              <Text style={styles.statLabel}>Language</Text>
            </View>
          </View>

          <View style={[styles.featuredDivider, { backgroundColor: lv.color + '33' }]} />

          {/* Footer */}
          <View style={styles.featuredFooter}>
            <View>
              <Text style={styles.featuredPriceLabel}>Batch Fee</Text>
              <Text style={[styles.featuredPrice, { color: lv.color }]}>
                {item.feeAmount > 0 ? `${item.feeAmount} ETB` : 'Free'}
              </Text>
            </View>
            <LinearGradient colors={[lv.color, lv.color + 'bb']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.featuredBtn}>
              <Text style={styles.featuredBtnText}>Enroll Now</Text>
              <Ionicons name="arrow-forward-circle" size={18} color="#000" />
            </LinearGradient>
          </View>

          {/* FEATURED ribbon */}
          <View style={[styles.ribbon, { backgroundColor: lv.color }]}>
            <Text style={styles.ribbonText}>⭐ FEATURED</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Regular Batch Card ───────────────────────────────────────────────────────
function BatchCard({ item, onPress, isLast }) {
  const scale = useRef(new Animated.Value(1)).current;
  const lv = LEVEL[item.level] || LEVEL.BEGINNER;
  const st = STATUS[item.status] || STATUS.UPCOMING;
  const enrollCount = item.enrollments?.length || 0;
  const spotsLeft = Math.max(0, item.maxStudents - enrollCount);
  const fillPct = Math.min((enrollCount / item.maxStudents) * 100, 100);
  const isFull = spotsLeft === 0;
  const isUrgent = !isFull && spotsLeft <= 5;
  const isDisabled = isFull || item.status === 'CANCELLED';
  const startDate = formatDate(item.startDate);
  const days = daysUntil(item.startDate);

  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, !isLast && { marginBottom: SPACING.md }]}>
      <TouchableOpacity activeOpacity={1}
        onPress={!isDisabled ? onPress : undefined}
        onPressIn={!isDisabled ? onIn : undefined}
        onPressOut={!isDisabled ? onOut : undefined}>
        <View style={[styles.card, isDisabled && styles.cardDisabled]}>
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: lv.color }]} />

          <View style={styles.cardInner}>
            {/* Top row */}
            <View style={styles.cardTop}>

              <View style={styles.cardTopMid}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cardMeta}>
                  <Ionicons name="globe-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.cardMetaText}>{item.language}</Text>
                  <Text style={styles.cardMetaDot}>·</Text>
                  <View style={[styles.miniLevelBadge, { backgroundColor: lv.color + '22' }]}>
                    <Text style={[styles.miniLevelText, { color: lv.color }]}>{lv.label}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.statusPill, { backgroundColor: st.glow }]}>
                <View style={[styles.statusPillDot, { backgroundColor: st.dot }]} />
                <Text style={[styles.statusPillText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>

            {item.description ? (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}

            {/* Date / urgency */}
            <View style={styles.cardDateRow}>
              {startDate && (
                <View style={styles.dateTag}>
                  <Ionicons name="calendar-outline" size={12} color={COLORS.primary} />
                  <Text style={styles.dateTagText}>Starts {startDate}</Text>
                  {days !== null && days > 0 && days <= 14 &&
                    <Text style={styles.dateSoon}> · {days}d away!</Text>}
                </View>
              )}
              {isUrgent && (
                <View style={styles.urgencyTag}>
                  <Ionicons name="flame" size={12} color="#F87171" />
                  <Text style={styles.urgencyText}>Only {spotsLeft} left!</Text>
                </View>
              )}
            </View>

            {/* Fill bar */}
            <View style={styles.fillRow}>
              <View style={styles.fillBg}>
                <LinearGradient
                  colors={isFull ? ['#EF4444', '#B91C1C'] : [lv.color, lv.color + 'aa']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[styles.fillBar, { width: `${Math.max(fillPct, 2)}%` }]}
                />
              </View>
              <Text style={styles.fillText}>
                {isFull ? 'Full' : `${spotsLeft}/${item.maxStudents} open`}
              </Text>
            </View>

            {/* Bottom */}
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.priceSmallLabel}>Fee</Text>
                <Text style={[styles.priceVal, { color: lv.color }]}>
                  {item.feeAmount > 0 ? `${item.feeAmount} ETB` : 'FREE'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.cardCTA,
                  isDisabled
                    ? item.status === 'CANCELLED' ? styles.cardCTACancelled : styles.cardCTAFull
                    : { backgroundColor: lv.color },
                ]}
                onPress={!isDisabled ? onPress : undefined}
                disabled={isDisabled}>
                {isDisabled ? (
                  <Text style={styles.cardCTATextDim}>
                    {item.status === 'CANCELLED' ? 'Cancelled' : 'Full'}
                  </Text>
                ) : (
                  <>
                    <Text style={styles.cardCTAText}>View</Text>
                    <Ionicons name="chevron-forward" size={14} color="#000" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function BatchScreen() {
  const router = useRouter();
  const { batches, isLoading, getBatches, enrollments, premiumUnlocked } = useBatchStore();
  const [filter, setFilter] = useState('All');
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const isPremium = premiumUnlocked || enrollments.some(e => e.status === 'ENROLLED');

  useEffect(() => { getBatches(); }, []);
  const onRefresh = useCallback(() => getBatches(), []);

  const filtered = batches.filter(b =>
    filter === 'All' ? true : b.status === filter || b.level === filter
  );

  const featuredBatch = batches.find(b => b.status === 'ACTIVE') || batches[0] || null;
  const listBatches = filtered.filter(b => b.id !== featuredBatch?.id);

  const totalActive = batches.filter(b => b.status === 'ACTIVE').length;
  const totalUpcoming = batches.filter(b => b.status === 'UPCOMING').length;
  const totalStudents = batches.reduce((s, b) => s + (b.enrollments?.length || 0), 0);

  // Header parallax
  const headerTranslate = scrollY.interpolate({ inputRange: [0, 120], outputRange: [0, -30], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0.6], extrapolate: 'clamp' });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <PremiumMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

      {/* ── Hero Banner (Home-style) ── */}
      <LinearGradient colors={['#0A2540', '#0D1B2A', '#080C14']}
        style={styles.heroBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Glow blob */}
        <View style={styles.glowBlob} />

        <Animated.View style={{ transform: [{ translateY: headerTranslate }], opacity: headerOpacity }}>
          {/* Top Row with Menu */}
          <View style={styles.headerTopRow}>
            {isPremium && (
              <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                <Ionicons name="menu" size={26} color="#fff" />
              </TouchableOpacity>
            )}
            <View style={styles.heroEyebrow}>
              <View style={styles.liveIndicator}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>{totalActive} LIVE</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroTitle}>Language{'\n'}Batches</Text>
          <Text style={styles.heroSub}>
            Join a structured cohort with AI tutoring, live sessions & certification.
          </Text>

          {/* Stats row */}
          <View style={styles.heroStatsRow}>
            {[
              { num: batches.length, label: 'Total', color: '#fff' },
              { num: totalActive, label: 'Live', color: '#10B981' },
              { num: totalUpcoming, label: 'Soon', color: '#60A5FA' },
              { num: `${totalStudents}+`, label: 'Students', color: COLORS.primary },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.heroStat}>
                  <Text style={[styles.heroStatNum, { color: s.color }]}>{s.num}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.heroStatDivider} />}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ── Scrollable content ── */}
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        style={styles.scrollView}>

        {/* Trust chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trustRow}>
          {['✅ Certified Instructors', '🤖 AI Tutor 24/7', '📜 Certificate', '💬 Live Classes'].map(t => (
            <View key={t} style={styles.trustChip}>
              <Text style={styles.trustText}>{t}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Filter strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const act = filter === f.key;
            const accent = LEVEL[f.key]?.color || STATUS[f.key]?.color || COLORS.primary;
            return (
              <TouchableOpacity key={f.key}
                style={[styles.filterChip, act && { backgroundColor: accent + '22', borderColor: accent }]}
                onPress={() => setFilter(f.key)}>
                <Ionicons name={f.icon} size={14} color={act ? accent : '#6B7280'} />
                <Text style={[styles.filterLabel, act && { color: accent, fontWeight: '700' }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Content */}
        {isLoading && batches.length === 0 ? (
          <View style={styles.loadingBox}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="sparkles" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.loadingText}>Finding best batches…</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {/* Featured */}
            {filter === 'All' && featuredBatch && (
              <View style={{ marginBottom: SPACING.xl }}>
                <View style={styles.sectionLabel}>
                  <Ionicons name="star" size={14} color={COLORS.primary} />
                  <Text style={styles.sectionLabelText}>Featured Batch</Text>
                </View>
                <FeaturedCard
                  item={featuredBatch}
                  onPress={() => router.push(`batch/${featuredBatch.id}`)}
                />
              </View>
            )}

            {/* List */}
            {listBatches.length > 0 && (
              <View>
                {filter === 'All' && (
                  <View style={styles.sectionLabel}>
                    <Ionicons name="grid-outline" size={14} color="#6B7280" />
                    <Text style={styles.sectionLabelText}>All Batches</Text>
                    <View style={styles.sectionCount}>
                      <Text style={styles.sectionCountText}>{listBatches.length}</Text>
                    </View>
                  </View>
                )}
                {listBatches.map((b, i) => (
                  <BatchCard
                    key={b.id} item={b}
                    isLast={i === listBatches.length - 1}
                    onPress={() => router.push(`batch/${b.id}`)}
                  />
                ))}
              </View>
            )}

            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Text style={{ fontSize: 48 }}></Text>
                <Text style={styles.emptyTitle}>No batches found</Text>
                <Text style={styles.emptyText}>Try a different filter</Text>
                <TouchableOpacity style={styles.clearBtn} onPress={() => setFilter('All')}>
                  <Text style={styles.clearText}>Show All</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080C14' },
  scrollView: { flex: 1 },

  // ── Hero Banner ──────────────────────────────────────────────────────────
  heroBanner: {
    paddingTop: 32, paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl, overflow: 'hidden',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  menuBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  glowBlob: {
    position: 'absolute', top: -60, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(16,185,129,0.07)',
  },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center' },
  liveIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { color: '#10B981', fontWeight: '800', fontSize: 11, letterSpacing: 1 },

  heroTitle: {
    fontSize: 38, fontWeight: '900', color: '#fff',
    letterSpacing: -1.5, marginBottom: 8, lineHeight: 34,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 15, marginBottom: 10,
  },
  heroStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatNum: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '600', letterSpacing: 0.5 },
  heroStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Trust chips
  trustRow: { paddingHorizontal: SPACING.lg, gap: 8, paddingVertical: 14, alignItems: 'center' },
  trustChip: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  trustText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '500' },

  // Filters
  filterRow: { paddingHorizontal: SPACING.lg, gap: 8, paddingBottom: 14, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterLabel: { color: '#6B7280', fontSize: 13, fontWeight: '500' },

  // List
  listWrap: { paddingHorizontal: SPACING.lg },

  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  sectionLabelText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionCount: {
    backgroundColor: COLORS.primary + '22', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, marginLeft: 4,
  },
  sectionCountText: { color: COLORS.primary, fontWeight: '700', fontSize: 11 },

  // ── Featured card ─────────────────────────────────────────────────────────
  featuredOuter: {
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  featuredCard: { borderRadius: 24, padding: SPACING.xl, overflow: 'hidden' },
  featuredGlow: { position: 'absolute', top: -80, right: -80, width: 200, height: 200, borderRadius: 100 },
  featuredTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  statusChipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  featuredName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  featuredTagline: { color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: SPACING.lg },
  featuredStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, marginBottom: SPACING.lg },
  statBlock: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  featuredDivider: { height: 1, marginBottom: SPACING.lg },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredPriceLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  featuredPrice: { fontSize: 26, fontWeight: '900', marginTop: 2 },
  featuredBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: SPACING.xl, paddingVertical: 12, borderRadius: 14 },
  featuredBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  ribbon: { position: 'absolute', top: 14, right: -30, paddingHorizontal: 36, paddingVertical: 5, transform: [{ rotate: '35deg' }] },
  ribbonText: { color: '#000', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

  // ── Regular card ──────────────────────────────────────────────────────────
  card: { backgroundColor: 'rgba(14,20,34,0.95)', borderRadius: 18, flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  cardDisabled: { opacity: 0.5 },
  accentBar: { width: 4 },
  cardInner: { flex: 1, padding: SPACING.md, gap: SPACING.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  levelCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardTopMid: { flex: 1 },
  cardName: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: -0.2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  cardMetaText: { color: '#6B7280', fontSize: 11, fontWeight: '500' },
  cardMetaDot: { color: '#374151', fontSize: 12 },
  miniLevelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  miniLevelText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusPillDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  cardDesc: { color: '#6B7280', fontSize: 13, lineHeight: 18 },

  cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  dateTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  dateTagText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  dateSoon: { color: '#F87171', fontSize: 11, fontWeight: '700' },
  urgencyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  urgencyText: { color: '#F87171', fontSize: 11, fontWeight: '700' },

  fillRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  fillBg: { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: 3 },
  fillText: { color: '#6B7280', fontSize: 11, fontWeight: '500', minWidth: 60, textAlign: 'right' },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  priceSmallLabel: { color: '#6B7280', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  priceVal: { fontSize: 18, fontWeight: '900', marginTop: 1 },
  cardCTA: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  cardCTAFull: { backgroundColor: 'rgba(255,255,255,0.07)' },
  cardCTACancelled: { backgroundColor: 'rgba(239,68,68,0.1)' },
  cardCTAText: { color: '#000', fontWeight: '900', fontSize: 13 },
  cardCTATextDim: { color: '#6B7280', fontWeight: '600', fontSize: 13 },

  // States
  loadingBox: { paddingTop: 80, alignItems: 'center', gap: 14 },
  loadingSpinner: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(245,158,11,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)' },
  loadingText: { color: '#6B7280', fontSize: 14 },
  empty: { paddingTop: 80, alignItems: 'center', gap: 8 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 8 },
  emptyText: { color: '#6B7280', fontSize: 14 },
  clearBtn: { marginTop: 12, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: 10, borderRadius: 20 },
  clearText: { color: '#000', fontWeight: '800', fontSize: 14 },
});