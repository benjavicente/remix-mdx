import { bundleMDX } from "mdx-bundler";

export const bundleMDXFromSource = (source: string) => {
  return bundleMDX({ source });
};
