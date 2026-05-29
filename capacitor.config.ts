import type { CapacitorConfig } from "@capacitor/cli";

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
  }
};

export default config;
