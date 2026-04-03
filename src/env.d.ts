/// <reference types="astro/client" />

declare module "*.astro" {
    const AstroComponent: (_props: Record<string, unknown>) => unknown;
    export default AstroComponent;
}
