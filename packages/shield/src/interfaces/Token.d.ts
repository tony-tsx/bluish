export interface Token extends Bluish.Shield.Token {
  subject: string;
  scopes: string[];
}

declare global {
  namespace Bluish {
    namespace Shield {
      interface Token {}
    }
  }
}
