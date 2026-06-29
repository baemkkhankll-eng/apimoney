const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Render-specific configuration
const IS_RENDER = process.env.RENDER === 'true';
const DATA_DIR = IS_RENDER ? '/tmp' : __dirname;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data files
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const BALANCE_FILE = path.join(DATA_DIR, 'balance.json');

// Initialize data
let transactions = [];
let balance = 0;

// Load data from files
function loadData() {
  try {
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      transactions = JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf8'));
      console.log('Loaded transactions from file');
    }
    
    if (fs.existsSync(BALANCE_FILE)) {
      balance = JSON.parse(fs.readFileSync(BALANCE_FILE, 'utf8')).balance || 0;
      console.log('Loaded balance from file:', balance);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to files
function saveTransactions() {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
}

function saveBalance() {
  try {
    fs.writeFileSync(BALANCE_FILE, JSON.stringify({ balance }, null, 2));
  } catch (error) {
    console.error('Error saving balance:', error);
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Top-up API is running' });
});

// Get current balance
app.get('/api/balance', (req, res) => {
  res.json({ 
    success: true,
    balance: balance,
    currency: 'THB'
  });
});

// Create top-up transaction
app.post('/api/topup', (req, res) => {
  const { angpao_link, phone_number, amount } = req.body;
  
  // Validate input
  if (!angpao_link) {
    return res.status(400).json({ 
      success: false,
      error: 'angpao_link is required' 
    });
  }
  
  if (!phone_number) {
    return res.status(400).json({ 
      success: false,
      error: 'phone_number is required' 
    });
  }
  
  // Validate phone number format (Thai mobile number)
  const phoneRegex = /^0[689]\d{8}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid phone number format. Must be Thai mobile number (e.g., 0812345678)' 
    });
  }
  
  // Validate angpao link format
  if (!angpao_link.includes('truemoney') && !angpao_link.includes('tmn')) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid angpao link. Must be a TrueMoney Wallet link' 
    });
  }
  
  // Generate transaction ID
  const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  // Create transaction record
  const transaction = {
    id: transactionId,
    angpao_link: angpao_link,
    phone_number: phone_number,
    amount: amount || null,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  transactions.push(transaction);
  saveTransactions();
  
  // Simulate processing (in real implementation, this would interact with TrueMoney API)
  setTimeout(() => {
    const txIndex = transactions.findIndex(t => t.id === transactionId);
    if (txIndex !== -1) {
      // Simulate success (90% chance)
      const success = Math.random() > 0.1;
      transactions[txIndex].status = success ? 'completed' : 'failed';
      transactions[txIndex].updated_at = new Date().toISOString();
      
      if (success) {
        const topupAmount = amount || Math.floor(Math.random() * 500) + 10;
        transactions[txIndex].amount = topupAmount;
        balance += topupAmount;
        saveBalance();
      }
      
      saveTransactions();
    }
  }, 3000);
  
  res.json({
    success: true,
    message: 'Top-up request created successfully',
    transaction: {
      id: transactionId,
      phone_number: phone_number,
      amount: amount,
      status: 'pending',
      created_at: transaction.created_at
    }
  });
});

// Get transaction status
app.get('/api/topup/:id', (req, res) => {
  const { id } = req.params;
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return res.status(404).json({ 
      success: false,
      error: 'Transaction not found' 
    });
  }
  
  res.json({
    success: true,
    transaction: transaction
  });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
  const { status, limit = 50 } = req.query;
  
  let filteredTransactions = transactions;
  
  if (status) {
    filteredTransactions = transactions.filter(t => t.status === status);
  }
  
  // Return latest transactions first
  filteredTransactions = filteredTransactions
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, parseInt(limit));
  
  res.json({
    success: true,
    transactions: filteredTransactions,
    total: filteredTransactions.length
  });
});

// Reset balance (for testing)
app.post('/api/reset', (req, res) => {
  balance = 0;
  transactions = [];
  saveBalance();
  saveTransactions();
  
  res.json({
    success: true,
    message: 'System reset successfully'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// Start server
loadData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Top-up API Server running on http://0.0.0.0:${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/balance - Get current balance`);
  console.log(`  POST /api/topup - Create top-up transaction`);
  console.log(`  GET  /api/topup/:id - Get transaction status`);
  console.log(`  GET  /api/transactions - Get all transactions`);
  console.log(`  POST /api/reset - Reset system (testing)`);
});
