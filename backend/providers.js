// backend/providers.js
const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// GET /api/providers - Get all providers
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/providers/:id - Get single provider
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Provider not found' });
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching provider:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/providers - Create new provider
router.post('/', async (req, res) => {
    try {
        const {
            name,
            display_name,
            api_url,
            api_id,
            api_key,
            secret_key,
            markup_percentage = 10.00,
            is_active = true,
            sync_services = true
        } = req.body;

        // Validate required fields
        if (!name || !display_name || !api_url || !api_id || !api_key) {
            return res.status(400).json({ 
                error: 'Missing required fields: name, display_name, api_url, api_id, api_key' 
            });
        }

        const { data, error } = await supabase
            .from('providers')
            .insert({
                name: name.toLowerCase().replace(/\s+/g, '_'), // Normalize name
                display_name,
                api_url: api_url.replace(/\/$/, ''), // Remove trailing slash
                api_id,
                api_key,
                secret_key,
                markup_percentage: parseFloat(markup_percentage),
                is_active,
                sync_services
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return res.status(400).json({ error: 'Provider name already exists' });
            }
            throw error;
        }

        res.status(201).json({ message: 'Provider created successfully', provider: data });
    } catch (error) {
        console.error('Error creating provider:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/providers/:id - Update provider
router.put('/:id', async (req, res) => {
    try {
        const {
            display_name,
            api_url,
            api_id,
            api_key,
            secret_key,
            markup_percentage,
            is_active,
            sync_services
        } = req.body;

        const updateData = {};
        if (display_name !== undefined) updateData.display_name = display_name;
        if (api_url !== undefined) updateData.api_url = api_url.replace(/\/$/, '');
        if (api_id !== undefined) updateData.api_id = api_id;
        if (api_key !== undefined) updateData.api_key = api_key;
        if (secret_key !== undefined) updateData.secret_key = secret_key;
        if (markup_percentage !== undefined) updateData.markup_percentage = parseFloat(markup_percentage);
        if (is_active !== undefined) updateData.is_active = is_active;
        if (sync_services !== undefined) updateData.sync_services = sync_services;

        const { data, error } = await supabase
            .from('providers')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Provider not found' });

        res.json({ message: 'Provider updated successfully', provider: data });
    } catch (error) {
        console.error('Error updating provider:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/providers/:id - Delete provider
router.delete('/:id', async (req, res) => {
    try {
        // Check if provider has services
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('id')
            .eq('provider_id', req.params.id)
            .limit(1);

        if (servicesError) throw servicesError;

        if (services && services.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete provider with associated services. Please delete services first or transfer them to another provider.' 
            });
        }

        const { data, error } = await supabase
            .from('providers')
            .delete()
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Provider not found' });

        res.json({ message: 'Provider deleted successfully' });
    } catch (error) {
        console.error('Error deleting provider:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/providers/:id/test - Test provider connection with format-specific handling
router.post('/:id/test', async (req, res) => {
    try {
        const { data: provider, error } = await supabase
            .from('providers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        // Build test URL and auth data based on provider format
        const profileUrl = `${provider.api_url}${provider.profile_endpoint || '/profile'}`;
        
        let requestOptions = {
            method: 'POST',
            headers: {
                'User-Agent': 'CasibSMM/1.0'
            }
        };

        // Configure auth based on provider format and method
        if (provider.auth_method === 'header') {
            // Header-based auth (Token)
            requestOptions.headers['Authorization'] = `Bearer ${provider.token}`;
            requestOptions.headers['Content-Type'] = 'application/json';
            
        } else if (provider.auth_method === 'json') {
            // JSON body auth
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(buildAuthData(provider));
            
        } else {
            // Form data auth (default)
            requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            const formBody = new URLSearchParams();
            const authData = buildAuthData(provider);
            
            Object.keys(authData).forEach(key => {
                if (authData[key]) formBody.append(key, authData[key]);
            });
            
            requestOptions.body = formBody.toString();
        }

        console.log(`🧪 Testing ${provider.display_name} connection...`);
        console.log(`📡 URL: ${profileUrl}`);
        console.log(`🔐 Format: ${provider.api_format}, Method: ${provider.auth_method}`);

        const response = await fetch(profileUrl, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            throw new Error('Provider returned non-JSON response. Check credentials.');
        }        const data = await response.json();
        
        // Extract balance info if available
        let balanceInfo = null;
        if (data.response && data.data) {
            if (data.data.balance !== undefined) {
                balanceInfo = {
                    balance: data.data.balance,
                    username: data.data.username || 'N/A',
                    currency: 'IDR' // Default, bisa disesuaikan per provider
                };
            }
        }
        
        // Log balance for console
        if (balanceInfo) {
            console.log(`💰 ${provider.display_name} Balance: ${balanceInfo.currency} ${balanceInfo.balance.toLocaleString()}`);
        }
        
        res.json({
            success: true,
            message: `Provider ${provider.display_name} connection successful`,
            balance: balanceInfo,
            provider_response: data,
            connection_info: {
                format: provider.api_format,
                auth_method: provider.auth_method,
                endpoint: profileUrl
            }
        });

    } catch (error) {
        console.error('Error testing provider:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            message: 'Failed to connect to provider'
        });
    }
});

// Helper function to build auth data based on provider format
function buildAuthData(provider) {
    switch (provider.api_format) {
        case 'centralsmm':
            return {
                api_id: provider.api_id,
                api_key: provider.api_key,
                secret_key: provider.secret_key
            };
            
        case 'panelchild':
            return {
                key: provider.api_key,
                action: 'services'
            };
            
        case 'justanother':
            return {
                api_key: provider.api_key
            };
            
        case 'token':
            return {}; // Token is handled in headers
            
        case 'custom':
            // For custom format, use available fields
            const customData = {};
            if (provider.api_id) customData.api_id = provider.api_id;
            if (provider.user_id) customData.user_id = provider.user_id;
            if (provider.api_key) customData.api_key = provider.api_key;
            if (provider.api_key_v2) customData.api_key_v2 = provider.api_key_v2;
            if (provider.secret_key) customData.secret_key = provider.secret_key;
            if (provider.token) customData.token = provider.token;
            return customData;
            
        default: // standard
            const standardData = {
                api_key: provider.api_key
            };
            
            // Use api_id or user_id
            if (provider.api_id) {
                standardData.api_id = provider.api_id;
            } else if (provider.user_id) {
                standardData.user_id = provider.user_id;
            }
            
            // Add optional secret key
            if (provider.secret_key) {
                standardData.secret_key = provider.secret_key;
            }
            
            return standardData;
    }
}

// POST /api/providers/:id/sync-services - Sync services from specific provider
router.post('/:id/sync-services', async (req, res) => {
    try {
        const { data: provider, error } = await supabase
            .from('providers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        if (!provider.is_active) {
            return res.status(400).json({ error: 'Provider is not active' });
        }

        // Build services URL and auth data
        const servicesUrl = `${provider.api_url}${provider.services_endpoint || '/services'}`;
        
        let requestOptions = {
            method: 'POST',
            headers: {
                'User-Agent': 'CasibSMM/1.0'
            }
        };

        // Configure request based on provider format
        if (provider.auth_method === 'header') {
            requestOptions.headers['Authorization'] = `Bearer ${provider.token}`;
            requestOptions.headers['Content-Type'] = 'application/json';
            
        } else if (provider.auth_method === 'json') {
            requestOptions.headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(buildAuthData(provider, 'services'));
            
        } else {
            requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            const formBody = new URLSearchParams();
            const authData = buildAuthData(provider, 'services');
            
            Object.keys(authData).forEach(key => {
                if (authData[key]) formBody.append(key, authData[key]);
            });
            
            requestOptions.body = formBody.toString();
        }

        console.log(`🔄 Syncing services from ${provider.display_name}...`);
        
        const response = await fetch(servicesUrl, requestOptions);
        const providerData = await response.json();

        if (!providerData.response || !Array.isArray(providerData.data)) {
            throw new Error(providerData.data?.msg || 'Failed to fetch services from provider.');
        }

        const servicesFromProvider = providerData.data;
        console.log(`Found ${servicesFromProvider.length} services from ${provider.display_name}.`);

        // Format data with provider-specific markup
        const markupPercentage = provider.markup_percentage / 100;
        const servicesToUpsert = servicesFromProvider.map(service => {
            const originalPrice = parseFloat(service.price);
            const markedUpPrice = originalPrice * (1 + markupPercentage);
            
            return {
                provider_id: provider.id,
                provider_service_id: service.id,
                name: service.service_name || service.name,
                category: service.category_name || service.category,
                category_name: service.category_name || service.category,
                price_per_1000: markedUpPrice,
                original_price: originalPrice,
                min_order: service.min || service.min_order || 1,
                max_order: service.max || service.max_order || 100000,
                refill: service.refill || false,
                description: service.description || service.desc || '',
            };
        });

        console.log(`💰 Applying ${provider.markup_percentage}% markup to ${servicesToUpsert.length} services from ${provider.display_name}`);

        // Upsert services - use provider_id + provider_service_id as unique constraint
        const { error: upsertError } = await supabase
            .from('services')
            .upsert(servicesToUpsert, {
                onConflict: 'provider_id,provider_service_id',
                ignoreDuplicates: false
            });
        
        if (upsertError) throw upsertError;

        res.json({ 
            message: `Services synced successfully from ${provider.display_name}`,
            synced_count: servicesFromProvider.length,
            provider: provider.display_name,
            format: provider.api_format,
            markup_applied: `${provider.markup_percentage}%`
        });

    } catch (error) {
        console.error('Error syncing services from provider:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to build auth data with action support
function buildAuthData(provider, action = null) {
    switch (provider.api_format) {
        case 'centralsmm':
            return {
                api_id: provider.api_id,
                api_key: provider.api_key,
                secret_key: provider.secret_key
            };
            
        case 'panelchild':
            return {
                key: provider.api_key,
                action: action || 'services'
            };
            
        case 'justanother':
            return {
                api_key: provider.api_key
            };
            
        case 'token':
            return {}; // Token handled in headers
            
        case 'custom':
            const customData = {};
            if (provider.api_id) customData.api_id = provider.api_id;
            if (provider.user_id) customData.user_id = provider.user_id;
            if (provider.api_key) customData.api_key = provider.api_key;
            if (provider.api_key_v2) customData.api_key_v2 = provider.api_key_v2;
            if (provider.secret_key) customData.secret_key = provider.secret_key;
            if (provider.token) customData.token = provider.token;
            if (action) customData.action = action;
            return customData;
            
        default: // standard
            const standardData = {
                api_key: provider.api_key
            };
            
            if (provider.api_id) {
                standardData.api_id = provider.api_id;
            } else if (provider.user_id) {
                standardData.user_id = provider.user_id;
            }
            
            if (provider.secret_key) {
                standardData.secret_key = provider.secret_key;
            }
            
            if (action) {
                standardData.action = action;
            }
            
            return standardData;
    }
}

// POST /api/providers/sync-all - Sync services from all active providers
router.post('/sync-all', async (req, res) => {
    try {
        const { data: providers, error } = await supabase
            .from('providers')
            .select('*')
            .eq('is_active', true)
            .eq('sync_services', true);

        if (error) throw error;

        if (!providers || providers.length === 0) {
            return res.status(400).json({ error: 'No active providers found for syncing' });
        }

        const syncResults = [];
        let totalSynced = 0;

        for (const provider of providers) {
            try {
                // Call the sync endpoint for each provider
                const syncResponse = await fetch(`http://localhost:3001/api/providers/${provider.id}/sync-services`, {
                    method: 'POST',
                    headers: {
                        'Authorization': req.headers.authorization
                    }
                });

                const syncData = await syncResponse.json();
                
                if (syncResponse.ok) {
                    syncResults.push({
                        provider: provider.display_name,
                        success: true,
                        synced_count: syncData.synced_count,
                        message: syncData.message
                    });
                    totalSynced += syncData.synced_count;
                } else {
                    syncResults.push({
                        provider: provider.display_name,
                        success: false,
                        error: syncData.error
                    });
                }
            } catch (err) {
                syncResults.push({
                    provider: provider.display_name,
                    success: false,
                    error: err.message
                });
            }
        }

        res.json({
            message: `Sync completed for ${providers.length} providers`,
            total_synced: totalSynced,
            results: syncResults
        });

    } catch (error) {
        console.error('Error syncing all providers:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/providers/:id/sync-orders - Sync order status for specific provider
router.post('/:id/sync-orders', async (req, res) => {
    try {
        const { data: provider, error } = await supabase
            .from('providers')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        if (!provider.is_active) {
            return res.status(400).json({ error: 'Provider is not active' });
        }

        // Get pending orders for this provider
        const { data: pendingOrders, error: orderError } = await supabase
            .from('orders')
            .select(`
                id, 
                provider_order_id, 
                status, 
                service_id,
                services!inner(provider_id)
            `)
            .in('status', ['pending', 'processing', 'Processing', 'in_progress', 'In Progress'])
            .not('provider_order_id', 'is', null)
            .eq('services.provider_id', provider.id);

        if (orderError) throw orderError;

        if (!pendingOrders || pendingOrders.length === 0) {
            return res.json({
                message: `No pending orders found for ${provider.display_name}`,
                synced_count: 0,
                total_orders: 0
            });
        }

        console.log(`🔄 Manual sync: ${pendingOrders.length} orders dari ${provider.display_name}...`);

        const statusUrl = `${provider.api_url}${provider.status_endpoint || '/status'}`;
        let syncedCount = 0;
        const errors = [];

        for (const order of pendingOrders) {
            try {
                let requestOptions = {
                    method: 'POST',
                    headers: {
                        'User-Agent': 'CasibSMM/1.0'
                    }
                };

                // Build auth data
                const authData = {
                    api_id: provider.api_id,
                    api_key: provider.api_key,
                    secret_key: provider.secret_key,
                    id: order.provider_order_id
                };

                // Configure request based on provider format
                if (provider.auth_method === 'json') {
                    requestOptions.headers['Content-Type'] = 'application/json';
                    requestOptions.body = JSON.stringify(authData);
                } else {
                    requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    const formBody = new URLSearchParams();
                    Object.keys(authData).forEach(key => {
                        if (authData[key]) formBody.append(key, authData[key]);
                    });
                    requestOptions.body = formBody.toString();
                }

                const response = await fetch(statusUrl, requestOptions);
                const data = await response.json();

                if (data.response && data.data) {
                    // Update status di database
                    const { error: updateError } = await supabase.rpc('sync_order_status_with_provider', {
                        p_provider_order_id: order.provider_order_id,
                        p_status: data.data.status,
                        p_start_count: data.data.start_count,
                        p_remains: data.data.remains
                    });

                    if (!updateError) {
                        syncedCount++;
                    } else {
                        errors.push(`Error updating order ${order.id}: ${updateError.message}`);
                    }
                } else {
                    errors.push(`Error from provider for order ${order.provider_order_id}: ${data.data?.msg || 'Unknown error'}`);
                }

                // Small delay
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (err) {
                errors.push(`Error syncing order ${order.id}: ${err.message}`);
            }
        }

        res.json({
            message: `Manual sync completed for ${provider.display_name}`,
            synced_count: syncedCount,
            total_orders: pendingOrders.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Error syncing orders for provider:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
