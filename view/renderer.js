window.electronAPI.onOpenSeedDialog((_event) => {
    const seedDialog = document.getElementById('seed-dialog');
    const seedInput = seedDialog.querySelector('input');
    const submitButton = seedDialog.querySelector('button[type="submit"]');
    const resetButton = seedDialog.querySelector('button[type="reset"]');

    submitButton.addEventListener('click', () => {
        const seed = seedInput.value;
        window.electronAPI.onEnterSeed(seed)
        seedDialog.close()
    });

    resetButton.addEventListener('click', () => {
        seedInput.value = '';
    });

    seedDialog.showModal()
})

window.electronAPI.onOpenPasswordDialog((_event) => {
    const passwordDialog = document.getElementById('password-dialog');
    const passwordInput = passwordDialog.querySelector('input');
    const submitButton = passwordDialog.querySelector('button[type="submit"]');
    const resetButton = passwordDialog.querySelector('button[type="reset"]');

    submitButton.addEventListener('click', () => {
        const password = passwordInput.value;
        window.electronAPI.onEnterPassword(password)
        passwordDialog.close()
    });

    resetButton.addEventListener('click', () => {
        passwordInput.value = '';
    });

    passwordDialog.showModal()
});

const ledgerIndexEl = document.getElementById('ledger-index')
const ledgerHashEl = document.getElementById('ledger-hash')
const ledgerCloseTimeEl = document.getElementById('ledger-close-time')

window.electronAPI.onUpdateLedgerData((_event, ledger) => {
    ledgerIndexEl.innerText = ledger.ledgerIndex
    ledgerHashEl.innerText = ledger.ledgerHash
    ledgerCloseTimeEl.innerText = ledger.ledgerCloseTime
})

const accountAddressClassicEl = document.getElementById('account-address-classic')
const accountAddressXEl = document.getElementById('account-address-x')
const accountBalanceEl = document.getElementById('account-balance')
const accountReserveEl = document.getElementById('account-reserve')

window.electronAPI.onUpdateAccountData((_event, value) => {
    accountAddressClassicEl.innerText = value.classicAddress
    accountAddressXEl.innerText = value.xAddress
    accountBalanceEl.innerText = value.xrpBalance
    accountReserveEl.innerText = value.xrpReserve
})

const txTableBodyEl = document.getElementById('tx-table').tBodies[0]
window.testEl = txTableBodyEl

window.electronAPI.onUpdateTransactionData((_event, transactions) => {
    for (let transaction of transactions) {
        txTableBodyEl.insertAdjacentHTML( 'beforeend',
            "<tr>" +
            "<td>" + transaction.confirmed + "</td>" +
            "<td>" + transaction.type + "</td>" +
            "<td>" + transaction.from + "</td>" +
            "<td>" + transaction.to + "</td>" +
            "<td>" + transaction.value + "</td>" +
            "<td>" + transaction.hash + "</td>" +
            "</tr>"
        )
    }
})

const modalButton = document.getElementById('send-xrp-modal-button')
const modalDialog = new bootstrap.Modal(document.getElementById('send-xrp-modal'))

console.log(123)
modalButton.addEventListener('click', () => {
    modalDialog.show()
})

const accountVerificationEl = document.querySelector('.accountVerificationIndicator span')
const destinationAddressEl = document.getElementById('input-destination-address')
const destinationTagEl = document.getElementById('input-destination-tag')
const amountEl = document.getElementById('input-xrp-amount')
const sendXrpButtonEl = document.getElementById('send-xrp-submit-button')

destinationAddressEl.addEventListener('input', (event) => {
    window.electronAPI.onDestinationAccountChange(destinationAddressEl.value)
})

window.electronAPI.onUpdateDomainVerificationData((_event, result) => {
    accountVerificationEl.textContent = `Domain: ${result.domain || 'n/a'} Verified: ${result.verified}`
})

sendXrpButtonEl.addEventListener('click', () => {
    modalDialog.hide()
    const destinationAddress = destinationAddressEl.value
    const destinationTag = destinationTagEl.value
    const amount = amountEl.value

    window.electronAPI.onClickSendXrp({destinationAddress, destinationTag, amount})
})

window.electronAPI.onSendXrpTransactionFinish((_event) => {
    destinationAddressEl.value = ''
    destinationTagEl.value = ''
    amountEl.value = ''
})
