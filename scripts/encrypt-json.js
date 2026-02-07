/**
 * Script to encrypt JSON files for obfuscation.
 * 
 * Usage:
 *   node scripts/encrypt-json.js <input.json> [output.enc]
 *   node scripts/encrypt-json.js --dir <directory>  (encrypts all .json files in directory)
 * 
 * Examples:
 *   node scripts/encrypt-json.js condensed/Physics_questions.json
 *   node scripts/encrypt-json.js --dir condensed
 */

const fs = require('fs');
const path = require('path');

// Same key as in cryptoUtils.ts - MUST MATCH!
const K1 = 'pReP';
const K2 = 'aIrEd';
const K3 = '2026';
const K4 = 'sEcReT';
const OBFUSCATION_KEY = K1 + K2 + K3 + K4;

/**
 * XOR transform
 */
function xorTransform(input, key) {
    let result = '';
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * Encrypt JSON string
 */
function encryptData(jsonString) {
    const xored = xorTransform(jsonString, OBFUSCATION_KEY);
    return Buffer.from(xored, 'utf-8').toString('base64');
}

/**
 * Encrypt a single JSON file
 */
function encryptFile(inputPath, outputPath) {
    if (!fs.existsSync(inputPath)) {
        console.error(`❌ File not found: ${inputPath}`);
        return false;
    }

    const jsonContent = fs.readFileSync(inputPath, 'utf-8');

    // Validate JSON
    try {
        JSON.parse(jsonContent);
    } catch (e) {
        console.error(`❌ Invalid JSON in ${inputPath}: ${e.message}`);
        return false;
    }

    const encrypted = encryptData(jsonContent);
    fs.writeFileSync(outputPath, encrypted, 'utf-8');

    const inputSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
    const outputSize = (fs.statSync(outputPath).size / 1024).toFixed(1);

    console.log(`✅ Encrypted: ${path.basename(inputPath)} (${inputSize}KB) → ${path.basename(outputPath)} (${outputSize}KB)`);
    return true;
}

/**
 * Encrypt all JSON files in a directory
 */
function encryptDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        console.error(`❌ Directory not found: ${dirPath}`);
        return;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('⚠️  No .json files found in directory');
        return;
    }

    console.log(`\n🔐 Encrypting ${files.length} JSON files in ${dirPath}...\n`);

    let success = 0;
    for (const file of files) {
        const inputPath = path.join(dirPath, file);
        const outputPath = path.join(dirPath, file.replace('.json', '.enc'));
        if (encryptFile(inputPath, outputPath)) {
            success++;
        }
    }

    console.log(`\n✨ Done! Encrypted ${success}/${files.length} files.\n`);
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
🔐 JSON Encryption Script

Usage:
  node scripts/encrypt-json.js <input.json> [output.enc]
  node scripts/encrypt-json.js --dir <directory>

Examples:
  node scripts/encrypt-json.js condensed/Physics_questions.json
  node scripts/encrypt-json.js --dir condensed
`);
    process.exit(0);
}

if (args[0] === '--dir') {
    if (!args[1]) {
        console.error('❌ Please specify a directory');
        process.exit(1);
    }
    encryptDirectory(args[1]);
} else {
    const inputPath = args[0];
    const outputPath = args[1] || inputPath.replace('.json', '.enc');
    encryptFile(inputPath, outputPath);
}
