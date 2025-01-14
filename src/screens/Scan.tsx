import { View } from "react-native";
import { useState } from "react";
import QrScanner from "../components/QrScanner";

export default function Scan() {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <View className="flex-1 bg-secondary">
      <QrScanner
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onCodeScanned={() => {}}
      />
    </View>
  );
}
