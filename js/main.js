/*----- constants -----*/
const blackjack = 21; 
const SUITS = ['s', 'c', 'd', 'h'];
const RANKS = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const FULL_DECK = buildMasterDeck();

/*----- app's state (variables) -----*/
let bank;
let bet;
let dealerHand;
let dealerHandTotal;
let playerHand;
let playerHandTotal;
let currentHandStatus;
let shuffledDeck;

/*----- cached element references -----*/
const bankEl = document.getElementById('bank');
const betEl = document.getElementById('current-bet');

/*----- event listeners -----*/
document.getElementById('bet-buttons').addEventListener('click', handleBet);
document.getElementById('deal-button').addEventListener('click', handleDeal)
/*----- functions -----*/

initialize();

function buildMasterDeck() {
    const deck = [];
    // Use nested forEach to generate card objects
    SUITS.forEach(function(suit) {
      RANKS.forEach(function(rank) {
        deck.push({
          // The 'face' property maps to the library's CSS classes for cards
          face: `${suit}${rank}`,
          // Setting the 'value' property for game of blackjack, not war
          value: Number(rank) || (rank === 'A' ? 11 : 10)
        });
      });
    });
    return deck;
  };

function getNewShuffledDeck() {
    // Create a copy of the masterDeck (leave masterDeck untouched!)
    const tempDeck = [...FULL_DECK];
    const newShuffledDeck = [];
    while (tempDeck.length) {
        // Get a random index for a card still in the tempDeck
        const rndIdx = Math.floor(Math.random() * tempDeck.length);
        // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
        newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
    }
    return newShuffledDeck;
};

function renderPlayerHand(hand, container) {
    container.innerHTML = '';
    // Let's build the cards as a string of HTML
    let cards = '';
    hand.forEach(function(card) {
      cards += `<div class="card ${card.face}"></div>`;
    });
    // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup 
    // const cardsHtml = deck.reduce(function(html, card) {
    //   return html + `<div class="card ${card.face}"></div>`;
    // }, '');
    container.innerHTML = cards;
};

function renderDealerHand(hand, container) {
    container.innerHTML = '';
    // Let's build the cards as a string of HTML
    let cards = '';
    hand.forEach(function(card) {
      cards += `<div class="card ${card.face}"></div>`;
    });
    // Or, use reduce to 'reduce' the array into a single thing - in this case a string of HTML markup 
    // const cardsHtml = deck.reduce(function(html, card) {
    //   return html + `<div class="card ${card.face}"></div>`;
    // }, '');
    container.innerHTML = cards;
};  

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

function handleBet(evt) {
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


function handleDeal() {
    bank = bank - bet;
    renderBank();
    bet = 0;
    renderBet();
    shuffledDeck = getNewShuffledDeck();
    getPlayerCard();
    getDealerCard();
    getPlayerCard();
    getDealerCard();
    renderPlayerHand(playerHand, document.getElementById('player-hand'));
    renderDealerHand(dealerHand, document.getElementById('dealer-hand'));
    evaluateHand();    
    console.log(playerHand, dealerHand);
};    

function getPlayerCard() {
    playerHand.push(shuffledDeck.shift());
};

function getDealerCard() {
    dealerHand.push(shuffledDeck.shift());
};

function evaluateHand() {

};

function renderBet() {
    betEl.innerHTML = `Current Bet: ${bet}`;
};

function renderHand() {
    let cards = ''
    playerHand.forEach(function(card) {
        cards.innerHTML += `<div class="card ${card.face}"></div>`;
    })
};


function evaluateHand() {

};

function hit() {

};

function stay() {

};

function surrender() {

};
