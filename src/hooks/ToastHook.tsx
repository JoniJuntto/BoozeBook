import { Alert } from "react-native";

interface ToastOptions {
  title: string;
  message: string;
  type?: "success" | "error";
}

export const useToast = () => {
  const show = ({ title, message, type = "success" }: ToastOptions) => {
    Alert.alert(title, message, [{ text: "OK" }], {
      cancelable: true,
    });
  };

  return { show };
};
