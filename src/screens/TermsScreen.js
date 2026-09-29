import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, shadow } from '../theme/theme';

function Section({ icon, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Bullet({ children }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function TermsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section icon="phone-portrait-outline" title="Tes données restent sur ton téléphone">
        <Bullet>
          Tous tes lieux, notes, dates et photos sont stockés uniquement en local, sur cet
          appareil — il n'y a ni compte ni serveur.
        </Bullet>
        <Bullet>
          Aucune de ces données personnelles n'est envoyée où que ce soit : ni à un serveur, ni à
          un service tiers.
        </Bullet>
        <Bullet>
          Seule exception : quand tu tapes une adresse pour ajouter un lieu, ce texte (et lui
          seul — jamais tes photos ou notes) est envoyé à OpenStreetMap, un service cartographique
          gratuit, pour le transformer en coordonnées GPS.
        </Bullet>
      </Section>

      <Section icon="shield-checkmark-outline" title="Pense à sauvegarder tes données">
        <Bullet>
          Comme rien n'est envoyé automatiquement ailleurs, si tu perds ton téléphone, le casses,
          ou désinstalles l'app, tes données sont perdues définitivement.
        </Bullet>
        <Bullet>
          Utilise régulièrement la fonctionnalité "Backup / Restore" du menu pour créer une
          sauvegarde que tu peux garder où tu veux (Drive, email, stockage local...).
        </Bullet>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('BackupRestore')}
          activeOpacity={0.85}
        >
          <Text style={styles.linkButtonText}>Aller à Backup / Restore</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </Section>

      <Section icon="book-outline" title="Comment fonctionne l'application">
        <Bullet>
          Chaque lieu ajouté crée un marqueur sur la carte, avec un cercle représentant une "zone
          connue" de 7,5 km autour de lui.
        </Bullet>
        <Bullet>
          Dans l'onglet Passeport, chaque pays visité obtient un niveau de 1 à 6, calculé à partir
          du nombre de lieux et de villes différentes que tu y as enregistrés (le détail complet
          est disponible via le bouton "i" de cet onglet).
        </Bullet>
        <Bullet>
          Ce niveau ne mesure pas une vraie couverture géographique du pays : c'est un score
          indicatif, adapté à la taille de chaque pays plutôt qu'à sa superficie réelle.
        </Bullet>
        <Bullet>
          Ton "profil voyageur" (aussi dans Passeport) cumule l'expérience (XP) de tous les pays
          visités et te fait progresser à travers une série de paliers.
        </Bullet>
        <Bullet>
          "Planifier mon voyage" (dans ce menu) te propose des idées de destinations basées sur
          les pays déjà visités et sur la distance depuis ton domicile principal — sans
          intelligence artificielle, juste des règles simples.
        </Bullet>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 7,
  },
  bulletText: { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  linkButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});
