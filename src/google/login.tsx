import { TokenResponse } from "@react-oauth/google";
import { createContext } from "react";

export const UserAccesToken = createContext<TokenResponse | undefined>(
  undefined
);
