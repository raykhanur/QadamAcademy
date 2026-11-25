// Qadam Academy - Client-side Router
// Hash-based routing: #page/param1/param2

const Router = (() => {
  const routes = {};
  let currentRoute = null;

  function register(pattern, handler) {
    routes[pattern] = handler;
  }

  function navigate(hash) {
    window.location.hash = hash;
  }

  function parse(hash) {
    const clean = hash.replace(/^#\/?/, '');
    const parts = clean.split('/');
    return { page: parts[0] || 'home', params: parts.slice(1) };
  }

  function dispatch() {
    const { page, params } = parse(window.location.hash);
    const handler = routes[page] || routes['404'];
    if (handler) {
      currentRoute = { page, params };
      handler(...params);
    }
  }

  function init() {
    window.addEventListener('hashchange', dispatch);
    dispatch(); // handle initial load
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  return { register, navigate, init, getCurrentRoute };
})();
