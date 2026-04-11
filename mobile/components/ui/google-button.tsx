import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
};

const GOOGLE_LOGO_URI =
  'https://developers.google.com/identity/images/g-logo.png';

export function GoogleButton({ onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.button}>
      <View style={styles.iconWrap}>
        <Image source={{ uri: GOOGLE_LOGO_URI }} style={styles.icon} />
      </View>
      <Text style={styles.label}>Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 999,
    paddingVertical: 13,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  iconWrap: {
    width: 22,
    height: 22,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
