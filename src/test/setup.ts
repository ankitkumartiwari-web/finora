import "@testing-library/jest-dom/vitest";
import React, { forwardRef } from "react";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => "test-uuid",
  },
  configurable: true,
});

URL.createObjectURL = vi.fn(() => "blob:test");
URL.revokeObjectURL = vi.fn();

HTMLAnchorElement.prototype.click = vi.fn();

vi.mock("motion/react", () => {
  const createTag = (tag: string) =>
    forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
      const { children, ...rest } = props;
      return React.createElement(tag, { ...rest, ref }, children);
    });

  return {
    motion: new Proxy(
      {},
      {
        get: (_, key: string) => createTag(key),
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

vi.mock("recharts", () => {
  const passthrough = ({ children, ...props }: Record<string, unknown>) =>
    React.createElement("div", props, children);

  return {
    ResponsiveContainer: passthrough,
    AreaChart: passthrough,
    PieChart: passthrough,
    CartesianGrid: passthrough,
    Tooltip: passthrough,
    XAxis: passthrough,
    YAxis: passthrough,
    Legend: passthrough,
    Area: passthrough,
    Pie: passthrough,
    Cell: passthrough,
  };
});
