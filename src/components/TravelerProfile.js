import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TRAVELER_TIERS, getTravelerTierIndex, computeTravelerXp } from '../utils/travelerTiers';
import TierDetailModal from './TierDetailModal';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Profil "Voyageur" : évolue avec l'XP cumulée (somme des niveaux de tous
// les pays visités), un peu comme les anciens "kiwis" Facebook qui grandissaient
// avec les points reçus. Affiche le palier actuel et une frise des prochains
// paliers à atteindre ; chaque palier peut être touché pour voir son détail.
export default function TravelerProfile({ statsByCode }) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(null);

  const xp = computeTravelerXp(statsByCode);
  const tierIndex = getTravelerTierIndex(xp);
  const currentTier = TRAVELER_TIERS[tierIndex];
  const nextTier = TRAVELER_TIERS[tierIndex + 1];

  const progress = nextTier
    ? (xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)
    : 1;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{currentTier.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.tierName}>{currentTier.name}</Text>
          <Text style={styles.xpText}>
            {xp} XP
            {nextTier
              ? ` · encore ${nextTier.minXp - xp} pour "${nextTier.name}"`
              : ' · palier maximal atteint'}
          </Text>
        </View>
      </View>

      {nextTier && (
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }]}
          />
        </View>
      )}

      <Text style={styles.hint}>Touche un palier pour voir son détail</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
      >
        {TRAVELER_TIERS.map((tier, index) => {
          const reached = index <= tierIndex;
          const isCurrent = index === tierIndex;

          return (
            <React.Fragment key={tier.name}>
              <TouchableOpacity
                style={styles.tierStep}
                activeOpacity={0.7}
                onPress={() => setSelectedTierIndex(index)}
              >
                <View
                  style={[
                    styles.tierBubble,
                    reached && styles.tierBubbleReached,
                    isCurrent && styles.tierBubbleCurrent,
                  ]}
                >
                  <Text style={styles.tierBubbleIcon}>{tier.icon}</Text>
                </View>
                <Text
                  style={[styles.tierStepLabel, !reached && styles.tierStepLabelLocked]}
                  numberOfLines={1}
                >
                  {tier.name}
                </Text>
                <Text style={styles.tierStepXp}>{tier.minXp} XP</Text>
              </TouchableOpacity>
              {index < TRAVELER_TIERS.length - 1 && (
                <View style={[styles.connector, reached && styles.connectorReached]} />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      <TierDetailModal
        visible={selectedTierIndex !== null}
        tier={selectedTierIndex !== null ? TRAVELER_TIERS[selectedTierIndex] : null}
        xp={xp}
        statsByCode={statsByCode}
        onClose={() => setSelectedTierIndex(null)}
      />
    </View>
  );
}

const BUBBLE_SIZE = 44;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 36, marginRight: spacing.md },
  headerText: { flex: 1 },
  tierName: { fontSize: 17, fontWeight: '800', color: colors.text },
  xpText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  timelineContent: {
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  tierStep: {
    width: 76,
    alignItems: 'center',
  },
  tierBubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.locked,
    borderWidth: 2,
    borderColor: colors.lockedBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBubbleReached: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  tierBubbleCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  tierBubbleIcon: { fontSize: 20 },
  tierStepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
    textAlign: 'center',
  },
  tierStepLabelLocked: { color: colors.lockedText },
  tierStepXp: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  connector: {
    width: 20,
    height: 2,
    backgroundColor: colors.lockedBorder,
    marginTop: BUBBLE_SIZE / 2 - 1,
  },
  connectorReached: { backgroundColor: colors.primary },
});
