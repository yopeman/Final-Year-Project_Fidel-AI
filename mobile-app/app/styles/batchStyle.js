import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
export default StyleSheet.create({
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
