import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchAddressSuggestions } from '../services/geocoding';
import { colors, radius, spacing, shadow } from '../theme/theme';

const SEARCH_DEBOUNCE_MS = 400;

// Champ de saisie d'adresse avec autocomplétion : propose une liste de
// lieux au fil de la frappe (via Nominatim), pour permettre de choisir le
// bon lieu quand plusieurs portent le même nom dans des régions différentes.
export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder,
  autoFocus,
  editable = true,
  error,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  // Évite de relancer une recherche juste après avoir choisi une suggestion
  // (le texte de l'input change alors, ce qui déclencherait sinon l'effet)
  const skipNextSearchRef = useRef(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddressSuggestions(value);
      setSuggestions(results);
      setSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [value]);

  const handleSelect = (suggestion) => {
    skipNextSearchRef.current = true;
    setSuggestions([]);
    onSelectSuggestion(suggestion);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <Ionicons name="location-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          editable={editable}
        />
        {searching && <ActivityIndicator size="small" color={colors.textMuted} />}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.suggestionRow,
                index === suggestions.length - 1 && styles.suggestionRowLast,
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={14} color={colors.primary} style={styles.suggestionIcon} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    zIndex: 30,
    ...shadow.floating,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionRowLast: {
    borderBottomWidth: 0,
  },
  suggestionIcon: { marginTop: 2 },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});
