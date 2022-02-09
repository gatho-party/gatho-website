import React from "react";
export interface CountryContextType {
  countryCode?: string;
  inEurope?: boolean;
}

const defaultCountryContext: CountryContextType = {
  countryCode: undefined,
  inEurope: undefined,
};
export const CountryContext = React.createContext(defaultCountryContext);
