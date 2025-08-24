export type Credential = {
  accountName: string;
  issuer?: string;
  secret: string;
  // Optional local URI to an icon image the user selected for this credential
  icon?: string;
  _key?: string;
};
