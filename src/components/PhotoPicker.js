import React from 'react';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

const MAX_PHOTOS = 20;
const THUMB_SIZE = 72;

// Sélecteur de photos pour un lieu : affiche les vignettes déjà choisies,
// avec un bouton "+" pour en ajouter (galerie ou appareil photo) et une
// croix sur chaque vignette pour la retirer.
export default function PhotoPicker({ photos, onChange }) {
  const pickFrom = async (useCamera) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission refusée',
        useCamera
          ? "L'accès à l'appareil photo est nécessaire pour prendre une photo."
          : "L'accès à tes photos est nécessaire pour en choisir une."
      );
      return;
    }

    const remainingSlots = MAX_PHOTOS - photos.length;

    const options = {
      mediaTypes: ['images'],
      quality: 0.6,
      // La sélection multiple n'a de sens que pour la galerie (une seule
      // photo à la fois avec l'appareil photo)
      ...(!useCamera && { allowsMultipleSelection: true, selectionLimit: remainingSlots }),
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets?.length) {
      const newUris = result.assets.map((asset) => asset.uri);
      onChange([...photos, ...newUris].slice(0, MAX_PHOTOS));
    }
  };

  const handleAddPress = () => {
    Alert.alert('Ajouter une photo', undefined, [
      { text: 'Prendre une photo', onPress: () => pickFrom(true) },
      { text: 'Choisir dans la galerie', onPress: () => pickFrom(false) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const removePhoto = (uri) => {
    onChange(photos.filter((p) => p !== uri));
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {photos.map((uri) => (
        <View key={uri} style={styles.thumbWrapper}>
          <Image source={{ uri }} style={styles.thumb} />
          <TouchableOpacity style={styles.removeButton} onPress={() => removePhoto(uri)}>
            <Ionicons name="close" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}

      {photos.length < MAX_PHOTOS && (
        <TouchableOpacity style={styles.addTile} onPress={handleAddPress}>
          <Ionicons name="camera-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  thumbWrapper: { marginRight: spacing.sm },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    backgroundColor: colors.locked,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
