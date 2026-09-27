import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES_BY_CODE } from '../data/countries';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Pop-up affichée quand on appuie sur un palier de la frise "Voyageur" :
// détaille le seuil du palier, s'il est atteint ou non, et d'où vient l'XP
// actuelle (quels pays y contribuent et pour combien).
export default function TierDetailModal({ visible, tier, xp, statsByCode, onClose }) {
  const contributions = useMemo(() => {
    return Object.values(statsByCode)
      .filter((s) => s.level > 0)
      .sort((a, b) => b.level - a.level)
      .map((s) => ({ ...s, flag: COUNTRIES_BY_CODE[s.countryCode]?.flag || '🌍' }));
  }, [statsByCode]);

  if (!tier) return null;

  const reached = xp >= tier.minXp;
  const remaining = Math.max(tier.minXp - xp, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.icon}>{tier.icon}</Text>
            <View style={styles.headerText}>
              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierThreshold}>Débloqué à partir de {tier.minXp} XP</Text>
            </View>
          </View>

          {reached ? (
            <View style={styles.statusBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
              <Text style={styles.statusText}>Palier atteint ! Tu as {xp} XP au total.</Text>
            </View>
          ) : (
            <View style={[styles.statusBanner, styles.statusBannerLocked]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.statusText, styles.statusTextLocked]}>
                Encore {remaining} XP pour débloquer ce palier
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>D'où vient ton XP</Text>

          {contributions.length === 0 ? (
            <Text style={styles.emptyText}>Ajoute des lieux pour commencer à gagner de l'XP.</Text>
          ) : (
            <ScrollView style={styles.contributionsList} showsVerticalScrollIndicator={false}>
              {contributions.map((c) => (
                <View key={c.countryCode} style={styles.contributionRow}>
                  <Text style={styles.contributionFlag}>{c.flag}</Text>
                  <Text style={styles.contributionName} numberOfLines={1}>
                    {c.country}
                  </Text>
                  <Text style={styles.contributionXp}>+{c.level} XP</Text>
                </View>
              ))}
            </ScrollView>
          )}

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
    marginBottom: spacing.md,
  },
  icon: { fontSize: 38, marginRight: spacing.md },
  headerText: { flex: 1 },
  tierName: { fontSize: 18, fontWeight: '800', color: colors.text },
  tierThreshold: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statusBannerLocked: { backgroundColor: colors.locked },
  statusText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  statusTextLocked: { color: colors.textMuted },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.md },
  contributionsList: { maxHeight: 220, marginBottom: spacing.md },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contributionFlag: { fontSize: 18, marginRight: spacing.sm },
  contributionName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  contributionXp: { fontSize: 13, fontWeight: '700', color: colors.primaryDark },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  closeButtonText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
});
