import { EventDetails } from "./common-interfaces";

export interface GeoProps {
  countryCode?: string;
  inEurope?: boolean;
}
export interface IndexProps extends GeoProps{
  events?: EventDetails[];
  authenticatedUser?: string | undefined;
  csrfToken: string | undefined;
}
export interface AuthenticatedIndexProps {
  events: EventDetails[];
  authenticatedUser: string;
}
export interface UnauthenticatedIndexProps {
  csrfToken?: string;
}

export interface GettingStartedProps {
}