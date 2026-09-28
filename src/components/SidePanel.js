import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow } from '../theme/theme';

const PANEL_WIDTH_RATIO = 0.8;
const ANIMATION_DURATION = 240;

// Panneau qui glisse depuis la gauche de l'écran (par-dessus le contenu),
// avec un fond semi-transparent qu'on peut toucher pour le refermer.
export default function SidePanel({ visible, onClose, children }) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const panelWidth = screenWidth * PANEL_WIDTH_RATIO;
  const translateX = useRef(new Animated.Value(-panelWidth)).current;
  // Garde le Modal monté pendant l'animation de fermeture, pour ne pas la
  // couper net (Modal se ferme sinon instantanément avec visible=false)
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -panelWidth,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => setRendered(false));
    }
  }, [visible]);

  if (!rendered) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[styles.panel, { width: panelWidth, transform: [{ translateX }] }]}
        >
          <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(20, 33, 61, 0.4)',
  },
  panel: {
    backgroundColor: colors.background,
    height: '100%',
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.floating,
  },
});
