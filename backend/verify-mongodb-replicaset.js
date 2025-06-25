require('dotenv').config();
const mongoose = require('mongoose');

async function verifyMongoDBSetup() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        
        console.log('✅ Connected to MongoDB successfully');
        
        // Check if it's a replica set
        const admin = mongoose.connection.db.admin();
        const ismaster = await admin.command({ isMaster: 1 });
        
        console.log('\n📊 MongoDB Configuration:');
        console.log('- Connection Type:', ismaster.ismaster ? 'Primary' : 'Secondary');
        console.log('- Replica Set Name:', ismaster.setName || 'None (Standalone)');
        console.log('- MongoDB Version:', ismaster.maxWireVersion);
        
        if (ismaster.setName) {
            console.log('✅ MongoDB is configured as a replica set!');
            console.log('✅ Change Streams are SUPPORTED');
            
            // Test Change Streams capability
            console.log('\n🧪 Testing Change Streams...');
            const testCollection = mongoose.connection.db.collection('test_changestreams');
            
            try {
                const changeStream = testCollection.watch();
                console.log('✅ Change Streams test PASSED');
                changeStream.close();
                
                // Clean up test
                await testCollection.deleteMany({});
                
            } catch (changeStreamError) {
                console.log('❌ Change Streams test FAILED:', changeStreamError.message);
                console.log('💡 This might be due to MongoDB Atlas free tier limitations');
            }
            
        } else {
            console.log('❌ MongoDB is running as standalone');
            console.log('❌ Change Streams are NOT supported');
            console.log('💡 Conversion to replica set required');
        }
        
        // Check Atlas tier information
        if (process.env.MONGO_URI.includes('mongodb.net')) {
            console.log('\n🌍 Detected MongoDB Atlas');
            console.log('💡 Atlas clusters are replica sets by default');
            console.log('💡 If using M0/M2/M5 (free tier), consider upgrading to M10+ for full Change Stream support');
        }
        
    } catch (error) {
        console.error('❌ Error verifying MongoDB setup:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

verifyMongoDBSetup();
