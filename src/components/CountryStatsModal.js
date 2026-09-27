import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEVEL_LABELS } from '../utils/countryLevel';
import { colors, radius, spacing, shadow, getLevelColor, getLevelTextColor } from '../theme/theme';

function StatBox({ icon, value, label }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Pop-up affichée quand on appuie sur un pays débloqué du Passeport :
// ses statistiques (lieux, villes, couverture) et son niveau.
export default function CountryStatsModal({ visible, country, stats, onClose, onViewPlaces }) {
  if (!country) return null;

  const level = stats?.level || 0;
  const levelColor = getLevelColor(level);
  const levelTextColor = getLevelTextColor(level);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.flag}>{country.flag}</Text>
            <View style={styles.headerText}>
              <Text style={styles.countryName}>{country.name}</Text>
              <View style={[styles.levelPill, { backgroundColor: levelColor }]}>
                {level === 6 && (
                  <Ionicons name="star" size={12} color={levelTextColor} style={styles.levelPillIcon} />
                )}
                <Text style={[styles.levelPillText, { color: levelTextColor }]}>
                  Niveau {level} · {LEVEL_LABELS[level]}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatBox icon="bed-outline" value={stats?.placesCount || 0} label="lieu(x)" />
            <StatBox icon="business-outline" value={stats?.cityCount || 0} label="ville(s)" />
            <StatBox
              icon="trending-up-outline"
              value={`${Math.round(stats?.coveragePercent || 0)}%`}
              label="progression"
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={onViewPlaces} activeOpacity={0.85}>
            <Ionicons name="list-outline" size={16} color="#fff" />
            <Text style={styles.primaryButtonText}>Voir mes lieux dans ce pays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(29, 32, 48, 0.5)',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  flag: { fontSize: 40, marginRight: spacing.md },
  headerText: { flex: 1 },
  countryName: { fontSize: 19, fontWeight: '800', color: colors.text, marginBottom: 6 },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  levelPillIcon: { marginRight: 4 },
  levelPillText: { fontSize: 12, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  closeButtonText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
});
