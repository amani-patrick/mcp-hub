const DOC_ROUTES: Record<string, string> = {
  "./getting-started.md": "/docs/getting-started",
  "./architecture.md": "/docs/architecture",
  "./best-practices.md": "/docs/best-practices",
  "./api.md": "/docs/api",
  "./tool-development.md": "/contributing",
  "../CONTRIBUTING.md": "/contributing",
  "../GOOD_FIRST_ISSUES.md":
    "https://github.com/amani-patrick/mcp-hub/blob/main/GOOD_FIRST_ISSUES.md",
};

export function resolveDocLink(href: string | undefined): {
  href: string;
  external: boolean;
} {
  if (!href) {
    return { href: "#", external: false };
  }

  const [path, hash] = href.split("#");
  const suffix = hash ? `#${hash}` : "";

  if (DOC_ROUTES[path]) {
    const target = DOC_ROUTES[path];
    return {
      href: target.startsWith("http") ? target : `${target}${suffix}`,
      external: target.startsWith("http"),
    };
  }

  if (path.startsWith("http") || path.startsWith("mailto:")) {
    return { href, external: true };
  }

  if (path.endsWith(".md")) {
    return {
      href: `https://github.com/amani-patrick/mcp-hub/blob/main/docs/${path.replace(/^\.\//, "")}${suffix}`,
      external: true,
    };
  }

  return { href, external: false };
}
