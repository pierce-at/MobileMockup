"use client";

import { useEffect } from "react";

export function MobileRuntime() {
  useEffect(() => {
    let active = true;

    async function setupNativeShell() {
      const { Capacitor } = await import("@capacitor/core");
      const isNative = Capacitor.isNativePlatform();

      if (!active) return;

      document.body.classList.toggle("capacitor-app", isNative);
      document.documentElement.style.setProperty("--safe-top", "env(safe-area-inset-top, 0px)");
      document.documentElement.style.setProperty("--safe-right", "env(safe-area-inset-right, 0px)");
      document.documentElement.style.setProperty("--safe-bottom", "env(safe-area-inset-bottom, 0px)");
      document.documentElement.style.setProperty("--safe-left", "env(safe-area-inset-left, 0px)");

      if (!isNative) return;

      const [{ StatusBar, Style }, { Keyboard, KeyboardResize }, { SplashScreen }] = await Promise.all([
        import("@capacitor/status-bar"),
        import("@capacitor/keyboard"),
        import("@capacitor/splash-screen")
      ]);

      await Promise.allSettled([
        StatusBar.setStyle({ style: Style.Dark }),
        StatusBar.setBackgroundColor({ color: "#08142f" }),
        Keyboard.setResizeMode({ mode: KeyboardResize.Native }),
        Keyboard.setScroll({ isDisabled: false }),
        SplashScreen.hide()
      ]);
    }

    void setupNativeShell();

    return () => {
      active = false;
      document.body.classList.remove("capacitor-app");
    };
  }, []);

  return null;
}
