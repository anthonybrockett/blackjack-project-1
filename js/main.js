/*----- constants -----*/
const blackjack = 21; //UPDATE LATER

/*----- app's state (variables) -----*/
let bank;
let bet;
let dealerHand;
let dealerHandTotal;
let playerHand;
let playerHandTotal;
let currentHandStatus;
/*----- cached element references -----*/
const bankEl = document.getElementById('bank');
const betEl = document.getElementById('current-bet');

/*----- event listeners -----*/
document.getElementById('bet-buttons').addEventListener('click', handleBet);
/*----- functions -----*/

initialize();

function initialize() {
    bank = 1000;
    bet = 0;
    dealerHand = [];
    dealerHandTotal = 0;            
    playerHand = [];
    playerHandTotal = 0;
    currentHandStatus = '';
    render();
};

function render() {
    renderBank();
    renderBet();
};

function renderBank() {
    return bankEl.innerHTML = `Bank: ${bank}`;
};

function handleBet (evt) {
//     // Guards
//     // if (
//     //     evt.target.tagName !== 'BUTTON' ||
//     //     currentHandStatus !== ''
//     // ) return;
    if (evt.target.innerHTML === 'Reset') {
        bet = 0;
    } else {
        bet += parseInt(evt.target.innerHTML);
    };
    render();
    };

function renderBet() {
    console.log(bet, 'bet');
    betEl.innerHTML = `Current Bet: ${bet}`;
};

function hit() {

};

function stay() {

};

function surrender() {

};
