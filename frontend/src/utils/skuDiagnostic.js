/**
 * SKU Search Diagnostic Utility
 * 
 * This utility helps diagnose SKU search issues by:
 * 1. Checking if products have SKU values
 * 2. Testing different search patterns
 * 3. Verifying backend search functionality
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sippy-ecommerce-web-app.onrender.com/api';

/**
 * Fetch a sample of products to check SKU field population
 */
export const checkProductSKUs = async () => {
    try {
        console.log('🔍 SKU DIAGNOSTIC: Checking product SKU fields...');
        
        const response = await axios.get(`${API_BASE_URL}/products?page=1&limit=50`);
        
        if (response.data.success && response.data.products) {
            const products = response.data.products;
            const productsWithSKU = products.filter(p => p.sku && p.sku.trim() !== '');
            const productsWithoutSKU = products.filter(p => !p.sku || p.sku.trim() === '');
            
            console.log('📊 SKU DIAGNOSTIC RESULTS:');
            console.log(`Total products sampled: ${products.length}`);
            console.log(`Products WITH SKU: ${productsWithSKU.length}`);
            console.log(`Products WITHOUT SKU: ${productsWithoutSKU.length}`);
            
            if (productsWithSKU.length > 0) {
                console.log('\n✅ Sample products with SKU:');
                productsWithSKU.slice(0, 10).forEach(p => {
                    console.log(`  - SKU: ${p.sku} | Name: ${p.name}`);
                });
                
                console.log('\n🧪 Testing search with first SKU:', productsWithSKU[0].sku);
                await testSKUSearch(productsWithSKU[0].sku);
            } else {
                console.warn('⚠️ NO PRODUCTS HAVE SKU VALUES!');
                console.warn('This is why SKU search returns no results.');
                console.log('\n📝 Products without SKU (sample):');
                productsWithoutSKU.slice(0, 5).forEach(p => {
                    console.log(`  - Name: ${p.name} | SKU: ${p.sku || 'NULL'}`);
                });
            }
            
            return {
                total: products.length,
                withSKU: productsWithSKU.length,
                withoutSKU: productsWithoutSKU.length,
                samples: productsWithSKU.slice(0, 10)
            };
        }
    } catch (error) {
        console.error('❌ SKU DIAGNOSTIC ERROR:', error);
    }
};

/**
 * Test searching for a specific SKU
 */
export const testSKUSearch = async (sku) => {
    try {
        console.log(`\n🔍 Testing search for SKU: "${sku}"`);
        
        const response = await axios.get(
            `${API_BASE_URL}/products/search?q=${encodeURIComponent(sku)}&page=1&limit=20`
        );
        
        console.log('Search Results:');
        console.log(`  - Success: ${response.data.success}`);
        console.log(`  - Products found: ${response.data.products?.length || 0}`);
        
        if (response.data.products?.length > 0) {
            console.log('  - Matched products:');
            response.data.products.forEach(p => {
                console.log(`    * SKU: ${p.sku} | Name: ${p.name}`);
            });
        } else {
            console.warn('  - ⚠️ No products found for this SKU');
        }
        
        return response.data;
    } catch (error) {
        console.error('❌ Search test failed:', error);
    }
};

/**
 * Run complete diagnostic
 */
export const runFullDiagnostic = async () => {
    console.log('🚀 Starting SKU Search Full Diagnostic...\n');
    await checkProductSKUs();
    console.log('\n✅ Diagnostic complete!');
};
