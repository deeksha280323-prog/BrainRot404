"use client";
import { createContext, useContext, useState } from "react";

const RightPanelContext = createContext();

export function RightPanelProvider({ children }) {
  const [panelData, setPanelData] = useState(null);
  // panelData format: { user: Object }

  return (
    <RightPanelContext.Provider value={{ panelData, setPanelData }}>
      {children}
    </RightPanelContext.Provider>
  );
}

export function useRightPanel() {
  return useContext(RightPanelContext);
}
