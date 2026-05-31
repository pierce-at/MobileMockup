"use client";

import { useEffect } from "react";

export function MobileRuntime() {
  useEffect(() => {
    let active = true;
    const removeListeners: Array<() => Promise<void>> = [];

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

      const [{ App }, { StatusBar, Style }, { Keyboard, KeyboardResize }, { SplashScreen }] =
        await Promise.all([
          import("@capacitor/app"),
          import("@capacitor/status-bar"),
          import("@capacitor/keyboard"),
          import("@capacitor/splash-screen")
        ]);

      const keyboardShowListener = await Keyboard.addListener("keyboardWillShow", () => {
        document.body.classList.add("keyboard-open");
      });
      removeListeners.push(() => keyboardShowListener.remove());

      const keyboardHideListener = await Keyboard.addListener("keyboardWillHide", () => {
        document.body.classList.remove("keyboard-open");
      });
      removeListeners.push(() => keyboardHideListener.remove());

      const backButtonListener = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack && window.history.length > 1) {
          window.history.back();
          return;
        }

        void App.minimizeApp();
      });
      removeListeners.push(() => backButtonListener.remove());

      await Promise.allSettled([
        StatusBar.setOverlaysWebView({ overlay: false }),
        StatusBar.setStyle({ style: Style.Dark }),
        StatusBar.setBackgroundColor({ color: "#0c495a" }),
        Keyboard.setResizeMode({ mode: KeyboardResize.Native }),
        Keyboard.setScroll({ isDisabled: false }),
        SplashScreen.hide()
      ]);
    }

    void setupNativeShell();

    return () => {
      active = false;
      document.body.classList.remove("capacitor-app");
      document.body.classList.remove("keyboard-open");
      void Promise.allSettled(removeListeners.map((remove) => remove()));
    };
  }, []);

  return null;
}
