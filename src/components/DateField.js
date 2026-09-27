import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radius, spacing } from '../theme/theme';

// Formate une date en français, ex: "12 mars 2026"
function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Champ pour choisir (facultativement) la date d'un séjour.
// value est un objet Date, ou null si aucune date n'a été choisie.
export default function DateField({ value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleValueChange = (event, selectedDate) => {
    // Sur Android, le sélecteur est une boîte de dialogue qui se referme seule
    if (Platform.OS === 'android') setShowPicker(false);
    if (selectedDate) onChange(selectedDate);
  };

  return (
    <View>
      <TouchableOpacity style={styles.row} onPress={() => setShowPicker(true)}>
        <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value ? formatDate(value) : 'Date du séjour (facultatif)'}
        </Text>
        {value && (
          <TouchableOpacity onPress={() => onChange(null)} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showPicker && (
        <View style={Platform.OS === 'ios' ? styles.iosPickerWrapper : null}>
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onValueChange={handleValueChange}
            onDismiss={() => setShowPicker(false)}
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.doneButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.doneText}>OK</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  text: { flex: 1, fontSize: 15, color: colors.text },
  placeholder: { color: colors.textMuted },
  iosPickerWrapper: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  doneButton: { alignSelf: 'flex-end', paddingHorizontal: spacing.md },
  doneText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});
