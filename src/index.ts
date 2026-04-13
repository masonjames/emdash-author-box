import type { PluginDescriptor } from "emdash";

import {
	AUTHOR_BOX_COMPONENTS_ENTRYPOINT,
	AUTHOR_BOX_PLUGIN_ENTRYPOINT,
	AUTHOR_BOX_PLUGIN_ID,
	AUTHOR_BOX_VERSION,
} from "./constants.js";
import { getAuthorBoxAdminPages } from "./settings.js";

export function authorBoxPlugin(): PluginDescriptor {
	return {
		id: AUTHOR_BOX_PLUGIN_ID,
		version: AUTHOR_BOX_VERSION,
		format: "native",
		entrypoint: AUTHOR_BOX_PLUGIN_ENTRYPOINT,
		componentsEntry: AUTHOR_BOX_COMPONENTS_ENTRYPOINT,
		capabilities: [],
		allowedHosts: [],
		adminPages: getAuthorBoxAdminPages(),
	};
}

export default authorBoxPlugin;

export { DEFAULT_AUTHOR_BOX_SETTINGS } from "./settings.js";
export type * from "./types.js";

