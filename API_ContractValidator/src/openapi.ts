import YAML from "yaml"

export function parseSpec(raw: string): any {
    return raw.trim().startsWith("{")
    ? JSON.parse(raw)
    : YAML.parse(raw);
}