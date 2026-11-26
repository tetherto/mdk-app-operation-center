import { QueryClient } from "@tanstack/react-query";
import { MdkAppProvider, MdkProvider } from "@tetherto/mdk-react-adapter";
import { noAuth } from "@tetherto/mdk-ui-foundation";
import { render, renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, vi } from "vitest";

import { createFakeGateway, type FakeGateway, TEST_API_BASE } from "./fake-gateway";

export type AppRenderOptions = {
  gateway?: FakeGateway;
  /** The URL the router starts at. */
  initialPath?: string;
  /** The route pattern the element renders under (for `useParams`). */
  routePath?: string;
};

const TEST_APP = {
  name: "test",
  id: "io.tether.opcentrelite",
  version: "0.0.0",
  displayName: "Operation Center Lite",
  apiBase: TEST_API_BASE,
  ui: null,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The providers the dashboard wraps an app page in, over a fake Gateway. */
const setUp = (options: AppRenderOptions) => {
  const gateway = options.gateway ?? createFakeGateway();
  vi.stubGlobal("fetch", gateway.fetch);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
  });
  const routePath = options.routePath ?? "*";
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MdkProvider apiBaseUrl="" auth={noAuth()} queryClient={queryClient}>
      <MdkAppProvider app={TEST_APP}>
        <MemoryRouter initialEntries={[options.initialPath ?? "/"]}>
          <Routes>
            <Route path={routePath} element={children} />
          </Routes>
        </MemoryRouter>
      </MdkAppProvider>
    </MdkProvider>
  );
  return { gateway, queryClient, Wrapper };
};

export const renderWithApp = (ui: ReactElement, options: AppRenderOptions = {}) => {
  const { gateway, queryClient, Wrapper } = setUp(options);
  return { ...render(ui, { wrapper: Wrapper }), gateway, queryClient };
};

export const renderHookWithApp = <Result,>(hook: () => Result, options: AppRenderOptions = {}) => {
  const { gateway, queryClient, Wrapper } = setUp(options);
  return { ...renderHook(hook, { wrapper: Wrapper }), gateway, queryClient };
};
