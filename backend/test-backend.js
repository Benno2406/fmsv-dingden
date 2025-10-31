#!/usr/bin/env node

/**
 * Backend Test Script
 * Prüft, ob das Backend korrekt geladen werden kann
 */

console.log('🔍 Backend Test gestartet...\n');

// Test 1: Environment Variables
console.log('1️⃣ Environment Variables prüfen...');
require('dotenv').config();
console.log('   ✅ dotenv geladen');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'nicht gesetzt'}`);
console.log(`   PORT: ${process.env.PORT || 3000}`);
console.log(`   DB_HOST: ${process.env.DB_HOST || 'nicht gesetzt'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'nicht gesetzt'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '[GESETZT]' : 'NICHT GESETZT!'}`);
console.log('');

// Test 2: Logger
console.log('2️⃣ Logger laden...');
try {
  const { logger } = require('./utils/logger');
  logger.info('Logger erfolgreich geladen');
  console.log('   ✅ Logger funktioniert');
} catch (error) {
  console.error('   ❌ Logger Fehler:', error.message);
  process.exit(1);
}
console.log('');

// Test 3: Database Config
console.log('3️⃣ Database Config laden...');
try {
  const pool = require('./config/database');
  console.log('   ✅ Database Config geladen');
} catch (error) {
  console.error('   ❌ Database Config Fehler:', error.message);
  console.error('   Stack:', error.stack);
  process.exit(1);
}
console.log('');

// Test 4: Database Connection
console.log('4️⃣ Datenbank-Verbindung testen...');
const pool = require('./config/database');
pool.query('SELECT NOW()')
  .then((result) => {
    console.log(`   ✅ Verbindung erfolgreich`);
    console.log(`   Zeitstempel: ${result.rows[0].now}`);
  })
  .catch((error) => {
    console.error('   ❌ Verbindung fehlgeschlagen:', error.message);
    process.exit(1);
  })
  .finally(() => {
    console.log('');
    continueTests();
  });

function continueTests() {
  // Test 5: Middleware
  console.log('5️⃣ Middleware laden...');
  try {
    require('./middleware/errorHandler');
    console.log('   ✅ errorHandler');
    
    require('./middleware/rateLimiter');
    console.log('   ✅ rateLimiter');
    
    require('./middleware/auth');
    console.log('   ✅ auth');
    
    require('./middleware/rbac');
    console.log('   ✅ rbac');
    
    require('./middleware/twoFactor');
    console.log('   ✅ twoFactor');
    
    require('./middleware/upload');
    console.log('   ✅ upload');
  } catch (error) {
    console.error('   ❌ Middleware Fehler:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
  console.log('');

  // Test 6: Utils
  console.log('6️⃣ Utils laden...');
  try {
    require('./utils/jwt');
    console.log('   ✅ jwt');
    
    require('./utils/audit');
    console.log('   ✅ audit');
  } catch (error) {
    console.error('   ❌ Utils Fehler:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
  console.log('');

  // Test 7: Routes
  console.log('7️⃣ Routes laden...');
  try {
    require('./routes/auth');
    console.log('   ✅ auth');
    
    require('./routes/users');
    console.log('   ✅ users');
    
    require('./routes/articles');
    console.log('   ✅ articles');
    
    require('./routes/events');
    console.log('   ✅ events');
    
    require('./routes/images');
    console.log('   ✅ images');
    
    require('./routes/flugbuch');
    console.log('   ✅ flugbuch');
    
    require('./routes/protocols');
    console.log('   ✅ protocols');
    
    require('./routes/notifications');
    console.log('   ✅ notifications');
    
    require('./routes/rbac');
    console.log('   ✅ rbac');
  } catch (error) {
    console.error('   ❌ Routes Fehler:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   Datei:', error.stack.split('\n')[1]);
    process.exit(1);
  }
  console.log('');

  // Test 8: Express App
  console.log('8️⃣ Express App laden...');
  try {
    const express = require('express');
    const app = express();
    console.log('   ✅ Express geladen');
  } catch (error) {
    console.error('   ❌ Express Fehler:', error.message);
    process.exit(1);
  }
  console.log('');

  // Alle Tests bestanden!
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ ALLE TESTS BESTANDEN!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('Das Backend sollte starten können. Versuche:');
  console.log('  node server.js');
  console.log('  oder');
  console.log('  npm start');
  console.log('');
  
  pool.end();
  process.exit(0);
}
