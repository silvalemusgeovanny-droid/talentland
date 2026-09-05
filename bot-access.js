// Keep role defaults aligned with convex/authorization.ts; Convex remains authoritative.
const defaults = {
  root: ['permissions', 'sales', 'products', 'parts', 'partsCost', 'partsCustomerPrice', 'repairs', 'contacts', 'notes', 'statistics', 'database', 'users'],
  admin: ['permissions', 'sales', 'products', 'parts', 'partsCost', 'partsCustomerPrice', 'repairs', 'contacts', 'notes', 'statistics', 'database'],
  user: ['permissions', 'sales', 'parts', 'partsCustomerPrice', 'repairs', 'notes', 'statistics'],
  activador: ['parts', 'partsCustomerPrice'],
};
export function userModules(user) {
  if (!user || !defaults[user.role]) return [];
  return user.role === 'root' ? defaults.root : Array.isArray(user.modules) ? user.modules : defaults[user.role];
}
export function canAccess(user, module, write = false) {
  return Boolean(user && !(write && user.role === 'activador') && userModules(user).includes(module));
}
export function availableCommands(user) {
  const commands = ['/menu', '/estado', '/mi_usuario', '/login', '/ayuda'];
  if (!user) return commands;
  commands.push('/logout', '/ia', '/web', '/reset', '/cancelar');
  if (canAccess(user, 'parts')) commands.push('/repuestos', '/stock', '/stock_bajo');
  if (canAccess(user, 'parts') && canAccess(user, 'partsCustomerPrice')) commands.push('/precio');
  if (canAccess(user, 'repairs')) commands.push('/reparaciones', '/reparacion');
  if (canAccess(user, 'notes')) commands.push('/nota', '/notas');
  if (canAccess(user, 'notes', true)) commands.push('/cliente');
  if (canAccess(user, 'statistics')) commands.push('/resumen');
  if (['parts', 'repairs', 'statistics', 'notes'].some(module => canAccess(user, module))) commands.push('/pendientes');
  return commands;
}
