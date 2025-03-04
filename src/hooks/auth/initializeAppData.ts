
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialize default menu access permissions
 * This can be called during app initialization or first login
 */
export const initializeMenuAccess = async () => {
  // Check if menu access data already exists
  const { count, error: countError } = await supabase
    .from('menu_access')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error("Error checking menu_access data:", countError);
    return;
  }

  // If we already have data, don't initialize again
  if (count && count > 0) {
    console.log("Menu access data already initialized");
    return;
  }

  // Define default menu access by role
  const defaultAccess = [
    // Admin has access to everything
    { role: 'admin', menu_code: 'dashboard' },
    { role: 'admin', menu_code: 'products' },
    { role: 'admin', menu_code: 'pos' },
    { role: 'admin', menu_code: 'inventory' },
    { role: 'admin', menu_code: 'reports' },
    { role: 'admin', menu_code: 'settings' },
    { role: 'admin', menu_code: 'branches' },
    { role: 'admin', menu_code: 'employees' },
    
    // Cashier has limited access
    { role: 'cashier', menu_code: 'dashboard' },
    { role: 'cashier', menu_code: 'pos' },
    
    // Manager has most access except settings
    { role: 'manager', menu_code: 'dashboard' },
    { role: 'manager', menu_code: 'products' },
    { role: 'manager', menu_code: 'pos' },
    { role: 'manager', menu_code: 'inventory' },
    { role: 'manager', menu_code: 'reports' },
    { role: 'manager', menu_code: 'branches' },
    
    // Default role has minimal access
    { role: 'default', menu_code: 'dashboard' },
    { role: 'default', menu_code: 'pos' },
  ];

  // Insert the default access data
  const { error: insertError } = await supabase
    .from('menu_access')
    .insert(defaultAccess);

  if (insertError) {
    console.error("Error initializing menu access:", insertError);
  } else {
    console.log("Menu access initialized successfully");
  }
};
