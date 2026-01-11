/**
 * GET /api/v1/routes (dev-only)
 * 
 * Returns a registry of all mounted routes
 */

/**
 * Build route registry from Express app
 */
function buildRouteRegistry(app) {
  const routes = [];
  
  // Traverse Express app stack
  function traverseStack(stack, basePath = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        // Direct route
        const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
        routes.push({
          path: basePath + layer.route.path,
          methods,
          type: 'route'
        });
      } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
        // Router middleware
        const routerPath = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\(.)/g, '$1')
          .replace('^', '')
          .replace('$', '');
        
        const fullPath = basePath + (routerPath === '^\\/?$' ? '' : routerPath);
        traverseStack(layer.handle.stack, fullPath);
      }
    });
  }
  
  if (app._router && app._router.stack) {
    traverseStack(app._router.stack, '/api/v1');
  }
  
  return routes.sort((a, b) => a.path.localeCompare(b.path));
}

export function createRoutesHandler(app) {
  return function routesHandler(req, res) {
    // Only allow in development or with special header
    const isDev = process.env.NODE_ENV !== 'production';
    const hasDevHeader = req.headers['x-dev-routes'] === '1';
    
    if (!isDev && !hasDevHeader) {
      return res.sendError('FORBIDDEN', 'Route registry is only available in development mode', null, 403);
    }
    
    const routes = buildRouteRegistry(app);
    
    res.sendEnvelope({
      routes,
      count: routes.length,
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  };
}

