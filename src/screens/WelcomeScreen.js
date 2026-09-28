import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaces } from '../context/PlacesContext';
import AppLogo from '../components/AppLogo';
import { colors, radius, spacing, shadow } from '../theme/theme';

// Écran d'accueil affiché avant d'entrer dans l'app (onglets).
export default function WelcomeScreen({ navigation }) {
  const { places } = usePlaces();
  const countryCount = new Set(places.map((p) => p.country).filter(Boolean)).size;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badgeWrapper}>
          <AppLogo size={140} />
        </View>

        <Text style={styles.title}>TravelMap</Text>
        <Text style={styles.tagline}>
          Garde une trace des endroits où tu as posé tes valises
        </Text>

        {places.length > 0 && (
          <View style={styles.statPill}>
            <Ionicons name="earth" size={16} color={colors.primary} />
            <Text style={styles.statText}>
              {countryCount} pays visité{countryCount > 1 ? 's' : ''} · {places.length} lieu
              {places.length > 1 ? 'x' : ''}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => navigation.replace('Main')}
      >
        <Text style={styles.buttonText}>Commencer</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xl + 24,
  },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badgeWrapper: {
    width: 140,
    height: 140,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadow.floating,
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 6,
    ...shadow.card,
  },
  statText: { fontSize: 13, fontWeight: '700', color: colors.text },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    alignSelf: 'stretch',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
