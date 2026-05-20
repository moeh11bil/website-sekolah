/**
 * Utility to list all Express routes for debugging purposes.
 * Can be added to index.js or imported as a middleware.
 */
function listRoutes(app) {
  const routes = [];
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      // Routes registered directly on the app
      routes.push({
        method: Object.keys(layer.route.methods)[0].toUpperCase(),
        path: layer.route.path,
      });
    } else if (layer.name === 'router' && layer.handle.stack) {
      // Routes registered via app.use(router)
      layer.handle.stack.forEach((subLayer) => {
        if (subLayer.route) {
          const path = layer.regexp.toString().replace(/\/\\\/?\^/g, '/').replace(/\\\//g, '/').replace(/\/\$\//g, '') + subLayer.route.path;
          routes.push({
            method: Object.keys(subLayer.route.methods)[0].toUpperCase(),
            path: path.replace(/\/+/g, '/'),
          });
        }
      });
    }
  });
  return routes;
}

module.exports = { listRoutes };
