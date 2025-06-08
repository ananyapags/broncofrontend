const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function deployFirestoreRules() {
  try {
    console.log('Attempting to deploy Firestore security rules...');
    
    // Read the firestore.rules file
    const rulesContent = fs.readFileSync('./firestore.rules', 'utf8');
    console.log('Rules content loaded successfully');
    
    // Get access token
    const accessToken = await admin.credential.cert(serviceAccount).getAccessToken();
    console.log('Access token obtained');
    
    const projectId = serviceAccount.project_id;
    
    // First, create a new ruleset
    const rulesetData = {
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesContent
          }
        ]
      }
    };
    
    const rulesetOptions = {
      hostname: 'firebaserules.googleapis.com',
      port: 443,
      path: `/v1/projects/${projectId}/rulesets`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.access_token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Creating new ruleset...');
    
    const rulesetResponse = await new Promise((resolve, reject) => {
      const req = https.request(rulesetOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(JSON.stringify(rulesetData));
      req.end();
    });
    
    console.log('Ruleset created:', rulesetResponse.name);
    
    // Now deploy the ruleset
    const releaseData = {
      name: `projects/${projectId}/releases/cloud.firestore`,
      rulesetName: rulesetResponse.name
    };
    
    const releaseOptions = {
      hostname: 'firebaserules.googleapis.com',
      port: 443,
      path: `/v1/projects/${projectId}/releases/cloud.firestore`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken.access_token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('Deploying ruleset...');
    
    const releaseResponse = await new Promise((resolve, reject) => {
      const req = https.request(releaseOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(JSON.stringify(releaseData));
      req.end();
    });
    
    console.log('✅ Successfully deployed Firestore security rules!');
    console.log('Release:', releaseResponse.name);
    console.log('The study session creation permission issue should now be fixed.');
    
  } catch (error) {
    console.error('❌ Error deploying Firestore rules:', error.message);
    console.log('\n📋 Manual deployment instructions:');
    console.log('1. Go to Firebase Console > Firestore Database > Rules');
    console.log('2. Replace the existing rules with the content from firestore.rules');
    console.log('3. Click "Publish"');
    console.log('\nThe updated rules fix the studySessions collection name and permissions.');
  }
}

deployFirestoreRules();