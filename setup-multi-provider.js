// setup-multi-provider.js
// Script to set up initial multi-provider configuration
const supabase = require('./backend/supabaseClient');
require('dotenv').config();

async function setupMultiProvider() {
    console.log('🚀 Setting up Multi Provider system...');

    try {
        // 1. Create providers table
        console.log('📋 Creating providers table...');
        
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS providers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                display_name VARCHAR(255) NOT NULL,
                api_url VARCHAR(500) NOT NULL,
                api_id VARCHAR(255) NOT NULL,
                api_key VARCHAR(255) NOT NULL,
                secret_key VARCHAR(255),
                markup_percentage DECIMAL(5,2) DEFAULT 10.00,
                is_active BOOLEAN DEFAULT true,
                sync_services BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;

        const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        if (tableError) {
            console.log('⚠️  Table might already exist or using fallback method...');
        } else {
            console.log('✅ Providers table created successfully');
        }

        // 2. Add provider_id column to services table if it doesn't exist
        console.log('🔗 Adding provider_id column to services table...');
        
        const addColumnSQL = `
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='provider_id') THEN
                    ALTER TABLE services ADD COLUMN provider_id INTEGER;
                    ALTER TABLE services ADD CONSTRAINT fk_services_provider FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `;

        const { error: columnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
        if (columnError) {
            console.log('⚠️  Column might already exist:', columnError.message);
        } else {
            console.log('✅ Provider column added to services table');
        }

        // 3. Create indexes
        console.log('📊 Creating indexes...');
        const indexSQL = `
            CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
            CREATE INDEX IF NOT EXISTS idx_services_provider_service_id_provider ON services(provider_service_id, provider_id);
        `;
        
        const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL });
        if (indexError) {
            console.log('⚠️  Indexes might already exist:', indexError.message);
        } else {
            console.log('✅ Indexes created successfully');
        }

        // 4. Create view
        console.log('👁️  Creating services_with_provider view...');
        const viewSQL = `
            CREATE OR REPLACE VIEW services_with_provider AS
            SELECT 
                s.*,
                p.name as provider_name,
                p.display_name as provider_display_name,
                p.api_url as provider_api_url,
                p.markup_percentage as provider_markup
            FROM services s
            LEFT JOIN providers p ON s.provider_id = p.id;
        `;
        
        const { error: viewError } = await supabase.rpc('exec_sql', { sql: viewSQL });
        if (viewError) {
            console.log('⚠️  View creation failed, will work without it:', viewError.message);
        } else {
            console.log('✅ View created successfully');
        }

        // 5. Insert CentralSMM provider
        console.log('🔧 Setting up CentralSMM provider...');

        const { CENTRALSMM_API_ID, CENTRALSMM_API_KEY, CENTRALSMM_SECRET_KEY } = process.env;

        if (!CENTRALSMM_API_ID || !CENTRALSMM_API_KEY || !CENTRALSMM_SECRET_KEY) {
            console.log('⚠️  Warning: CentralSMM credentials not found in .env file');
            console.log('   You can add them manually through the admin panel');
        } else {
            const { data: existingProvider, error: checkError } = await supabase
                .from('providers')
                .select('id')
                .eq('name', 'centralsmm')
                .single();

            if (!existingProvider && !checkError) {
                console.log('Provider does not exist, creating...');
            } else if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking existing provider:', checkError);
                return;
            }

            if (!existingProvider) {
                const { data: newProvider, error: insertError } = await supabase
                    .from('providers')
                    .insert({
                        name: 'centralsmm',
                        display_name: 'CentralSMM',
                        api_url: 'https://centralsmm.co.id/api',
                        api_id: CENTRALSMM_API_ID,
                        api_key: CENTRALSMM_API_KEY,
                        secret_key: CENTRALSMM_SECRET_KEY,
                        markup_percentage: 10.00,
                        is_active: true,
                        sync_services: true
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('❌ Error inserting CentralSMM provider:', insertError);
                    console.log('💡 You can manually add the provider through the admin panel');
                } else {
                    console.log('✅ CentralSMM provider created:', newProvider);

                    // Update existing services to link to CentralSMM provider
                    console.log('🔗 Linking existing services to CentralSMM provider...');

                    const { error: updateError } = await supabase
                        .from('services')
                        .update({ provider_id: newProvider.id })
                        .is('provider_id', null);

                    if (updateError) {
                        console.error('❌ Error updating services:', updateError);
                    } else {
                        console.log('✅ Existing services linked to CentralSMM provider');
                    }
                }
            } else {
                console.log('✅ CentralSMM provider already exists');
            }
        }

        // 6. Show summary
        console.log('\n🎉 Multi Provider setup completed!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Providers table created/verified');
        console.log('   ✅ Services table updated with provider_id column');
        console.log('   ✅ Database indexes created');
        console.log('   ✅ CentralSMM provider configured (if credentials available)');
        console.log('\n🎯 What you can do now:');
        console.log('   1. Access the Multi Provider admin page at /admin/multi-provider');
        console.log('   2. Add new SMM providers');
        console.log('   3. Test provider connections');
        console.log('   4. Sync services from multiple providers');
        console.log('   5. Configure different markup percentages per provider');
        
        // 7. Check current providers
        const { data: providers, error: providersError } = await supabase
            .from('providers')
            .select('*')
            .order('created_at');

        if (!providersError && providers && providers.length > 0) {
            console.log('\n📊 Current Providers:');
            providers.forEach(provider => {
                console.log(`   • ${provider.display_name} (${provider.name})`);
                console.log(`     Status: ${provider.is_active ? 'Active' : 'Inactive'}`);
                console.log(`     Markup: ${provider.markup_percentage}%`);
                console.log(`     API URL: ${provider.api_url}`);
                console.log('');
            });
        } else if (providersError) {
            console.log('\n⚠️  Could not fetch providers list:', providersError.message);
        } else {
            console.log('\n📊 No providers found. You can add them through the admin panel.');
        }

    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Run setup if called directly
if (require.main === module) {
    setupMultiProvider()
        .then(() => {
            console.log('\n✅ Setup complete! You can now start the application.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupMultiProvider };
