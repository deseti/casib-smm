const supabase = require('./supabaseClient');

async function debugProviders() {
  try {
    console.log('=== DEBUG: Cek semua providers ===');
    const { data: providers, error } = await supabase
      .from('providers')
      .select('*');
    if (error) throw error;
    console.log('Total providers:', providers?.length || 0);
    if (providers && providers.length > 0) {
      console.log('Providers:', JSON.stringify(providers, null, 2));
    }
    
    console.log('\n=== DEBUG: Cek orders pending dengan provider info ===');
    const { data: pendingOrders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id, 
        provider_order_id, 
        status, 
        service_id,
        services!inner(provider_id, providers!inner(
          id, name, display_name, api_url, api_id, api_key, secret_key, 
          status_endpoint, api_format, auth_method, is_active
        ))
      `)
      .in('status', ['pending', 'processing', 'Processing', 'in_progress', 'In Progress'])
      .not('provider_order_id', 'is', null);
    
    if (orderError) throw orderError;
    console.log('Total pending orders:', pendingOrders?.length || 0);
    if (pendingOrders && pendingOrders.length > 0) {
      console.log('Pending orders dengan provider:', JSON.stringify(pendingOrders, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugProviders();
