import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "mn.beta.tcsw",
  appName: "TCSW 2026",
  webDir: "out",
  backgroundColor: "#08142f",
  ios: {
    contentInset: "always",
    scrollEnabled: true
  },
  android: {
    backgroundColor: "#08142f"
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#08142f",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#08142f",
      overlaysWebView: false
    },
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true
    }
  }
};

export default config;
