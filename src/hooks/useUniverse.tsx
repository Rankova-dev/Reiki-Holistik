import { createContext, useContext, useState, ReactNode } from "react";

type Universe = "web" | "formacion";

interface UniverseContextType {
  universe: Universe;
  setUniverse: (u: Universe) => void;
}

const UniverseContext = createContext<UniverseContextType>({
  universe: "web",
  setUniverse: () => {},
});

export const UniverseProvider = ({ children }: { children: ReactNode }) => {
  const [universe, setUniverse] = useState<Universe>("web");
  return (
    <UniverseContext.Provider value={{ universe, setUniverse }}>
      {children}
    </UniverseContext.Provider>
  );
};

export const useUniverse = () => useContext(UniverseContext);
