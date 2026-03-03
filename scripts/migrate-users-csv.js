const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');

const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const CSV_FILE_PATH = './users.csv';

// Helper: Validate URL
function isValidURL(url) {
    if (!url || url === 'null') return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

async function migrateUsersFromCSV() {
    console.log('Reading users from CSV...');
    const users = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream(CSV_FILE_PATH)
            .pipe(csv())
            .on('data', (data) => users.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Found ${users.length} users in CSV. Starting migration...`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < users.length; i += 500) {
        const chunk = users.slice(i, i + 500);
        const firebaseAuthUsers = [];
        const firestoreBatch = db.batch();

        for (const user of chunk) {
            if (!user.email) continue;

            const uid = user.supabase_uid?.trim();

            if (!uid) {
                console.log("Skipping user with missing supabase_uid:", user.email);
                continue;
            }

            const authUser = {
                uid: uid,
                email: user.email.trim(),
                emailVerified: !!user.email_confirmed_at,
            };

            // Optional display name
            if (user.full_name && user.full_name !== 'null') {
                authUser.displayName = user.full_name.trim();
            }

            // Optional avatar (ONLY if valid absolute URL)
            if (isValidURL(user.avatar_url)) {
                authUser.photoURL = user.avatar_url.trim();
            }

            // Password import (only if exported)
            if (user.encrypted_password && user.encrypted_password !== 'null') {
                authUser.passwordHash = Buffer.from(user.encrypted_password);
            }

            firebaseAuthUsers.push(authUser);

            // Firestore document
            const docRef = db.collection('users').doc(uid);

            firestoreBatch.set(docRef, {
                id: uid,
                email: user.email.trim(),
                full_name: user.full_name || '',
                avatar_url: user.avatar_url || '',
                provider: user.provider || '',
                subscription_tier: 'free',
                created_at: user.created_at || admin.firestore.FieldValue.serverTimestamp(),
                email_confirmed_at: user.email_confirmed_at || null
            }, { merge: true });
        }

        try {
            const importResult = await auth.importUsers(firebaseAuthUsers, {
                hash: {
                    algorithm: 'BCRYPT'
                }
            });

            await firestoreBatch.commit();

            successCount += importResult.successCount;
            failureCount += importResult.failureCount;

            importResult.errors.forEach((err) => {
                console.error(`Failed to import user at index ${err.index}: ${err.error.message}`);
            });

            console.log(`Processed chunk: ${i} to ${i + chunk.length}`);
        } catch (err) {
            console.error('Fatal error processing chunk:', err);
        }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Successfully Migrated: ${successCount}`);
    console.log(`Failed Migrations: ${failureCount}`);
}

migrateUsersFromCSV();