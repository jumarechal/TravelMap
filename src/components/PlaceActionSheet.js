import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Petit menu qui s'affiche quand on appuie sur un marqueur de la carte,
// pour modifier ou supprimer ce lieu sans quitter l'onglet Carte.
export default function PlaceActionSheet({ visible, place, onClose, onEdit, onDelete }) {
  if (!place) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.card} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="bed-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.name} numberOfLines={1}>
                {place.city || place.name}
              </Text>
              {place.country && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {place.country}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={onEdit}>
            <View style={[styles.actionIcon, styles.actionIconPrimary]}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Modifier ce lieu</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={onDelete}>
            <View style={[styles.actionIcon, styles.actionIconDanger]}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </View>
            <Text style={[styles.actionText, styles.actionTextDanger]}>Supprimer ce lieu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Annuler</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
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
    gap: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  name: { fontSize: 17, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconPrimary: { backgroundColor: colors.primarySoft },
  actionIconDanger: { backgroundColor: colors.dangerSoft },
  actionText: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  actionTextDanger: { color: colors.danger },
  closeButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  closeButtonText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
});
