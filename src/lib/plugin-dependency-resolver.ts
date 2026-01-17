// Plugin Dependency Resolver - Resolves plugin dependencies and detects conflicts
// Ensures plugins are installed in the correct order

import type { RegistryPlugin } from '@/types/plugin-registry';

export interface DependencyNode {
  pluginId: string;
  version: string;
  dependencies: string[];
  level: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: Array<{ from: string; to: string }>;
}

export interface ResolveResult {
  success: boolean;
  installOrder: string[];
  conflicts: Array<{ pluginId: string; versions: string[] }>;
  circularDependencies: string[][];
  missingDependencies: string[];
}

export interface PluginDependencyResolver {
  buildGraph(plugins: RegistryPlugin[]): DependencyGraph;
  resolve(pluginId: string, availablePlugins: RegistryPlugin[], installedPlugins: Array<{ id: string; version: string }>): ResolveResult;
  detectCircularDependencies(graph: DependencyGraph): string[][];
  detectConflicts(graph: DependencyGraph): Array<{ pluginId: string; versions: string[] }>;
  getInstallOrder(pluginId: string, graph: DependencyGraph): string[];
}

export const pluginDependencyResolver: PluginDependencyResolver = {
  buildGraph(plugins: RegistryPlugin[]): DependencyGraph {
    const nodes: DependencyNode[] = [];
    const edges: Array<{ from: string; to: string }> = [];

    for (const plugin of plugins) {
      nodes.push({
        pluginId: plugin.id,
        version: plugin.version,
        dependencies: plugin.dependencies,
        level: 0
      });

      for (const dep of plugin.dependencies) {
        edges.push({ from: plugin.id, to: dep });
      }
    }

    // Calculate levels
    for (const node of nodes) {
      node.level = this.calculateLevel(node.pluginId, edges, 0);
    }

    return { nodes, edges };
  },

  calculateLevel(pluginId: string, edges: Array<{ from: string; to: string }>, depth: number): number {
    if (depth > 10) return depth; // Prevent infinite recursion

    const dependencies = edges.filter(e => e.from === pluginId);
    if (dependencies.length === 0) return 0;

    const depLevels = dependencies.map(d => 
      this.calculateLevel(d.to, edges, depth + 1) + 1
    );

    return depLevels.length > 0 ? Math.max(...depLevels) : 0;
  },

  resolve(
    pluginId: string, 
    availablePlugins: RegistryPlugin[], 
    installedPlugins: Array<{ id: string; version: string }>
  ): ResolveResult {
    const graph = this.buildGraph(availablePlugins);
    const circularDeps = this.detectCircularDependencies(graph);
    const conflicts = this.detectConflicts(graph);
    const installOrder = this.getInstallOrder(pluginId, graph);
    
    // Find missing dependencies
    const missingDeps: string[] = [];
    const plugin = availablePlugins.find(p => p.id === pluginId);
    
    if (plugin) {
      for (const dep of plugin.dependencies) {
        const isAvailable = availablePlugins.some(p => p.id === dep);
        const isInstalled = installedPlugins.some(p => p.id === dep);
        
        if (!isAvailable && !isInstalled) {
          missingDeps.push(dep);
        }
      }
    }

    return {
      success: missingDeps.length === 0 && circularDeps.length === 0,
      installOrder,
      conflicts,
      circularDependencies: circularDeps,
      missingDependencies: missingDeps
    };
  },

  detectCircularDependencies(graph: DependencyGraph): string[][] {
    const circular: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        // Found circular dependency
        const cycleStart = path.indexOf(nodeId);
        circular.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const edges = graph.edges.filter(e => e.from === nodeId);
      for (const edge of edges) {
        dfs(edge.to, [...path]);
      }

      recursionStack.delete(nodeId);
    };

    for (const node of graph.nodes) {
      dfs(node.pluginId, []);
    }

    return circular;
  },

  detectConflicts(graph: DependencyGraph): Array<{ pluginId: string; versions: string[] }> {
    const conflicts: Array<{ pluginId: string; versions: string[] }> = [];
    const versionMap = new Map<string, Set<string>>();

    for (const node of graph.nodes) {
      if (!versionMap.has(node.pluginId)) {
        versionMap.set(node.pluginId, new Set());
      }
      versionMap.get(node.pluginId)!.add(node.version);
    }

    for (const [pluginId, versions] of versionMap) {
      if (versions.size > 1) {
        conflicts.push({
          pluginId,
          versions: Array.from(versions)
        });
      }
    }

    return conflicts;
  },

  getInstallOrder(pluginId: string, graph: DependencyGraph): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    const visit = (nodeId: string): void => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Visit dependencies first
      const edges = graph.edges.filter(e => e.from === nodeId);
      for (const edge of edges) {
        visit(edge.to);
      }

      order.push(nodeId);
    };

    visit(pluginId);
    return order;
  }
};

// Additional types and API expected by hooks
export interface DependencyResolution {
  pluginId: string;
  version: string;
  dependencies: Array<{
    pluginId: string;
    version: string;
    status: 'installed' | 'available' | 'missing';
  }>;
  installOrder: string[];
  hasConflicts: boolean;
  hasMissing: boolean;
  conflicts: Array<{ pluginId: string; versions: string[] }>;
  missing: string[];
}

export interface InstallProgress {
  currentPlugin: string;
  currentIndex: number;
  totalPlugins: number;
  percentage: number;
  status: 'downloading' | 'installing' | 'verifying' | 'complete' | 'error';
  message?: string;
}

export interface InstallResult {
  success: boolean;
  installed: string[];
  errors: string[];
}

interface InstalledPlugin {
  id: string;
  version: string;
  manifest: any;
}

// Stateful dependency resolver
let installedPlugins: InstalledPlugin[] = [];

export const dependencyResolver = {
  setInstalledPlugins(plugins: InstalledPlugin[]): void {
    installedPlugins = [...plugins];
  },

  async resolveDependencies(pluginId: string, version?: string): Promise<DependencyResolution> {
    // Simulate resolution
    return {
      pluginId,
      version: version || '1.0.0',
      dependencies: [],
      installOrder: [pluginId],
      hasConflicts: false,
      hasMissing: false,
      conflicts: [],
      missing: []
    };
  },

  async installWithDependencies(
    pluginId: string,
    version?: string,
    onProgress?: (progress: InstallProgress) => void
  ): Promise<InstallResult> {
    // Simulate installation progress
    onProgress?.({
      currentPlugin: pluginId,
      currentIndex: 0,
      totalPlugins: 1,
      percentage: 0,
      status: 'downloading',
      message: 'Starting download...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress?.({
      currentPlugin: pluginId,
      currentIndex: 0,
      totalPlugins: 1,
      percentage: 50,
      status: 'installing',
      message: 'Installing plugin...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress?.({
      currentPlugin: pluginId,
      currentIndex: 0,
      totalPlugins: 1,
      percentage: 100,
      status: 'complete',
      message: 'Installation complete'
    });

    return {
      success: true,
      installed: [pluginId],
      errors: []
    };
  }
};
