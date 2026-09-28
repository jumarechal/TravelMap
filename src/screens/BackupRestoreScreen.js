import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { File } from 'expo-file-system';
import { usePlaces } from '../context/PlacesContext';
import { createBackup, readBackup } from '../services/backup';
import { colors, radius, spacing, shadow } from '../theme/theme';

export default function BackupRestoreScreen() {
  const { replaceAllData } = usePlaces();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { uri, placesCount, photoCount } = await createBackup();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/zip',
          dialogTitle: 'Enregistrer la sauvegarde TravelMap',
        });
      } else {
        Alert.alert('Sauvegarde créée', `Fichier créé : ${uri}`);
      }

      Alert.alert(
        'Sauvegarde créée',
        `${placesCount} lieu${placesCount > 1 ? 'x' : ''} et ${photoCount} photo${photoCount > 1 ? 's' : ''} inclus.`
      );
    } catch (err) {
      Alert.alert('Erreur', err.message || "La sauvegarde n'a pas pu être créée.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    let picked;
    try {
      picked = await File.pickFileAsync();
    } catch (err) {
      return;
    }
    if (picked.canceled) return;

    const file = picked.result;
    if (!file.name?.toLowerCase().endsWith('.zip')) {
      Alert.alert('Fichier invalide', 'Choisis un fichier de sauvegarde TravelMap (.zip).');
      return;
    }

    Alert.alert(
      'Restaurer cette sauvegarde ?',
      'Tous les lieux et photos actuellement enregistrés seront remplacés par le contenu de cette sauvegarde. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Restaurer', style: 'destructive', onPress: () => runImport(file.uri) },
      ]
    );
  };

  const runImport = async (fileUri) => {
    setImporting(true);
    try {
      const { places, homePlaceId } = await readBackup(fileUri);
      await replaceAllData({ places, homePlaceId });
      Alert.alert(
        'Restauration terminée',
        `${places.length} lieu${places.length > 1 ? 'x' : ''} restauré${places.length > 1 ? 's' : ''}.`
      );
    } catch (err) {
      Alert.alert('Erreur', err.message || "La sauvegarde n'a pas pu être restaurée.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Sauvegarder</Text>
        </View>
        <Text style={styles.cardText}>
          Regroupe tous tes lieux, notes et photos dans un fichier que tu peux enregistrer où tu
          veux (Drive, email, stockage local...).
        </Text>
        <TouchableOpacity
          style={[styles.button, exporting && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={exporting || importing}
          activeOpacity={0.85}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Créer une sauvegarde</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Restaurer</Text>
        </View>
        <Text style={styles.cardText}>
          Choisis un fichier de sauvegarde TravelMap (.zip) pour restaurer tes lieux et photos.
        </Text>
        <View style={styles.warningRow}>
          <Ionicons name="warning-outline" size={14} color={colors.danger} />
          <Text style={styles.warningText}>Remplace toutes les données actuelles.</Text>
        </View>
        <TouchableOpacity
          style={[styles.buttonOutline, importing && styles.buttonDisabled]}
          onPress={handleImport}
          disabled={exporting || importing}
          activeOpacity={0.85}
        >
          {importing ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.buttonOutlineText}>Choisir un fichier de sauvegarde</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  warningText: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  buttonOutline: {
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonOutlineText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  buttonDisabled: { opacity: 0.7 },
});
