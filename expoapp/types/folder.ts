export type Folder = {
  id: string;
  name: string;
  avatar?: string; // Optional URI to an icon/avatar image
  parentId?: string; // For sub-folders, reference to parent folder ID
  _key?: string; // Storage key (similar to Credential)
};
