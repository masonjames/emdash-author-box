import AuthorBoxComponent from "./AuthorBox.astro";

export { AuthorBoxComponent as authorBox, AuthorBoxComponent as AuthorBox };

export const blockComponents = {
	authorBox: AuthorBoxComponent,
} as const;

