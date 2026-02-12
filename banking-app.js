// Combos Bank - Enhanced Digital Banking Platform
// Owner: Olawale Abdul-Ganiyu
// CBN Code: agb 999

// ==================== STATE MANAGEMENT ====================

const appState = {
    profile: {
        name: 'Olawale Abdul-Ganiyu',
        dob: '13/12/1985',
        sex: 'Male',
        country: 'Nigeria',
        accountNumber: generateAccountNumber(),
        bvn: '12345678901',
        nin: '12345678901',
        email: 'olawale@combosbank.com',
        phone: '+234 801 234 5678',
        photo: 'https://via.placeholder.com/200'
    },
    balances: {
        main: 0,
        wallet: 0,
        debitWallet: 0,
        creditWallet: 0,
        usd: 0,
        eur: 0,
        gbp: 0,
        ngn: 0,
        btc: 0,
        trx: 0,
        ton: 0
    },
    walletAddresses: {
        debit: 'N/A',
        credit: 'N/A',
        btc: 'N/A',
        trx: 'N/A',
        ton: 'N/A',
        usd: 'N/A',
        eur: 'N/A',
        gbp: 'N/A',
        ngn: 'N/A'
    },
    transactions: [],
    alerts: {
        transactionSMS: true,
        balanceSMS: true,
        loginSMS: true,
        transactionEmail: true,
        balanceEmail: false,
        securityEmail: true
    },
    selectedBank: null,
    selectedPaymentMethod: null,
    lastBackup: null
};

// Currency Exchange Rates
const exchangeRates = {
    USD: { NGN: 1550, EUR: 0.92, GBP: 0.79 },
    EUR: { NGN: 1685, USD: 1.09, GBP: 0.86 },
    GBP: { NGN: 1960, USD: 1.27, EUR: 1.16 },
    NGN: { USD: 0.000645, EUR: 0.000593, GBP: 0.00051 }
};

// ==================== UTILITY FUNCTIONS ====================

function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function formatCurrency(amount) {
    return `₦${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    generateWalletAddress();
    generateCryptoAddress();
    generateInternationalWalletAddresses();
    updateUI();
    initializeLicense();
    initializeMining();
    initializeBackupSystem();
});

// ==================== TAB NAVIGATION ====================

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showTransferType(type) {
    document.querySelectorAll('.transfer-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${type}Transfer`).style.display = 'block';
    
    document.querySelectorAll('#transfers .tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function showBankTab(tabId) {
    document.querySelectorAll('#transfers #commercial, #transfers #fintech').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('#accountTransfer .tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ==================== MODAL FUNCTIONS ====================

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};

// ==================== BALANCE OPERATIONS ====================

function openCreditModal() {
    openModal('creditModal');
}

function executeCredit() {
    const amount = parseFloat(document.getElementById('creditAmount').value);
    const description = document.getElementById('creditDescription').value || 'Credit transaction';
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    appState.balances.main += amount;
    addTransaction('credit', amount, description);
    updateUI();
    sendAlerts('credit', amount, description);
    closeModal('creditModal');
    showStatus(`Successfully credited ₦${amount.toLocaleString()}`, 'success');
    
    document.getElementById('creditAmount').value = '';
    document.getElementById('creditDescription').value = '';
    saveToLocalStorage();
}

function openDebitModal() {
    openModal('debitModal');
}

function executeDebit() {
    const amount = parseFloat(document.getElementById('debitAmount').value);
    const description = document.getElementById('debitDescription').value || 'Debit transaction';
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.main) {
        showStatus('Insufficient balance', 'error');
        return;
    }
    
    appState.balances.main -= amount;
    addTransaction('debit', amount, description);
    updateUI();
    sendAlerts('debit', amount, description);
    closeModal('debitModal');
    showStatus(`Successfully debited ₦${amount.toLocaleString()}`, 'success');
    
    document.getElementById('debitAmount').value = '';
    document.getElementById('debitDescription').value = '';
    saveToLocalStorage();
}

function openEditBalanceModal() {
    openModal('editBalanceModal');
}

function executeEditBalance() {
    const newBalance = parseFloat(document.getElementById('newBalance').value);
    const reason = document.getElementById('balanceReason').value || 'Balance adjustment';
    
    if (isNaN(newBalance) || newBalance < 0) {
        showStatus('Please enter a valid balance', 'error');
        return;
    }
    
    const oldBalance = appState.balances.main;
    const difference = newBalance - oldBalance;
    
    appState.balances.main = newBalance;
    addTransaction('adjust', difference, reason);
    updateUI();
    sendAlerts('balance', newBalance, reason);
    closeModal('editBalanceModal');
    showStatus(`Balance updated from ₦${oldBalance.toLocaleString()} to ₦${newBalance.toLocaleString()}`, 'success');
    
    document.getElementById('newBalance').value = '';
    document.getElementById('balanceReason').value = '';
    saveToLocalStorage();
}

// ==================== PROFILE MANAGEMENT ====================

function openEditProfileModal() {
    document.getElementById('editName').value = appState.profile.name;
    document.getElementById('editDOB').value = appState.profile.dob;
    document.getElementById('editSex').value = appState.profile.sex;
    document.getElementById('editCountry').value = appState.profile.country;
    document.getElementById('editEmail').value = appState.profile.email;
    document.getElementById('editPhone').value = appState.profile.phone;
    document.getElementById('editBVN').value = appState.profile.bvn;
    document.getElementById('editNIN').value = appState.profile.nin;
    openModal('editProfileModal');
}

function saveProfile() {
    appState.profile.name = document.getElementById('editName').value;
    appState.profile.dob = document.getElementById('editDOB').value;
    appState.profile.sex = document.getElementById('editSex').value;
    appState.profile.country = document.getElementById('editCountry').value;
    appState.profile.email = document.getElementById('editEmail').value;
    appState.profile.phone = document.getElementById('editPhone').value;
    appState.profile.bvn = document.getElementById('editBVN').value;
    appState.profile.nin = document.getElementById('editNIN').value;
    
    updateUI();
    closeModal('editProfileModal');
    showStatus('Profile updated successfully', 'success');
    saveToLocalStorage();
}

function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            appState.profile.photo = e.target.result;
            document.getElementById('profilePhoto').src = e.target.result;
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
}

// ==================== WALLET FUNCTIONS ====================

function generateWalletAddress() {
    const debitAddress = 'NW' + generateRandomString(32);
    const creditAddress = 'NC' + generateRandomString(32);
    
    appState.walletAddresses.debit = debitAddress;
    appState.walletAddresses.credit = creditAddress;
    
    updateUI();
    showStatus('New wallet addresses generated successfully', 'success');
    saveToLocalStorage();
}

function openFundWalletModal() {
    openModal('fundWalletModal');
}

function executeFundWallet() {
    const walletType = document.getElementById('fundWalletType').value;
    const amount = parseFloat(document.getElementById('fundWalletAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (walletType === 'debit') {
        appState.balances.debitWallet += amount;
    } else {
        appState.balances.creditWallet += amount;
    }
    
    addTransaction('wallet', amount, `Funded ${walletType} wallet`);
    updateUI();
    sendAlerts('wallet', amount, `Wallet funding - ${walletType}`);
    closeModal('fundWalletModal');
    showStatus(`Successfully funded ${walletType} wallet with ₦${amount.toLocaleString()}`, 'success');
    
    document.getElementById('fundWalletAmount').value = '';
    saveToLocalStorage();
}

function openWithdrawWalletModal() {
    openModal('withdrawWalletModal');
}

function executeWithdrawWallet() {
    const walletType = document.getElementById('withdrawWalletType').value;
    const amount = parseFloat(document.getElementById('withdrawWalletAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (walletType === 'debit' && amount > appState.balances.debitWallet) {
        showStatus('Insufficient debit wallet balance', 'error');
        return;
    }
    
    if (walletType === 'credit' && amount > appState.balances.creditWallet) {
        showStatus('Insufficient credit wallet balance', 'error');
        return;
    }
    
    if (walletType === 'debit') {
        appState.balances.debitWallet -= amount;
    } else {
        appState.balances.creditWallet -= amount;
    }
    
    addTransaction('wallet', -amount, `Withdrawn from ${walletType} wallet`);
    updateUI();
    sendAlerts('wallet', -amount, `Wallet withdrawal - ${walletType}`);
    closeModal('withdrawWalletModal');
    showStatus(`Successfully withdrew ₦${amount.toLocaleString()} from ${walletType} wallet`, 'success');
    
    document.getElementById('withdrawWalletAmount').value = '';
    saveToLocalStorage();
}

function openWalletTransferModal() {
    const amount = prompt('Enter amount to transfer from Debit to Credit Wallet:');
    const transferAmount = parseFloat(amount);
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (transferAmount > appState.balances.debitWallet) {
        showStatus('Insufficient debit wallet balance', 'error');
        return;
    }
    
    appState.balances.debitWallet -= transferAmount;
    appState.balances.creditWallet += transferAmount;
    
    addTransaction('wallet', transferAmount, 'Wallet transfer: Debit to Credit');
    updateUI();
    sendAlerts('wallet', transferAmount, 'Internal wallet transfer');
    showStatus(`Successfully transferred ₦${transferAmount.toLocaleString()} from Debit to Credit wallet`, 'success');
    saveToLocalStorage();
}

// ==================== BLOCKCHAIN FUNCTIONS ====================

function generateCryptoAddress() {
    const btcAddress = 'bc1' + generateRandomString(39);
    const trxAddress = 'T' + generateRandomString(33);
    const tonAddress = 'UQC' + generateRandomString(48);
    
    appState.walletAddresses.btc = btcAddress;
    appState.walletAddresses.trx = trxAddress;
    appState.walletAddresses.ton = tonAddress;
    
    updateUI();
    showStatus('New cryptocurrency addresses generated successfully', 'success');
    saveToLocalStorage();
}

function openCryptoTransferModal(cryptoType) {
    document.getElementById('cryptoType').value = cryptoType;
    document.getElementById('cryptoRecipientAddress').value = '';
    document.getElementById('cryptoAmount').value = '';
    openModal('cryptoTransferModal');
}

function executeCryptoTransfer() {
    const cryptoType = document.getElementById('cryptoType').value;
    const recipientAddress = document.getElementById('cryptoRecipientAddress').value;
    const amount = parseFloat(document.getElementById('cryptoAmount').value);
    
    if (!recipientAddress || recipientAddress.length < 10) {
        showStatus('Please enter a valid wallet address', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    let balance = 0;
    if (cryptoType === 'BTC') balance = appState.balances.btc;
    else if (cryptoType === 'TRX') balance = appState.balances.trx;
    else if (cryptoType === 'TON') balance = appState.balances.ton;
    
    if (amount > balance) {
        showStatus(`Insufficient ${cryptoType} balance`, 'error');
        return;
    }
    
    if (cryptoType === 'BTC') appState.balances.btc -= amount;
    else if (cryptoType === 'TRX') appState.balances.trx -= amount;
    else if (cryptoType === 'TON') appState.balances.ton -= amount;
    
    addTransaction('crypto', amount, `Sent ${cryptoType} to ${recipientAddress.substring(0, 8)}...`);
    updateUI();
    sendAlerts('crypto', amount, `Crypto transfer - ${cryptoType}`);
    closeModal('cryptoTransferModal');
    showStatus(`Successfully sent ${amount} ${cryptoType} to wallet`, 'success');
    saveToLocalStorage();
}

// ==================== INTERNATIONAL BANKING ====================

function generateInternationalWalletAddresses() {
    appState.walletAddresses.usd = 'USD' + generateRandomString(32);
    appState.walletAddresses.eur = 'EUR' + generateRandomString(32);
    appState.walletAddresses.gbp = 'GBP' + generateRandomString(32);
    appState.walletAddresses.ngn = 'NGN' + generateRandomString(32);
}

function openCurrencyConverterModal() {
    openModal('currencyConverterModal');
    document.getElementById('conversionResult').textContent = '';
}

function executeCurrencyConversion() {
    const from = document.getElementById('convertFrom').value;
    const to = document.getElementById('convertTo').value;
    const amount = parseFloat(document.getElementById('convertAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    let convertedAmount;
    if (from === to) {
        convertedAmount = amount;
    } else if (exchangeRates[from] && exchangeRates[from][to]) {
        convertedAmount = amount * exchangeRates[from][to];
    } else {
        showStatus('Currency conversion not available', 'error');
        return;
    }
    
    const symbols = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' };
    document.getElementById('conversionResult').textContent = 
        `${symbols[from]}${amount.toLocaleString()} = ${symbols[to]}${convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function openInternationalDepositModal(currency) {
    document.getElementById('depositCurrency').value = currency;
    document.getElementById('depositAmount').value = '';
    openModal('internationalDepositModal');
}

function executeInternationalDeposit() {
    const currency = document.getElementById('depositCurrency').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (currency === 'USD') appState.balances.usd += amount;
    else if (currency === 'EUR') appState.balances.eur += amount;
    else if (currency === 'GBP') appState.balances.gbp += amount;
    else if (currency === 'NGN') appState.balances.ngn += amount;
    
    addTransaction('international', amount, `Deposited ${currency}`);
    updateUI();
    sendAlerts('international', amount, `International deposit - ${currency}`);
    closeModal('internationalDepositModal');
    showStatus(`Successfully deposited ${currency}${amount.toLocaleString()}`, 'success');
    saveToLocalStorage();
}

// ==================== INTERNATIONAL PAYMENT METHODS ====================

function selectPaymentMethod(method) {
    appState.selectedPaymentMethod = method;
    document.getElementById('selectedPaymentMethod').textContent = method;
    document.getElementById('paymentMethodForm').style.display = 'block';
    
    document.querySelectorAll('.payment-method').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function executeInternationalPayment() {
    const method = appState.selectedPaymentMethod;
    const recipient = document.getElementById('paymentRecipient').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const currency = document.getElementById('paymentCurrency').value;
    
    if (!recipient) {
        showStatus('Please enter recipient details', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (currency === 'USD' && amount > appState.balances.usd) {
        showStatus('Insufficient USD balance', 'error');
        return;
    }
    
    // Process payment
    if (currency === 'USD') appState.balances.usd -= amount;
    
    addTransaction('international', -amount, `Sent via ${method} to ${recipient}`);
    updateUI();
    sendAlerts('international', amount, `Payment via ${method}`);
    showStatus(`Successfully sent ${currency}${amount.toLocaleString()} via ${method}`, 'success');
    
    document.getElementById('paymentRecipient').value = '';
    document.getElementById('paymentAmount').value = '';
    saveToLocalStorage();
}

function openInternationalDepositModal(currency) {
    document.getElementById('depositCurrency').value = currency;
    document.getElementById('depositAmount').value = '';
    openModal('internationalDepositModal');
}

function executeInternationalDeposit() {
    const currency = document.getElementById('depositCurrency').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (currency === 'USD') appState.balances.usd += amount;
    else if (currency === 'EUR') appState.balances.eur += amount;
    else if (currency === 'GBP') appState.balances.gbp += amount;
    else if (currency === 'NGN') appState.balances.ngn += amount;
    
    addTransaction('international', amount, `Deposited ${currency}`);
    updateUI();
    sendAlerts('international', amount, `International deposit - ${currency}`);
    closeModal('internationalDepositModal');
    showStatus(`Successfully deposited ${currency}${amount.toLocaleString()}`, 'success');
    saveToLocalStorage();
}

// Payment Methods
function selectPaymentMethod(element, method) {
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    element.classList.add('selected');
    appState.selectedPaymentMethod = method;
    document.getElementById('selectedPaymentMethod').textContent = method.charAt(0).toUpperCase() + method.slice(1);
    document.getElementById('paymentMethodForm').style.display = 'block';
}

function executeInternationalPayment() {
    const recipient = document.getElementById('paymentRecipient').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    
    if (!recipient || recipient.length < 3) {
        showStatus('Please enter a valid recipient', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.usd) {
        showStatus('Insufficient USD balance', 'error');
        return;
    }
    
    appState.balances.usd -= amount;
    addTransaction('international', -amount, `Sent via ${appState.selectedPaymentMethod} to ${recipient}`);
    updateUI();
    sendAlerts('international', amount, `International payment via ${appState.selectedPaymentMethod}`);
    showStatus(`Successfully sent $${amount.toLocaleString()} via ${appState.selectedPaymentMethod}`, 'success');
    
    document.getElementById('paymentRecipient').value = '';
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentMethodForm').style.display = 'none';
    saveToLocalStorage();
}

// ==================== BANK TRANSFERS ====================

function selectBank(element, bankName) {
    document.querySelectorAll('.bank-item').forEach(item => {
        item.classList.remove('selected');
    });
    element.classList.add('selected');
    appState.selectedBank = bankName;
    document.getElementById('selectedBankName').textContent = bankName;
    document.getElementById('bankTransferForm').style.display = 'block';
}

// Account name lookup simulation
document.getElementById('transferAccountNumber')?.addEventListener('input', function(e) {
    const accountNumber = e.target.value;
    if (accountNumber.length === 10) {
        document.getElementById('transferAccountName').value = 'Account Name Verified';
    } else {
        document.getElementById('transferAccountName').value = '';
    }
});

function executeBankTransfer() {
    const accountNumber = document.getElementById('transferAccountNumber').value;
    const accountName = document.getElementById('transferAccountName').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const description = document.getElementById('transferDescription').value || 'Bank transfer';
    
    if (accountNumber.length !== 10) {
        showStatus('Please enter a valid 10-digit account number', 'error');
        return;
    }
    
    if (!accountName) {
        showStatus('Account name not verified', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.main) {
        showStatus('Insufficient balance', 'error');
        return;
    }
    
    appState.balances.main -= amount;
    addTransaction('transfer', -amount, `Transfer to ${accountNumber} at ${appState.selectedBank} - ${description}`);
    updateUI();
    sendAlerts('transfer', amount, `Bank transfer to ${appState.selectedBank}`);
    showStatus(`Successfully transferred ₦${amount.toLocaleString()} to account ${accountNumber}`, 'success');
    
    document.getElementById('transferAccountNumber').value = '';
    document.getElementById('transferAccountName').value = '';
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferDescription').value = '';
    document.getElementById('bankTransferForm').style.display = 'none';
    saveToLocalStorage();
}

// ==================== BVN TRANSFER SYSTEM ====================

// BVN lookup simulation
document.getElementById('bvnTransferNumber')?.addEventListener('input', function(e) {
    const bvn = e.target.value;
    if (bvn.length === 11) {
        document.getElementById('bvnAccountName').value = 'BVN Account Holder Verified';
    } else {
        document.getElementById('bvnAccountName').value = '';
    }
});

function executeBVNTransfer() {
    const bvn = document.getElementById('bvnTransferNumber').value;
    const accountName = document.getElementById('bvnAccountName').value;
    const amount = parseFloat(document.getElementById('bvnTransferAmount').value);
    const description = document.getElementById('bvnTransferDescription').value || 'BVN transfer';
    
    if (bvn.length !== 11) {
        showStatus('Please enter a valid 11-digit BVN', 'error');
        return;
    }
    
    if (!accountName) {
        showStatus('BVN account not verified', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.main) {
        showStatus('Insufficient balance', 'error');
        return;
    }
    
    appState.balances.main -= amount;
    addTransaction('bvn-transfer', -amount, `BVN transfer to ${bvn} - ${description}`);
    updateUI();
    sendAlerts('transfer', amount, `BVN transfer to ${bvn}`);
    showStatus(`Successfully transferred ₦${amount.toLocaleString()} via BVN network`, 'success');
    
    document.getElementById('bvnTransferNumber').value = '';
    document.getElementById('bvnAccountName').value = '';
    document.getElementById('bvnTransferAmount').value = '';
    document.getElementById('bvnTransferDescription').value = '';
    saveToLocalStorage();
}

// ==================== PHONE TRANSFER SYSTEM ====================

// Phone lookup simulation
document.getElementById('phoneTransferNumber')?.addEventListener('input', function(e) {
    const phone = e.target.value;
    if (phone.length >= 10) {
        document.getElementById('phoneAccountName').value = 'Phone Account Holder Verified';
    } else {
        document.getElementById('phoneAccountName').value = '';
    }
});

function executePhoneTransfer() {
    const phone = document.getElementById('phoneTransferNumber').value;
    const accountName = document.getElementById('phoneAccountName').value;
    const amount = parseFloat(document.getElementById('phoneTransferAmount').value);
    const description = document.getElementById('phoneTransferDescription').value || 'Phone transfer';
    
    if (phone.length < 10) {
        showStatus('Please enter a valid phone number', 'error');
        return;
    }
    
    if (!accountName) {
        showStatus('Phone account not verified', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.main) {
        showStatus('Insufficient balance', 'error');
        return;
    }
    
    appState.balances.main -= amount;
    addTransaction('phone-transfer', -amount, `Phone transfer to ${phone} - ${description}`);
    updateUI();
    sendAlerts('transfer', amount, `Phone transfer to ${phone}`);
    showStatus(`Successfully transferred ₦${amount.toLocaleString()} to phone ${phone}`, 'success');
    
    document.getElementById('phoneTransferNumber').value = '';
    document.getElementById('phoneAccountName').value = '';
    document.getElementById('phoneTransferAmount').value = '';
    document.getElementById('phoneTransferDescription').value = '';
    saveToLocalStorage();
}

// BVN Transfer
document.getElementById('bvnTransferNumber')?.addEventListener('input', function(e) {
    const bvnNumber = e.target.value;
    if (bvnNumber.length === 11) {
        document.getElementById('bvnTransferName').value = 'BVN Verified: Account Holder';
    } else {
        document.getElementById('bvnTransferName').value = '';
    }
});

function executeBVNTransfer() {
    const bvnNumber = document.getElementById('bvnTransferNumber').value;
    const bvnName = document.getElementById('bvnTransferName').value;
    const amount = parseFloat(document.getElementById('bvnTransferAmount').value);
    
    if (bvnNumber.length !== 11) {
        showStatus('Please enter a valid 11-digit BVN', 'error');
        return;
    }
    
    if (!bvnName) {
        showStatus('BVN not verified', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.main) {
        showStatus('Insufficient balance', 'error');
        return;
    }
    
    appState.balances.main -= amount;
    addTransaction('bvn-transfer', -amount, `BVN transfer to ${bvnNumber}`);
    updateUI();
    sendAlerts('transfer', amount, `BVN transfer to ${bvnNumber}`);
    showStatus(`Successfully transferred ₦${amount.toLocaleString()} via BVN`, 'success');
    
    document.getElementById('bvnTransferNumber').value = '';
    document.getElementById('bvnTransferName').value = '';
    document.getElementById('bvnTransferAmount').value = '';
    saveToLocalStorage();
}

// Phone Transfer
document.getElementById('phoneTransferNumber')?.addEventListener('input', function(e) {
    const phoneNumber = e.target.value;
    if (phoneNumber.length >= 10) {
        document.getElementById('phoneTransferName').value = 'Phone Verified: Account Holder';
    } else {
        document.getElementById('phoneTransferName').value = '';
    }
});

function executePhoneTransfer() {
    const phoneNumber = document.getElementById('phoneTransferNumber').value;
    const phoneName = document.getElementById('phoneTransferName').value;
    const amount = parseFloat(document.getElementById('phoneTransferAmount').value);
    
    if (phoneNumber.length < 10) {
        showStatus('Please enter a valid phone number', 'error');
        return;
    }
    
    if (!phoneName) {
        showStatus('Phone number not verified', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > appState.balances.main) {
        showStatus('Insufficient balance', 'error');
        return;
    }
    
    appState.balances.main -= amount;
    addTransaction('phone-transfer', -amount, `Phone transfer to ${phoneNumber}`);
    updateUI();
    sendAlerts('transfer', amount, `Phone transfer to ${phoneNumber}`);
    showStatus(`Successfully transferred ₦${amount.toLocaleString()} via phone number`, 'success');
    
    document.getElementById('phoneTransferNumber').value = '';
    document.getElementById('phoneTransferName').value = '';
    document.getElementById('phoneTransferAmount').value = '';
    saveToLocalStorage();
}

// ==================== ALERT SYSTEM ====================

function toggleAlert(element, alertType) {
    element.classList.toggle('active');
    appState.alerts[alertType] = element.classList.contains('active');
}

function sendAlerts(type, amount, description) {
    const timestamp = new Date().toLocaleString();
    
    if (appState.alerts.transactionSMS && type !== 'balance') {
        console.log(`[SMS Alert] To: ${appState.profile.phone}`);
        console.log(`Transaction: ${description}`);
        console.log(`Amount: ${typeof amount === 'number' ? amount.toLocaleString() : amount}`);
        console.log(`Time: ${timestamp}\n`);
    }
    
    if (appState.alerts.transactionEmail && type !== 'balance') {
        console.log(`[Email Alert] To: ${appState.profile.email}`);
        console.log(`Subject: Transaction Notification`);
        console.log(`Transaction: ${description}`);
        console.log(`Amount: ${typeof amount === 'number' ? amount.toLocaleString() : amount}`);
        console.log(`Time: ${timestamp}\n`);
    }
    
    showStatus('Alert notification sent', 'success');
}

function saveAlertSettings() {
    appState.profile.phone = document.getElementById('smsPhoneNumber').value;
    appState.profile.email = document.getElementById('alertEmail').value;
    saveToLocalStorage();
    showStatus('Alert settings saved successfully', 'success');
}

// ==================== TRANSACTION MANAGEMENT ====================

function addTransaction(type, amount, description) {
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        description: description,
        date: new Date().toLocaleString(),
        balance: appState.balances.main
    };
    
    appState.transactions.unshift(transaction);
    if (appState.transactions.length > 100) {
        appState.transactions.pop();
    }
}

// ==================== BACKUP & RESTORE SYSTEM ====================

function initializeBackupSystem() {
    // Auto-backup every 5 minutes
    setInterval(createBackup, 300000); // 300000ms = 5 minutes
    
    // Check for last backup on load
    updateBackupInfo();
}

function createBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        profile: appState.profile,
        balances: appState.balances,
        walletAddresses: appState.walletAddresses,
        transactions: appState.transactions,
        alerts: appState.alerts,
        version: '1.0'
    };
    
    // Save to localStorage
    localStorage.setItem('bankingAppBackup', JSON.stringify(backupData));
    
    // Update last backup time
    appState.lastBackup = new Date().toISOString();
    updateBackupInfo();
    
    console.log('Backup created at:', new Date().toLocaleString());
}

function downloadBackup() {
    const backupData = localStorage.getItem('bankingAppBackup');
    
    if (!backupData) {
        showStatus('No backup available', 'error');
        return;
    }
    
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combosbank_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Backup downloaded successfully', 'success');
}

function restoreFromFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        showStatus('Please select a backup file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Validate backup data
            if (!backupData.profile || !backupData.balances) {
                showStatus('Invalid backup file', 'error');
                return;
            }
            
            // Restore data
            appState.profile = backupData.profile;
            appState.balances = backupData.balances;
            appState.walletAddresses = backupData.walletAddresses || appState.walletAddresses;
            appState.transactions = backupData.transactions || [];
            appState.alerts = backupData.alerts || appState.alerts;
            
            // Save to main storage
            saveToLocalStorage();
            updateUI();
            
            showStatus(`Backup restored successfully from ${new Date(backupData.timestamp).toLocaleString()}`, 'success');
        } catch (error) {
            console.error('Restore error:', error);
            showStatus('Failed to restore backup. Invalid file format.', 'error');
        }
    };
    
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

function resetToDefault() {
    if (confirm('Are you sure you want to reset to default settings?')) {
        localStorage.removeItem('bankingAppState');
        localStorage.removeItem('bankingAppBackup');
        location.reload();
    }
}

function updateBackupInfo() {
    const lastBackupElement = document.getElementById('lastBackupTime');
    const transactionCountElement = document.getElementById('backupTransactionCount');
    const totalBalanceElement = document.getElementById('backupTotalBalance');
    
    if (lastBackupElement) {
        const lastBackup = localStorage.getItem('bankingAppBackup');
        if (lastBackup) {
            const backupData = JSON.parse(lastBackup);
            lastBackupElement.textContent = new Date(backupData.timestamp).toLocaleString();
            
            if (transactionCountElement) {
                transactionCountElement.textContent = backupData.transactions.length;
            }
            
            if (totalBalanceElement) {
                totalBalanceElement.textContent = formatCurrency(backupData.balances.main);
            }
        } else {
            lastBackupElement.textContent = 'No backup yet';
        }
    }
}

// ==================== UI UPDATE FUNCTIONS ====================

function updateUI() {
    // Update Profile
    document.getElementById('profileName').textContent = appState.profile.name;
    document.getElementById('profileDOB').textContent = formatDate(appState.profile.dob);
    document.getElementById('profileSex').textContent = appState.profile.sex;
    document.getElementById('profileCountry').textContent = appState.profile.country;
    document.getElementById('profileAccount').textContent = appState.profile.accountNumber;
    document.getElementById('profileBVN').textContent = appState.profile.bvn ? '***' + appState.profile.bvn.slice(-3) : 'N/A';
    document.getElementById('profileNIN').textContent = appState.profile.nin ? '****' + appState.profile.nin.slice(-3) : 'N/A';
    document.getElementById('profileEmail').textContent = appState.profile.email;
    document.getElementById('profilePhone').textContent = appState.profile.phone;
    
    if (appState.profile.photo && appState.profile.photo !== 'https://via.placeholder.com/200') {
        document.getElementById('profilePhoto').src = appState.profile.photo;
    }
    
    // Update BVN/NIN status
    document.getElementById('bvnNumber').textContent = appState.profile.bvn ? `BVN: ${appState.profile.bvn.substring(0, 3)}*********${appState.profile.bvn.slice(-3)}` : 'BVN: Not Set';
    document.getElementById('ninNumber').textContent = appState.profile.nin ? `NIN: ${appState.profile.nin.substring(0, 4)}********${appState.profile.nin.slice(-3)}` : 'NIN: Not Set';
    
    // Update Balances
    document.getElementById('mainBalance').textContent = formatCurrency(appState.balances.main);
    document.getElementById('walletBalance').textContent = formatCurrency(appState.balances.wallet);
    document.getElementById('debitWalletBalance').textContent = formatCurrency(appState.balances.debitWallet);
    document.getElementById('creditWalletBalance').textContent = formatCurrency(appState.balances.creditWallet);
    
    // Update International Balances
    document.getElementById('usdBalance').textContent = `$${appState.balances.usd.toLocaleString()}`;
    document.getElementById('eurBalance').textContent = `€${appState.balances.eur.toLocaleString()}`;
    document.getElementById('gbpBalance').textContent = `£${appState.balances.gbp.toLocaleString()}`;
    document.getElementById('ngnBalance').textContent = `₦${appState.balances.ngn.toLocaleString()}`;
    
    // Update Crypto Balances
    document.getElementById('btcBalance').textContent = `${appState.balances.btc.toFixed(8)} BTC`;
    document.getElementById('trxBalance').textContent = `${appState.balances.trx.toFixed(8)} TRX`;
    document.getElementById('tonBalance').textContent = `${appState.balances.ton.toFixed(8)} TON`;
    
    // Calculate crypto total in USD
    const cryptoTotal = (appState.balances.btc * 65000) + (appState.balances.trx * 0.12) + (appState.balances.ton * 5.5);
    document.getElementById('cryptoBalance').textContent = `$${cryptoTotal.toFixed(2)}`;
    
    // Update Wallet Addresses
    document.getElementById('debitWalletAddress').textContent = appState.walletAddresses.debit;
    document.getElementById('creditWalletAddress').textContent = appState.walletAddresses.credit;
    document.getElementById('btcWalletAddress').textContent = appState.walletAddresses.btc;
    document.getElementById('trxWalletAddress').textContent = appState.walletAddresses.trx;
    document.getElementById('tonWalletAddress').textContent = appState.walletAddresses.ton;
    
    // Update International Wallet Addresses
    document.getElementById('usdWalletAddress').textContent = appState.walletAddresses.usd;
    document.getElementById('eurWalletAddress').textContent = appState.walletAddresses.eur;
    document.getElementById('gbpWalletAddress').textContent = appState.walletAddresses.gbp;
    document.getElementById('ngnWalletAddress').textContent = appState.walletAddresses.ngn;
    
    // Update Transaction Count
    document.getElementById('totalTransactions').textContent = appState.transactions.length;
    
    // Update Transaction Lists
    updateTransactionLists();
}

function updateTransactionLists() {
    const recentList = document.getElementById('recentTransactions');
    const fullList = document.getElementById('fullTransactionList');
    
    const updateList = (listElement, transactions) => {
        if (transactions.length === 0) {
            listElement.innerHTML = '<li class="transaction-item" style="text-align: center; color: var(--text-secondary);">No transactions yet</li>';
            return;
        }
        
        listElement.innerHTML = transactions.map(tx => `
            <li class="transaction-item">
                <div>
                    <div class="transaction-type">${tx.description}</div>
                    <div class="transaction-date">${tx.date}</div>
                </div>
                <div class="transaction-amount ${tx.amount >= 0 ? 'credit' : 'debit'}">
                    ${tx.amount >= 0 ? '+' : ''}${formatCurrency(Math.abs(tx.amount))}
                </div>
            </li>
        `).join('');
    };
    
    updateList(recentList, appState.transactions.slice(0, 5));
    updateList(fullList, appState.transactions);
}

// ==================== LOCAL STORAGE ====================

function saveToLocalStorage() {
    try {
        const dataToSave = {
            profile: appState.profile,
            balances: appState.balances,
            walletAddresses: appState.walletAddresses,
            transactions: appState.transactions,
            alerts: appState.alerts,
            lastBackup: appState.lastBackup
        };
        localStorage.setItem('bankingAppState', JSON.stringify(dataToSave));
    } catch (e) {
        console.error('Error saving to local storage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('bankingAppState');
        if (savedData) {
            const data = JSON.parse(savedData);
            appState.profile = { ...appState.profile, ...data.profile };
            appState.balances = { ...appState.balances, ...data.balances };
            appState.walletAddresses = { ...appState.walletAddresses, ...data.walletAddresses };
            appState.transactions = data.transactions || [];
            appState.alerts = { ...appState.alerts, ...data.alerts };
            appState.lastBackup = data.lastBackup || null;
        }
    } catch (e) {
        console.error('Error loading from local storage:', e);
    }
}

// ==================== BACKUP & RESTORE SYSTEM ====================

function initializeBackupSystem() {
    // Auto backup every 5 minutes
    setInterval(createBackup, 300000);
    updateBackupInfo();
}

function createBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        profile: appState.profile,
        balances: appState.balances,
        walletAddresses: appState.walletAddresses,
        transactions: appState.transactions,
        alerts: appState.alerts
    };
    
    appState.lastBackup = backupData.timestamp;
    localStorage.setItem('bankingAppBackup', JSON.stringify(backupData));
    saveToLocalStorage();
    updateBackupInfo();
    
    console.log('Backup created successfully');
}

function downloadBackup() {
    const backupData = {
        timestamp: new Date().toISOString(),
        profile: appState.profile,
        balances: appState.balances,
        walletAddresses: appState.walletAddresses,
        transactions: appState.transactions,
        alerts: appState.alerts
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combosbank-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Backup file downloaded successfully', 'success');
}

function restoreFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (confirm('This will replace all your current data. Are you sure you want to restore?')) {
                appState.profile = backupData.profile;
                appState.balances = backupData.balances;
                appState.walletAddresses = backupData.walletAddresses;
                appState.transactions = backupData.transactions;
                appState.alerts = backupData.alerts;
                appState.lastBackup = backupData.timestamp;
                
                saveToLocalStorage();
                updateUI();
                updateBackupInfo();
                
                showStatus('Data restored successfully', 'success');
            }
        } catch (error) {
            showStatus('Invalid backup file', 'error');
            console.error('Restore error:', error);
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.removeItem('bankingAppState');
        localStorage.removeItem('bankingAppBackup');
        
        // Reset to initial state
        appState.profile = {
            name: 'Olawale Abdul-Ganiyu',
            dob: '13/12/1985',
            sex: 'Male',
            country: 'Nigeria',
            accountNumber: generateAccountNumber(),
            bvn: '12345678901',
            nin: '12345678901',
            email: 'olawale@combosbank.com',
            phone: '+234 801 234 5678',
            photo: 'https://via.placeholder.com/200'
        };
        appState.balances = {
            main: 0,
            wallet: 0,
            debitWallet: 0,
            creditWallet: 0,
            usd: 0,
            eur: 0,
            gbp: 0,
            ngn: 0,
            btc: 0,
            trx: 0,
            ton: 0
        };
        appState.transactions = [];
        appState.walletAddresses = {
            debit: 'N/A',
            credit: 'N/A',
            btc: 'N/A',
            trx: 'N/A',
            ton: 'N/A',
            usd: 'N/A',
            eur: 'N/A',
            gbp: 'N/A',
            ngn: 'N/A'
        };
        appState.lastBackup = null;
        
        saveToLocalStorage();
        updateUI();
        updateBackupInfo();
        
        showStatus('All data cleared successfully', 'success');
    }
}

function resetToDefault() {
    if (confirm('Are you sure you want to reset to default settings?')) {
        loadFromLocalStorage();
        appState.alerts = {
            transactionSMS: true,
            balanceSMS: true,
            loginSMS: true,
            transactionEmail: true,
            balanceEmail: false,
            securityEmail: true
        };
        saveToLocalStorage();
        showStatus('Reset to default settings', 'success');
    }
}

function updateBackupInfo() {
    const lastBackupTime = document.getElementById('lastBackupTime');
    const backupTransactionCount = document.getElementById('backupTransactionCount');
    const backupBalance = document.getElementById('backupBalance');
    
    if (appState.lastBackup) {
        const backupDate = new Date(appState.lastBackup);
        lastBackupTime.textContent = backupDate.toLocaleString();
    } else {
        lastBackupTime.textContent = 'Never';
    }
    
    backupTransactionCount.textContent = appState.transactions.length;
    backupBalance.textContent = formatCurrency(appState.balances.main);
}

// ==================== FREE SIGNALS SYSTEM ====================

const bankingSignals = [
    {
        icon: '🏦',
        title: 'NGN/USD Exchange Rate',
        description: 'Expecting appreciation in next 48 hours',
        type: 'BUY',
        strength: 85
    },
    {
        icon: '₿',
        title: 'Bitcoin (BTC)',
        description: 'Strong momentum, potential breakout',
        type: 'BUY',
        strength: 92
    },
    {
        icon: '€',
        title: 'EUR/NGN Pair',
        description: 'Consolidation phase, wait for confirmation',
        type: 'HOLD',
        strength: 65
    },
    {
        icon: '📊',
        title: 'Stock Market',
        description: 'Bearish trend expected short-term',
        type: 'SELL',
        strength: 78
    },
    {
        icon: '💎',
        title: 'Gold (XAU)',
        description: 'Safe haven asset, accumulation phase',
        type: 'BUY',
        strength: 88
    },
    {
        icon: '£',
        title: 'GBP/USD',
        description: 'Volatility expected, trade with caution',
        type: 'HOLD',
        strength: 55
    },
    {
        icon: '🌾',
        title: 'Commodities',
        description: 'Agricultural commodities showing strength',
        type: 'BUY',
        strength: 72
    },
    {
        icon: '💹',
        title: 'Nigerian Stocks',
        description: 'Banking sector poised for growth',
        type: 'BUY',
        strength: 80
    }
];

function refreshSignals() {
    const signalList = document.getElementById('signalList');
    signalList.innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 Updating signals...</div>';
    
    setTimeout(() => {
        const randomSignals = bankingSignals
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        
        signalList.innerHTML = randomSignals.map(signal => `
            <li class="signal-item">
                <div class="signal-icon">${signal.icon}</div>
                <div class="signal-content">
                    <div class="signal-title">${signal.title}</div>
                    <div class="signal-description">${signal.description}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        Signal Strength: ${signal.strength}%
                    </div>
                </div>
                <span class="signal-badge ${signal.type.toLowerCase()}">${signal.type}</span>
            </li>
        `).join('');
        
        showStatus('Banking signals updated successfully', 'success');
    }, 1000);
}

// ==================== GOOGLE SEARCH & ADDRESS LOOKUP ====================

function executeGoogleSearch() {
    const query = document.getElementById('googleSearchInput').value.trim();
    
    if (!query) {
        showStatus('Please enter a search query', 'error');
        return;
    }
    
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<div style="text-align: center; padding: 2rem;">🔍 Searching...</div>';
    
    setTimeout(() => {
        const results = [
            {
                title: `${query} - Banking Information`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                snippet: `Comprehensive information about ${query} including banking services, rates, and financial guidance.`
            },
            {
                title: `${query} - Financial Services Overview`,
                url: `https://www.investopedia.com/search?q=${encodeURIComponent(query)}`,
                snippet: `Detailed financial analysis and services related to ${query} with expert insights.`
            },
            {
                title: `${query} - Market Analysis`,
                url: `https://www.bloomberg.com/search?query=${encodeURIComponent(query)}`,
                snippet: `Latest market trends and analysis for ${query} from leading financial experts.`
            },
            {
                title: `${query} - Banking Regulations`,
                url: `https://www.cbn.gov.ng/search?q=${encodeURIComponent(query)}`,
                snippet: `Official regulatory information and guidelines for ${query} from Central Bank.`
            }
        ];
        
        searchResults.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Search Results for "${query}"</h3>
            ${results.map(result => `
                <div class="search-result-item">
                    <a href="${result.url}" target="_blank" class="result-title">${result.title}</a>
                    <div class="result-url">${result.url}</div>
                    <div class="result-snippet">${result.snippet}</div>
                </div>
            `).join('')}
            <div style="text-align: center; margin-top: 1.5rem; padding: 1rem; background: var(--background-color); border-radius: 0.5rem;">
                <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" 
                   style="color: var(--primary-color); text-decoration: none; font-weight: 600;">
                    🔍 View more results on Google →
                </a>
            </div>
        `;
        
        showStatus('Search completed successfully', 'success');
    }, 1500);
}

function lookupAddress() {
    const address = document.getElementById('httpAddressInput').value.trim();
    const lookupResult = document.getElementById('lookupResult');
    
    if (!address) {
        showStatus('Please enter a valid URL', 'error');
        return;
    }
    
    let formattedAddress = address;
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        formattedAddress = 'https://' + address;
    }
    
    lookupResult.innerHTML = '<div style="text-align: center;">🔍 Looking up address...</div>';
    lookupResult.classList.add('active');
    
    setTimeout(() => {
        const url = new URL(formattedAddress);
        const domain = url.hostname;
        
        lookupResult.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: var(--primary-color);">✅ Address Lookup Result</h4>
            <div style="display: grid; gap: 0.75rem;">
                <div>
                    <strong>Full URL:</strong><br>
                    <code style="background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${formattedAddress}</code>
                </div>
                <div>
                    <strong>Domain:</strong><br>
                    <code style="background: rgba(0,0,0,0.05); padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${domain}</code>
                </div>
                <div>
                    <strong>Protocol:</strong><br>
                    <span style="background: var(--success-color); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">
                        ${url.protocol.toUpperCase()}
                    </span>
                </div>
                <div>
                    <strong>Status:</strong><br>
                    <span style="color: var(--success-color); font-weight: 600;">✅ Valid HTTPS Address</span>
                </div>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                <a href="${formattedAddress}" target="_blank" 
                   style="display: inline-block; padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                          text-decoration: none; border-radius: 0.5rem; font-weight: 600;">
                    🌐 Visit Website →
                </a>
            </div>
        `;
        
        showStatus('Address lookup completed', 'success');
    }, 1000);
}

// ==================== FREE LICENSE SYSTEM ====================

const licenseInfo = {
    licenseNumber: 'LIC-2024-FREE-CombosBANK-UNLIMITED',
    licenseType: 'UNLIMITED FREE TRANSACTION LICENSE',
    licenseStatus: 'ACTIVE',
    validSince: new Date().toISOString(),
    expires: 'NEVER (LIFETIME)',
    permissions: {
        localTransfers: 'UNLIMITED',
        internationalTransfers: 'UNLIMITED',
        cryptoTransactions: 'UNLIMITED',
        walletOperations: 'UNLIMITED',
        bankingSignals: 'FREE',
        searchServices: 'FREE',
        currencyExchange: 'FREE',
        alertServices: 'FREE',
        bvnNinTransfers: 'UNLIMITED'
    }
};

function initializeLicense() {
    const validSinceElement = document.getElementById('licenseValidSince');
    if (validSinceElement) {
        const validSince = localStorage.getItem('licenseValidSince') || new Date().toISOString();
        localStorage.setItem('licenseValidSince', validSince);
        validSinceElement.textContent = new Date(validSince).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }
    
    if (!localStorage.getItem('licenseInfo')) {
        localStorage.setItem('licenseInfo', JSON.stringify(licenseInfo));
    }
}

function verifyLicense() {
    const storedLicense = JSON.parse(localStorage.getItem('licenseInfo'));
    
    return {
        isValid: true,
        isFree: true,
        licenseNumber: storedLicense.licenseNumber,
        permissions: storedLicense.permissions,
        message: 'Free license verified - Unlimited transactions enabled'
    };
}

// ==================== MINING SYSTEM ====================

const miningState = {
    fiat: {
        usd: { active: true, balance: 0, totalMined: 0, sessions: 0, lastPayout: Date.now(), interval: null },
        eur: { active: true, balance: 0, totalMined: 0, sessions: 0, lastPayout: Date.now(), interval: null },
        gbp: { active: true, balance: 0, totalMined: 0, sessions: 0, lastPayout: Date.now(), interval: null },
        ngn: { active: true, balance: 0, totalMined: 0, sessions: 0, lastPayout: Date.now(), interval: null }
    },
    crypto: {
        btc: { active: true, balance: 0, totalMined: 0, sessions: 0, addressesGenerated: 0, lastPayout: Date.now(), interval: null },
        trx: { active: true, balance: 0, totalMined: 0, sessions: 0, addressesGenerated: 0, lastPayout: Date.now(), interval: null },
        ton: { active: true, balance: 0, totalMined: 0, sessions: 0, addressesGenerated: 0, lastPayout: Date.now(), interval: null }
    },
    addressGenerator: {
        active: true,
        addresses: [],
        count: 0,
        interval: null
    },
    miningRates: {
        fiat: 100,
        crypto: 1
    },
    logs: []
};

function initializeMining() {
    loadMiningState();
    startAllMining();
    startAddressGenerator();
    updateMiningUI();
    setInterval(updateMiningProgress, 1000);
}

function loadMiningState() {
    try {
        const savedState = localStorage.getItem('miningState');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            miningState.fiat = { ...miningState.fiat, ...parsed.fiat };
            miningState.crypto = { ...miningState.crypto, ...parsed.crypto };
            miningState.addressGenerator = { ...miningState.addressGenerator, ...parsed.addressGenerator };
        }
    } catch (e) {
        console.error('Error loading mining state:', e);
    }
}

function saveMiningState() {
    try {
        const dataToSave = {
            fiat: miningState.fiat,
            crypto: miningState.crypto,
            addressGenerator: miningState.addressGenerator
        };
        localStorage.setItem('miningState', JSON.stringify(dataToSave));
    } catch (e) {
        console.error('Error saving mining state:', e);
    }
}

function startAllMining() {
    ['usd', 'eur', 'gbp', 'ngn'].forEach(currency => {
        if (!miningState.fiat[currency].active) {
            startFiatMining(currency);
        }
    });
    
    ['btc', 'trx', 'ton'].forEach(crypto => {
        if (!miningState.crypto[crypto].active) {
            startCryptoMining(crypto);
        }
    });
    
    addMiningLog('All mining operations started', 'success');
    updateMiningUI();
}

function stopAllMining() {
    Object.keys(miningState.fiat).forEach(currency => {
        stopFiatMining(currency);
    });
    
    Object.keys(miningState.crypto).forEach(crypto => {
        stopCryptoMining(crypto);
    });
    
    if (miningState.addressGenerator.active) {
        toggleAddressGenerator();
    }
    
    addMiningLog('All mining operations stopped', 'warning');
    updateMiningUI();
}

function startFiatMining(currency) {
    if (miningState.fiat[currency].interval) {
        clearInterval(miningState.fiat[currency].interval);
    }
    
    miningState.fiat[currency].active = true;
    miningState.fiat[currency].lastPayout = Date.now();
    
    miningState.fiat[currency].interval = setInterval(() => {
        mineFiatCurrency(currency);
    }, 3600000);
    
    addMiningLog(`${currency.toUpperCase()} mining started - $100 per hour`, 'success');
    saveMiningState();
    updateMiningUI();
}

function stopFiatMining(currency) {
    if (miningState.fiat[currency].interval) {
        clearInterval(miningState.fiat[currency].interval);
        miningState.fiat[currency].interval = null;
    }
    miningState.fiat[currency].active = false;
    addMiningLog(`${currency.toUpperCase()} mining stopped`, 'warning');
    saveMiningState();
    updateMiningUI();
}

function mineFiatCurrency(currency) {
    const amount = miningState.miningRates.fiat;
    
    miningState.fiat[currency].balance += amount;
    miningState.fiat[currency].totalMined += amount;
    miningState.fiat[currency].sessions += 1;
    miningState.fiat[currency].lastPayout = Date.now();
    
    if (currency === 'usd') appState.balances.usd += amount;
    if (currency === 'eur') appState.balances.eur += amount;
    if (currency === 'gbp') appState.balances.gbp += amount;
    if (currency === 'ngn') appState.balances.ngn += amount;
    
    addMiningLog(`💰 Mined ${amount} ${currency.toUpperCase()} - Total: ${miningState.fiat[currency].totalMined}`, 'success');
    saveMiningState();
    updateMiningUI();
    updateUI();
}

function startCryptoMining(crypto) {
    if (miningState.crypto[crypto].interval) {
        clearInterval(miningState.crypto[crypto].interval);
    }
    
    miningState.crypto[crypto].active = true;
    miningState.crypto[crypto].lastPayout = Date.now();
    
    miningState.crypto[crypto].interval = setInterval(() => {
        mineCryptoCurrency(crypto);
    }, 3600000);
    
    addMiningLog(`${crypto.toUpperCase()} mining started - 1 ${crypto.toUpperCase()} per hour`, 'success');
    saveMiningState();
    updateMiningUI();
}

function stopCryptoMining(crypto) {
    if (miningState.crypto[crypto].interval) {
        clearInterval(miningState.crypto[crypto].interval);
        miningState.crypto[crypto].interval = null;
    }
    miningState.crypto[crypto].active = false;
    addMiningLog(`${crypto.toUpperCase()} mining stopped`, 'warning');
    saveMiningState();
    updateMiningUI();
}

function mineCryptoCurrency(crypto) {
    const amount = miningState.miningRates.crypto;
    
    miningState.crypto[crypto].balance += amount;
    miningState.crypto[crypto].totalMined += amount;
    miningState.crypto[crypto].sessions += 1;
    miningState.crypto[crypto].lastPayout = Date.now();
    
    if (crypto === 'btc') appState.balances.btc += amount;
    if (crypto === 'trx') appState.balances.trx += amount;
    if (crypto === 'ton') appState.balances.ton += amount;
    
    addMiningLog(`₿ Mined ${amount} ${crypto.toUpperCase()} - Total: ${miningState.crypto[crypto].totalMined}`, 'success');
    saveMiningState();
    updateMiningUI();
    updateUI();
}

function toggleMining(type) {
    const currency = type.toLowerCase();
    
    if (miningState.fiat[currency]) {
        if (miningState.fiat[currency].active) {
            stopFiatMining(currency);
        } else {
            startFiatMining(currency);
        }
    } else if (miningState.crypto[currency]) {
        if (miningState.crypto[currency].active) {
            stopCryptoMining(crypto);
        } else {
            startCryptoMining(crypto);
        }
    }
}

function generateBlockchainAddress() {
    const prefixes = {
        btc: ['bc1', '1', '3'],
        trx: ['T'],
        ton: ['UQC', 'EQ', '0:']
    };
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let address = '';
    
    const cryptoTypes = ['btc', 'trx', 'ton'];
    const cryptoType = cryptoTypes[Math.floor(Math.random() * cryptoTypes.length)];
    
    const prefix = prefixes[cryptoType][Math.floor(Math.random() * prefixes[cryptoType].length)];
    address += prefix;
    
    const length = cryptoType === 'btc' ? 39 : cryptoType === 'trx' ? 33 : 48;
    for (let i = 0; i < length; i++) {
        address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return {
        address: address,
        type: cryptoType,
        timestamp: Date.now()
    };
}

function startAddressGenerator() {
    if (miningState.addressGenerator.interval) {
        clearInterval(miningState.addressGenerator.interval);
    }
    
    miningState.addressGenerator.active = true;
    miningState.addressGenerator.interval = setInterval(() => {
        for (let i = 0; i < 10; i++) {
            const newAddress = generateBlockchainAddress();
            miningState.addressGenerator.addresses.unshift(newAddress);
            
            if (newAddress.type === 'btc') miningState.crypto.btc.addressesGenerated++;
            if (newAddress.type === 'trx') miningState.crypto.trx.addressesGenerated++;
            if (newAddress.type === 'ton') miningState.crypto.ton.addressesGenerated++;
            
            miningState.addressGenerator.count++;
        }
        
        if (miningState.addressGenerator.addresses.length > 100) {
            miningState.addressGenerator.addresses = miningState.addressGenerator.slice(0, 100);
        }
        
        addMiningLog(`🔗 Generated 10 blockchain addresses - Total: ${miningState.addressGenerator.count}`, 'info');
        saveMiningState();
        updateMiningUI();
    }, 1000);
}

function stopAddressGenerator() {
    if (miningState.addressGenerator.interval) {
        clearInterval(miningState.addressGenerator.interval);
        miningState.addressGenerator.interval = null;
    }
    miningState.addressGenerator.active = false;
    addMiningLog('Address generator stopped', 'warning');
    saveMiningState();
    updateMiningUI();
}

function toggleAddressGenerator() {
    const btn = document.getElementById('address-gen-btn');
    
    if (miningState.addressGenerator.active) {
        stopAddressGenerator();
        btn.textContent = '▶️ Start Generator';
    } else {
        startAddressGenerator();
        btn.textContent = '⏹️ Stop Generator';
    }
}

function updateMiningUI() {
    ['usd', 'eur', 'gbp', 'ngn'].forEach(currency => {
        const card = document.getElementById(`mining-${currency}`);
        if (card) {
            if (miningState.fiat[currency].active) {
                card.classList.add('active');
                card.classList.remove('inactive');
            } else {
                card.classList.remove('active');
                card.classList.add('inactive');
            }
        }
        
        const balanceElement = document.getElementById(`mining-${currency}-balance`);
        const totalElement = document.getElementById(`mining-${currency}-total`);
        const sessionsElement = document.getElementById(`mining-${currency}-sessions`);
        const statusElement = document.getElementById(`mining-${currency}-status`);
        const indicatorElement = document.getElementById(`mining-${currency}-indicator`);
        
        if (balanceElement) {
            const symbols = { usd: '$', eur: '€', gbp: '£', ngn: '₦' };
            balanceElement.textContent = `${symbols[currency]}${miningState.fiat[currency].balance.toLocaleString()}`;
        }
        if (totalElement) {
            const symbols = { usd: '$', eur: '€', gbp: '£', ngn: '₦' };
            totalElement.textContent = `${symbols[currency]}${miningState.fiat[currency].totalMined.toLocaleString()}`;
        }
        if (sessionsElement) {
            sessionsElement.textContent = miningState.fiat[currency].sessions;
        }
        if (statusElement) {
            statusElement.textContent = miningState.fiat[currency].active ? 'Mining Active' : 'Mining Stopped';
        }
        if (indicatorElement) {
            if (miningState.fiat[currency].active) {
                indicatorElement.classList.add('active');
                indicatorElement.classList.remove('inactive');
            } else {
                indicatorElement.classList.remove('active');
                indicatorElement.classList.add('inactive');
            }
        }
    });
    
    ['btc', 'trx', 'ton'].forEach(crypto => {
        const card = document.getElementById(`mining-${crypto}`);
        if (card) {
            if (miningState.crypto[crypto].active) {
                card.classList.add('active');
                card.classList.remove('inactive');
            } else {
                card.classList.remove('active');
                card.classList.add('inactive');
            }
        }
        
        const balanceElement = document.getElementById(`mining-${crypto}-balance`);
        const totalElement = document.getElementById(`mining-${crypto}-total`);
        const sessionsElement = document.getElementById(`mining-${crypto}-sessions`);
        const addressesElement = document.getElementById(`mining-${crypto}-addresses`);
        const statusElement = document.getElementById(`mining-${crypto}-status`);
        const indicatorElement = document.getElementById(`mining-${crypto}-indicator`);
        
        if (balanceElement) {
            balanceElement.textContent = `${miningState.crypto[crypto].balance.toFixed(8)} ${crypto.toUpperCase()}`;
        }
        if (totalElement) {
            totalElement.textContent = `${miningState.crypto[crypto].totalMined.toFixed(8)} ${crypto.toUpperCase()}`;
        }
        if (sessionsElement) {
            sessionsElement.textContent = miningState.crypto[crypto].sessions;
        }
        if (addressesElement) {
            addressesElement.textContent = miningState.crypto[crypto].addressesGenerated;
        }
        if (statusElement) {
            statusElement.textContent = miningState.crypto[crypto].active ? 'Mining Active' : 'Mining Stopped';
        }
        if (indicatorElement) {
            if (miningState.crypto[crypto].active) {
                indicatorElement.classList.add('active');
                indicatorElement.classList.remove('inactive');
            } else {
                indicatorElement.classList.remove('active');
                indicatorElement.classList.add('inactive');
            }
        }
    });
    
    const addressCount = document.getElementById('address-count');
    if (addressCount) {
        addressCount.textContent = miningState.addressGenerator.count;
    }
    
    const addressDisplay = document.getElementById('address-display');
    if (addressDisplay) {
        if (miningState.addressGenerator.addresses.length === 0) {
            addressDisplay.innerHTML = '<div style="text-align: center; color: rgba(0,0,0,0.5); padding: 1rem;">No addresses generated yet</div>';
        } else {
            addressDisplay.innerHTML = miningState.addressGenerator.addresses.slice(0, 20).map(addr => `
                <div class="address-item">
                    <span class="address-text" style="color: ${addr.type === 'btc' ? '#f7931a' : addr.type === 'trx' ? '#ff0013' : '#0098ea'};">
                        [${addr.type.toUpperCase()}] ${addr.address}
                    </span>
                    <button class="address-copy" onclick="copyAddress('${addr.address}')">📋 Copy</button>
                </div>
            `).join('');
        }
    }
    
    ['btc', 'trx', 'ton'].forEach(crypto => {
        const withdrawBalance = document.getElementById(`withdraw-${crypto}-balance`);
        if (withdrawBalance) {
            withdrawBalance.textContent = `${miningState.crypto[crypto].balance.toFixed(8)} ${crypto.toUpperCase()}`;
        }
    });
}

function updateMiningProgress() {
    const updateProgress = (currency, type) => {
        const state = type === 'fiat' ? miningState.fiat[currency] : miningState.crypto[currency];
        if (!state.active) return;
        
        const progressElement = document.getElementById(`mining-${currency}-progress`);
        const nextElement = document.getElementById(`mining-${currency}-next`);
        
        if (progressElement) {
            const elapsed = Date.now() - state.lastPayout;
            const progress = Math.min((elapsed / 3600000) * 100, 100);
            progressElement.style.width = `${progress}%`;
        }
        
        if (nextElement) {
            const remaining = 3600000 - (Date.now() - state.lastPayout);
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            nextElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    };
    
    ['usd', 'eur', 'gbp', 'ngn'].forEach(currency => updateProgress(currency, 'fiat'));
    ['btc', 'trx', 'ton'].forEach(crypto => updateProgress(crypto, 'crypto'));
}

function copyAddress(address) {
    navigator.clipboard.writeText(address).then(() => {
        showStatus('Address copied to clipboard', 'success');
    });
}

function addMiningLog(message, type = 'info') {
    const logEntry = {
        timestamp: Date.now(),
        message: message,
        type: type
    };
    
    miningState.logs.unshift(logEntry);
    
    if (miningState.logs.length > 100) {
        miningState.logs = miningState.logs.slice(0, 100);
    }
    
    updateMiningLogsDisplay();
}

function updateMiningLogsDisplay() {
    const logsContainer = document.getElementById('mining-logs');
    if (!logsContainer) return;
    
    logsContainer.innerHTML = miningState.logs.slice(0, 50).map(log => `
        <div class="log-entry">
            <span class="log-timestamp">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span class="log-${log.type}">${log.message}</span>
        </div>
    `).join('');
}

function clearMiningLogs() {
    miningState.logs = [];
    addMiningLog('Mining logs cleared', 'info');
}

function openCryptoWithdrawModal(crypto) {
    document.getElementById('withdrawCryptoType').value = crypto.toUpperCase();
    document.getElementById('withdrawAvailableBalance').value = `${miningState.crypto[crypto.toLowerCase()].balance.toFixed(8)} ${crypto.toUpperCase()}`;
    document.getElementById('withdrawRecipientAddress').value = '';
    document.getElementById('withdrawAmount').value = '';
    openModal('cryptoWithdrawModal');
}

function executeCryptoWithdraw() {
    const cryptoType = document.getElementById('withdrawCryptoType').value.toLowerCase();
    const recipientAddress = document.getElementById('withdrawRecipientAddress').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    
    if (!recipientAddress || recipientAddress.length < 10) {
        showStatus('Please enter a valid wallet address', 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showStatus('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > miningState.crypto[cryptoType].balance) {
        showStatus(`Insufficient ${cryptoType.toUpperCase()} balance`, 'error');
        return;
    }
    
    miningState.crypto[cryptoType].balance -= amount;
    
    addTransaction('crypto', -amount, `Withdrawal to ${recipientAddress.substring(0, 8)}...`);
    
    addMiningLog(`💸 Withdrew ${amount} ${cryptoType.toUpperCase()} to external wallet`, 'success');
    saveMiningState();
    updateMiningUI();
    updateUI();
    closeModal('cryptoWithdrawModal');
    showStatus(`✅ Successfully withdrew ${amount} ${cryptoType.toUpperCase()} with FREE LICENSE - No fees charged`, 'success');
}// ==================== ALERT SYSTEM ====================

function toggleAlert(element, alertType) {
    element.classList.toggle('active');
    appState.alerts[alertType] = element.classList.contains('active');
}

function sendAlerts(type, amount, description) {
    const timestamp = new Date().toLocaleString();
    
    if (appState.alerts.transactionSMS && type !== 'balance') {
        console.log(`[SMS Alert] To: ${appState.profile.phone}`);
        console.log(`Transaction: ${description}`);
        console.log(`Amount: ${typeof amount === 'number' ? amount.toLocaleString() : amount}`);
        console.log(`Time: ${timestamp}\n`);
    }
    
    if (appState.alerts.transactionEmail && type !== 'balance') {
        console.log(`[Email Alert] To: ${appState.profile.email}`);
        console.log(`Subject: Transaction Notification`);
        console.log(`Transaction: ${description}`);
        console.log(`Amount: ${typeof amount === 'number' ? amount.toLocaleString() : amount}`);
        console.log(`Time: ${timestamp}\n`);
    }
    
    showStatus('Alert notification sent', 'success');
}

function saveAlertSettings() {
    appState.profile.phone = document.getElementById('smsPhoneNumber').value;
    appState.profile.email = document.getElementById('alertEmail').value;
    saveToLocalStorage();
    showStatus('Alert settings saved successfully', 'success');
}

// ==================== FREE SIGNALS SYSTEM ====================

function refreshSignals() {
    const signalList = document.getElementById('signalList');
    signalList.innerHTML = '<div style="text-align: center; padding: 2rem;">🔄 Updating signals...</div>';
    
    setTimeout(() => {
        const randomSignals = bankingSignals
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        
        signalList.innerHTML = randomSignals.map(signal => `
            <li class="signal-item">
                <div class="signal-icon">${signal.icon}</div>
                <div class="signal-content">
                    <div class="signal-title">${signal.title}</div>
                    <div class="signal-description">${signal.description}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                        Signal Strength: ${signal.strength}%
                    </div>
                </div>
                <span class="signal-badge ${signal.type.toLowerCase()}">${signal.type}</span>
            </li>
        `).join('');
        
        showStatus('Banking signals updated successfully', 'success');
    }, 1000);
}

// ==================== GOOGLE SEARCH & ADDRESS LOOKUP ====================

function executeGoogleSearch() {
    const query = document.getElementById('googleSearchInput').value.trim();
    
    if (!query) {
        showStatus('Please enter a search query', 'error');
        return;
    }
    
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '<div style="text-align: center; padding: 2rem;">🔍 Searching...</div>';
    
    setTimeout(() => {
        const results = [
            {
                title: `${query} - Banking Information`,
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                snippet: `Comprehensive information about ${query} including banking services, rates, and financial guidance.`
            }
        ];
        
        searchResults.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Search Results for "${query}"</h3>
            ${results.map(result => `
                <div class="search-result-item">
                    <a href="${result.url}" target="_blank" class="result-title">${result.title}</a>
                    <div class="result-url">${result.url}</div>
                    <div class="result-snippet">${result.snippet}</div>
                </div>
            `).join('')}
        `;
        
        showStatus('Search completed successfully', 'success');
    }, 1500);
}

function lookupAddress() {
    const address = document.getElementById('httpAddressInput').value.trim();
    const lookupResult = document.getElementById('lookupResult');
    
    if (!address) {
        showStatus('Please enter a valid URL', 'error');
        return;
    }
    
    let formattedAddress = address;
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        formattedAddress = 'https://' + address;
    }
    
    lookupResult.innerHTML = '<div style="text-align: center;">🔍 Looking up address...</div>';
    lookupResult.classList.add('active');
    
    setTimeout(() => {
        const url = new URL(formattedAddress);
        const domain = url.hostname;
        
        lookupResult.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: var(--primary-color);">✅ Address Lookup Result</h4>
            <div style="display: grid; gap: 0.75rem;">
                <div><strong>Full URL:</strong><br><code>${formattedAddress}</code></div>
                <div><strong>Domain:</strong><br><code>${domain}</code></div>
                <div><strong>Protocol:</strong><br><span style="background: var(--success-color); color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${url.protocol.toUpperCase()}</span></div>
                <div><strong>Status:</strong><br><span style="color: var(--success-color); font-weight: 600;">✅ Valid HTTPS Address</span></div>
            </div>
        `;
        
        showStatus('Address lookup completed', 'success');
    }, 1000);
}

// ==================== FREE LICENSE SYSTEM ====================

const licenseInfo = {
    licenseNumber: 'LIC-2024-FREE-CombosBANK-UNLIMITED',
    licenseType: 'UNLIMITED FREE TRANSACTION LICENSE',
    licenseStatus: 'ACTIVE',
    validSince: new Date().toISOString(),
    expires: 'NEVER (LIFETIME)'
};

function initializeLicense() {
    const validSinceElement = document.getElementById('licenseValidSince');
    if (validSinceElement) {
        const validSince = localStorage.getItem('licenseValidSince') || new Date().toISOString();
        localStorage.setItem('licenseValidSince', validSince);
        validSinceElement.textContent = new Date(validSince).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }
    
    if (!localStorage.getItem('licenseInfo')) {
        localStorage.setItem('licenseInfo', JSON.stringify(licenseInfo));
    }
}

function verifyLicense() {
    const storedLicense = JSON.parse(localStorage.getItem('licenseInfo'));
    
    return {
        isValid: true,
        isFree: true,
        licenseNumber: storedLicense.licenseNumber,
        message: 'Free license verified - Unlimited transactions enabled'
    };
}

// ==================== UI UPDATE FUNCTIONS ====================

function updateUI() {
    document.getElementById('profileName').textContent = appState.profile.name;
    document.getElementById('profileDOB').textContent = formatDate(appState.profile.dob);
    document.getElementById('profileSex').textContent = appState.profile.sex;
    document.getElementById('profileCountry').textContent = appState.profile.country;
    document.getElementById('profileAccount').textContent = appState.profile.accountNumber;
    document.getElementById('profileEmail').textContent = appState.profile.email;
    document.getElementById('profilePhone').textContent = appState.profile.phone;
    
    if (appState.profile.photo && appState.profile.photo !== 'https://via.placeholder.com/200') {
        document.getElementById('profilePhoto').src = appState.profile.photo;
    }
    
    document.getElementById('mainBalance').textContent = formatCurrency(appState.balances.main);
    document.getElementById('walletBalance').textContent = formatCurrency(appState.balances.wallet);
    document.getElementById('debitWalletBalance').textContent = formatCurrency(appState.balances.debitWallet);
    document.getElementById('creditWalletBalance').textContent = formatCurrency(appState.balances.creditWallet);
    
    document.getElementById('usdBalance').textContent = `$${appState.balances.usd.toLocaleString()}`;
    document.getElementById('eurBalance').textContent = `€${appState.balances.eur.toLocaleString()}`;
    document.getElementById('gbpBalance').textContent = `£${appState.balances.gbp.toLocaleString()}`;
    document.getElementById('ngnBalance').textContent = `₦${appState.balances.ngn.toLocaleString()}`;
    
    document.getElementById('btcBalance').textContent = `${appState.balances.btc.toFixed(8)} BTC`;
    document.getElementById('trxBalance').textContent = `${appState.balances.trx.toFixed(8)} TRX`;
    document.getElementById('tonBalance').textContent = `${appState.balances.ton.toFixed(8)} TON`;
    
    const cryptoTotal = (appState.balances.btc * 65000) + (appState.balances.trx * 0.12) + (appState.balances.ton * 5.5);
    document.getElementById('cryptoBalance').textContent = `$${cryptoTotal.toFixed(2)}`;
    
    document.getElementById('debitWalletAddress').textContent = appState.walletAddresses.debit;
    document.getElementById('creditWalletAddress').textContent = appState.walletAddresses.credit;
    document.getElementById('btcWalletAddress').textContent = appState.walletAddresses.btc;
    document.getElementById('trxWalletAddress').textContent = appState.walletAddresses.trx;
    document.getElementById('tonWalletAddress').textContent = appState.walletAddresses.ton;
    
    document.getElementById('totalTransactions').textContent = appState.transactions.length;
    
    updateTransactionLists();
}

function updateTransactionLists() {
    const recentList = document.getElementById('recentTransactions');
    const fullList = document.getElementById('fullTransactionList');
    
    const updateList = (listElement, transactions) => {
        if (transactions.length === 0) {
            listElement.innerHTML = '<li class="transaction-item" style="text-align: center; color: var(--text-secondary);">No transactions yet</li>';
            return;
        }
        
        listElement.innerHTML = transactions.map(tx => `
            <li class="transaction-item">
                <div>
                    <div class="transaction-type">${tx.description}</div>
                    <div class="transaction-date">${tx.date}</div>
                </div>
                <div class="transaction-amount ${tx.amount >= 0 ? 'credit' : 'debit'}">
                    ${tx.amount >= 0 ? '+' : ''}${formatCurrency(Math.abs(tx.amount))}
                </div>
            </li>
        `).join('');
    };
    
    updateList(recentList, appState.transactions.slice(0, 5));
    updateList(fullList, appState.transactions);
}

// ==================== LOCAL STORAGE FUNCTIONS ====================

function saveToLocalStorage() {
    try {
        const dataToSave = {
            profile: appState.profile,
            balances: appState.balances,
            walletAddresses: appState.walletAddresses,
            transactions: appState.transactions,
            alerts: appState.alerts
        };
        localStorage.setItem('bankingAppState', JSON.stringify(dataToSave));
    } catch (e) {
        console.error('Error saving to local storage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('bankingAppState');
        if (savedData) {
            const data = JSON.parse(savedData);
            appState.profile = { ...appState.profile, ...data.profile };
            appState.balances = { ...appState.balances, ...data.balances };
            appState.walletAddresses = { ...appState.walletAddresses, ...data.walletAddresses };
            appState.transactions = data.transactions || [];
            appState.alerts = { ...appState.alerts, ...data.alerts };
        }
    } catch (e) {
        console.error('Error loading from local storage:', e);
    }
}