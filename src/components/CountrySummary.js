import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlaces } from '../context/PlacesContext';

// Petit badge qui affiche le nombre de pays visités,
// déduit du nombre de pays différents parmi les lieux enregistrés.
export default function CountrySummary() {
  const { places } = usePlaces();
  const countryCount = new Set(places.map((p) => p.country)).size;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {countryCount} pays visité{countryCount > 1 ? 's' : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
  },
});
