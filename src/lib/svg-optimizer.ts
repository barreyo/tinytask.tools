import { optimize, type Config } from 'svgo/browser';

export interface SvgPlugin {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface OptimizeResult {
  data: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
}

export const DEFAULT_PLUGINS: SvgPlugin[] = [
  {
    id: 'removeDoctype',
    name: 'Remove DOCTYPE',
    description: 'Removes the DOCTYPE declaration',
    enabled: true,
  },
  {
    id: 'removeXMLProcInst',
    name: 'Remove XML declaration',
    description: 'Removes XML processing instructions',
    enabled: true,
  },
  {
    id: 'removeComments',
    name: 'Remove comments',
    description: 'Removes XML/HTML comments',
    enabled: true,
  },
  {
    id: 'removeMetadata',
    name: 'Remove metadata',
    description: 'Removes <metadata> elements',
    enabled: true,
  },
  {
    id: 'removeEditorsNSData',
    name: 'Remove editor data',
    description: 'Removes data added by editors (Inkscape, Sketch, etc.)',
    enabled: true,
  },
  {
    id: 'cleanupAttrs',
    name: 'Clean up attributes',
    description: 'Removes whitespace from attribute values',
    enabled: true,
  },
  {
    id: 'mergeStyles',
    name: 'Merge styles',
    description: 'Merges multiple style elements into one',
    enabled: true,
  },
  {
    id: 'inlineStyles',
    name: 'Inline styles',
    description: 'Moves CSS declarations into matching element attributes',
    enabled: true,
  },
  {
    id: 'minifyStyles',
    name: 'Minify styles',
    description: 'Minifies styles using CSSO',
    enabled: true,
  },
  {
    id: 'cleanupIds',
    name: 'Clean up IDs',
    description: 'Removes unused and minifies used IDs',
    enabled: true,
  },
  {
    id: 'removeUselessDefs',
    name: 'Remove useless defs',
    description: 'Removes elements in <defs> that are not referenced',
    enabled: true,
  },
  {
    id: 'cleanupNumericValues',
    name: 'Clean up numbers',
    description: 'Rounds and removes default numeric attribute values',
    enabled: true,
  },
  {
    id: 'convertColors',
    name: 'Convert colors',
    description: 'Converts color values to shorter equivalents',
    enabled: true,
  },
  {
    id: 'removeUnknownsAndDefaults',
    name: 'Remove defaults',
    description: 'Removes unknown elements/attributes and default values',
    enabled: true,
  },
  {
    id: 'removeNonInheritableGroupAttrs',
    name: 'Remove non-inheritable group attrs',
    description: 'Removes non-inheritable group presentation attributes',
    enabled: true,
  },
  {
    id: 'removeUselessStrokeAndFill',
    name: 'Remove useless stroke/fill',
    description: 'Removes useless stroke and fill attributes',
    enabled: true,
  },
  {
    id: 'removeViewBox',
    name: 'Remove viewBox',
    description: 'Removes viewBox when identical to width/height',
    enabled: false,
  },
  {
    id: 'cleanupEnableBackground',
    name: 'Clean up enable-background',
    description: 'Removes or cleans up enable-background attribute',
    enabled: true,
  },
  {
    id: 'removeHiddenElems',
    name: 'Remove hidden elements',
    description: 'Removes hidden or invisible elements',
    enabled: true,
  },
  {
    id: 'removeEmptyText',
    name: 'Remove empty text',
    description: 'Removes empty <text> elements',
    enabled: true,
  },
  {
    id: 'convertShapeToPath',
    name: 'Convert shapes to paths',
    description: 'Converts basic shapes to more compact <path> notation',
    enabled: true,
  },
  {
    id: 'convertEllipseToCircle',
    name: 'Convert ellipse to circle',
    description: 'Converts non-eccentric <ellipse> elements to <circle>',
    enabled: true,
  },
  {
    id: 'moveElemsAttrsToGroup',
    name: 'Move attrs to group',
    description: 'Moves repeated element attributes to their parent group',
    enabled: true,
  },
  {
    id: 'moveGroupAttrsToElems',
    name: 'Move group attrs to elements',
    description: 'Moves some group attributes to the contained elements',
    enabled: false,
  },
  {
    id: 'collapseGroups',
    name: 'Collapse groups',
    description: 'Collapses useless groups',
    enabled: true,
  },
  {
    id: 'convertPathData',
    name: 'Convert path data',
    description: 'Optimizes path data (numbers, commands)',
    enabled: true,
  },
  {
    id: 'convertTransform',
    name: 'Convert transforms',
    description: 'Collapses multiple transforms into one',
    enabled: true,
  },
  {
    id: 'removeEmptyAttrs',
    name: 'Remove empty attrs',
    description: 'Removes empty attribute values',
    enabled: true,
  },
  {
    id: 'removeEmptyContainers',
    name: 'Remove empty containers',
    description: 'Removes empty container elements',
    enabled: true,
  },
  {
    id: 'mergePaths',
    name: 'Merge paths',
    description: 'Merges multiple paths into one',
    enabled: true,
  },
  {
    id: 'removeUnusedNS',
    name: 'Remove unused namespaces',
    description: 'Removes unused namespace declarations',
    enabled: true,
  },
  {
    id: 'sortDefsChildren',
    name: 'Sort defs children',
    description: 'Sorts children of <defs> to improve gzip compression',
    enabled: true,
  },
  {
    id: 'removeTitle',
    name: 'Remove title',
    description: 'Removes <title> elements',
    enabled: false,
  },
  {
    id: 'removeDesc',
    name: 'Remove description',
    description: 'Removes <desc> elements',
    enabled: false,
  },
];

export function optimizeSvg(svgString: string, plugins: SvgPlugin[]): OptimizeResult {
  const enabledPlugins = plugins.filter((p) => p.enabled).map((p) => ({ name: p.id }));

  const config: Config = {
    plugins: enabledPlugins,
  };

  const result = optimize(svgString, config);

  const encoder = new TextEncoder();
  const originalSize = encoder.encode(svgString).byteLength;
  const optimizedSize = encoder.encode(result.data).byteLength;
  const savings = originalSize - optimizedSize;
  const savingsPercent = originalSize > 0 ? (savings / originalSize) * 100 : 0;

  return {
    data: result.data,
    originalSize,
    optimizedSize,
    savings,
    savingsPercent,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
