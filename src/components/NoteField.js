import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

// Champ de texte libre pour une note/un souvenir sur un lieu
export default function NoteField({ value, onChange }) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Note ou souvenir (facultatif)"
      placeholderTextColor={colors.textMuted}
      value={value}
      onChangeText={onChange}
      multiline
      numberOfLines={3}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
