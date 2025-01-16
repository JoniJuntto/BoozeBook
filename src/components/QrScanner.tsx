import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { Dimensions } from "react-native";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

interface QRScannerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCodeScanned: (data: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isVisible,
  onClose,
  onCodeScanned,
}) => {
  const { t } = useTranslation();
  const [facing, setFacing] = useState<CameraType>("back");
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const toggleCameraFacing = () => {
    console.log("toggleCameraFacing", facing);
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleBarCodeScanned = (scanningResult: BarcodeScanningResult) => {
    console.log("scanningResult", scanningResult);
    if (scanned) return;
    setScanned(true);
    onCodeScanned(scanningResult.data);
    onClose();
  };

  if (!permission) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: t('alerts.permissionRequired'),
      textBody: t('alerts.cameraPermissionRequired'),
      button: t('alerts.grant'),
      closeOnOverlayTap: true,
      onPressButton: async () => {
        const result = await requestPermission();
        if (!result.granted) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: t('alerts.permissionDenied'),
            textBody: t('alerts.cannotScanWithoutCameraPermission'),
            button: t('alerts.close'),
            onPressButton: onClose,
          });
        }
      },
    });
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "aztec",
              "ean13",
              "ean8",
              "qr",
              "pdf417",
              "upc_e",
              "datamatrix",
              "code39",
              "code93",
              "itf14",
              "codabar",
              "code128",
              "upc_a",
            ],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
            <Text style={styles.scanText}>
              {t('alerts.positionBarcodeWithinTheFrame')}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.controlText}>{t('alerts.flipCamera')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={onClose}>
              <Text style={styles.controlText}>{t('alerts.close')}</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.2,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
    borderRadius: 12,
  },
  scanText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  controlButton: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  controlText: {
    color: "#fff",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    gap: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    minWidth: 150,
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default QRScannerModal;
