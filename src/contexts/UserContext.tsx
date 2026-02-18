import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface UserProfile {
  name: string;
  email: string;
  provider: "google" | "apple";
  avatarUrl?: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  postalCode: string;
  address: string;
  addressDetail: string;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  shippingAddress: ShippingAddress | null;
  setShippingAddress: (addr: ShippingAddress | null) => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const saved = sessionStorage.getItem("looktracker_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(() => {
    const saved = sessionStorage.getItem("looktracker_shipping");
    return saved ? JSON.parse(saved) : null;
  });

  const setUser = useCallback((u: UserProfile | null) => {
    setUserState(u);
    if (u) sessionStorage.setItem("looktracker_user", JSON.stringify(u));
    else sessionStorage.removeItem("looktracker_user");
  }, []);

  const setShippingAddress = useCallback((addr: ShippingAddress | null) => {
    setShippingAddressState(addr);
    if (addr) sessionStorage.setItem("looktracker_shipping", JSON.stringify(addr));
    else sessionStorage.removeItem("looktracker_shipping");
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, shippingAddress, setShippingAddress, isLoggedIn: !!user }}>
      {children}
    </UserContext.Provider>
  );
};
