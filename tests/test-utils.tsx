import { render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";

import { AppStateProvider } from "@/lib/state/app-state";

function Providers({ children }: PropsWithChildren) {
  return <AppStateProvider>{children}</AppStateProvider>;
}

export function renderWithAppState(ui: ReactElement) {
  return render(ui, { wrapper: Providers });
}
