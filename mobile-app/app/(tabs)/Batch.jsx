import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View, Text, ActivityIndicator,
  TouchableOpacity, RefreshControl, StatusBar,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBatchStore } from '../../src/stores/batchStore';
import { COLORS, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PremiumMenu from '../../src/components/PremiumMenu';
import styles from '../styles/batchStyle';

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
