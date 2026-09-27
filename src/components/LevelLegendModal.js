import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, getLevelColor, getLevelTextColor } from '../theme/theme';

const LEVEL_DESCRIPTIONS = [
  { level: 1, text: 'On est déjà allé dans le pays' },
  { level: 2, text: 'On a visité 2 villes différentes' },
  { level: 3, text: 'On a visité 5 villes différentes, ou dépassé 25% de progression' },
  { level: 4, text: 'On a visité 8 villes différentes, ou dépassé 50% de progression' },
  { level: 5, text: 'On a visité 12 villes différentes, ou dépassé 75% de progression' },
  { level: 6, text: 'On a atteint 90% de progression (ou plus) : voyageur légende du pays' },
];

// Pop-up qui détaille comment chaque niveau (1 à 6) d'un pays est calculé.
export default function LevelLegendModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.handle} />

          <Text style={styles.title}>Comment fonctionnent les niveaux ?</Text>
          <Text style={styles.subtitle}>
            Le niveau retenu est le plus élevé parmi tous les critères atteints.
          </Text>

          {LEVEL_DESCRIPTIONS.map(({ level, text }) => (
            <View key={level} style={styles.row}>
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: getLevelColor(level) },
                ]}
              >
                <Text style={[styles.levelBadgeText, { color: getLevelTextColor(level) }]}>
                  {level}
                </Text>
              </View>
              <Text style={styles.rowText}>{text}</Text>
            </View>
          ))}

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
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelBadgeText: { fontWeight: '800', fontSize: 14 },
  rowText: { flex: 1, fontSize: 13, color: colors.text, lineHeight: 18 },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  closeButtonText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
});
