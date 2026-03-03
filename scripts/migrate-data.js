const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// REQUIREMENTS:
// npm install @supabase/supabase-js firebase-admin
// Follow instructions below for configuring keys

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eznxtdzsvnfclgcavvhp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bnh0ZHpzdm5mY2xnY2F2dmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDA5MDcsImV4cCI6MjA3ODE3NjkwN30.uxkZPGvN9-KXqulS-KguoFAvR33RluyNR-O3SNH8iwI';

// You will need to download your Firebase Admin SDK service account JSON
// Go to Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
const serviceAccount = require('./firebase-service-account.json');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Note: Add or remove tables here based on what you actually need to migrate
const TABLES_TO_MIGRATE = [
    'student_tests',
    'student_sets',
    'user_analytics',
    'global',
    'question_set'
];

async function migrateTable(tableName) {
    console.log(`\nStarting migration for table: ${tableName}`);

    // Fetch all rows from Supabase (may need pagination if table is >1000 rows)
    let allRows = [];
    let start = 0;
    const PAGE_SIZE = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .range(start, start + PAGE_SIZE - 1);

        if (error) {
            console.error(`Error fetching ${tableName} from Supabase:`, error);
            return;
        }

        allRows = allRows.concat(data);
        start += PAGE_SIZE;
        hasMore = data.length === PAGE_SIZE;
    }

    console.log(`Found ${allRows.length} rows in ${tableName}. Migrating to Firestore...`);

    let successCount = 0;
    let failureCount = 0;

    // Use Firestore bulk batches for performance (max 500 per batch)
    for (let i = 0; i < allRows.length; i += 400) {
        const batch = db.batch();
        const chunk = allRows.slice(i, i + 400);

        chunk.forEach(row => {
            // If the table has an 'id' column, use it as the Firestore document ID to preserve relations
            const docId = row.id ? String(row.id) : undefined;

            const docRef = docId
                ? db.collection(tableName).doc(docId)
                : db.collection(tableName).doc(); // Auto-generate ID if no 'id' exists

            batch.set(docRef, row, { merge: true });
        });

        try {
            await batch.commit();
            successCount += chunk.length;
            console.log(`Committed chunk of ${chunk.length} items to ${tableName}. Total: ${successCount}`);
        } catch (e) {
            console.error(`Error committing batch to ${tableName}:`, e);
            failureCount += chunk.length;
        }
    }

    console.log(`Finished ${tableName} -> Success: ${successCount}, Failed: ${failureCount}`);
}

async function migrateAllData() {
    console.log('--- Data Migration Started ---');
    for (const table of TABLES_TO_MIGRATE) {
        await migrateTable(table);
    }
    console.log('\n--- Data Migration Complete ---');
}

migrateAllData();
