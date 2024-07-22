export interface HelmetContentSecurityPolicyOptions {}

export interface HelmetCrossOriginEmbedderPolicyOptions {}

export interface HelmetCrossOriginOpenerPolicyOptions {}

export interface HelmetCrossOriginResourcePolicyOptions {}

export interface HelmetReferrerPolicyOptions {}

export interface HelmetStrictTransportSecurityOptions {}

export type HelmetOptions = {
  contentSecurityPolicy?: HelmetContentSecurityPolicyOptions | boolean
  crossOriginEmbedderPolicy?: HelmetCrossOriginEmbedderPolicyOptions | boolean
  crossOriginOpenerPolicy?: HelmetCrossOriginOpenerPolicyOptions | boolean
  crossOriginResourcePolicy?: HelmetCrossOriginResourcePolicyOptions | boolean
  originAgentCluster?: boolean
  referrerPolicy?: HelmetReferrerPolicyOptions | boolean
} & (
  | {
      strictTransportSecurity?: HelmetStrictTransportSecurityOptions | boolean
      hsts?: never
    }
  | {
      strictTransportSecurity?: never
      hsts?: HelmetStrictTransportSecurityOptions | boolean
    }
) & {}

export function helmet() {}
