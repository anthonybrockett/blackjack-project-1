/*----- constants -----*/
const blackjack = [
    
]; 
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
let hiddenDealerCard;

/*----- cached element references -----*/
const bankEl = document.getElementById('bank');
const betEl = document.getElementById('current-bet');
const messageEl = document.getElementById('message');
const playButtonEl = document.getElementById('play-buttons');
const playerHandEl = document.getElementById('player-hand');
const dealerHandEl = document.getElementById('dealer-hand');
const hitButtonEl = document.getElementById('hit-button');
const stayButtonEl = document.getElementById('stay-button');
const surrenderButtonEl = document.getElementById('surrender-button');

/*----- event listeners -----*/
document.getElementById('bet-buttons').addEventListener('click', handleBet);
document.getElementById('deal-button').addEventListener('click', handleDeal)
document.getElementById('play-buttons').addEventListener('click', handlePlay)
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
          back: `back-red`,
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

function renderPlayerHand(container) {
    container.innerHTML = '';
    let cards = '';
    playerHand.forEach(function(card) {
      cards += `<div class="card ${card.face}"></div>`;
    });
    container.innerHTML = cards;
};

function renderDealerHand(container) {
    container.innerHTML = '';
    let cards = '';
    hiddenDealerCard = dealerHand[0];
    cards = dealerHand[0] = `<div class="card ${dealerHand[0].back}"></div>`;
    cards += `<div class="card ${dealerHand[1].face}"></div>`;
    container.innerHTML = cards;
};  

function renderDealerHiddenHand(container) {
    container.innerHTML = '';
    let cards = '';
    dealerHand[0] = hiddenDealerCard;
    console.log(dealerHand);
    dealerHand.forEach(function(card) {
        cards += `<div class="card ${card.face}"></div>`;
      });
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
    // Guards
    if (
        evt.target.tagName !== 'BUTTON' ||
        currentHandStatus !== ''
    ) return;
    if (evt.target.innerHTML === 'Reset') {
        bet = 0;
    } else {
        bet += parseInt(evt.target.innerHTML);
    };
    render();
    };


function handleDeal() {
    // Guards
    if (
        currentHandStatus !== ''
    ) return;
    currentHandStatus = 'p';
    messageEl.innerHTML = `Seat Open! Come Try Your Luck!`
    bank = bank - bet;
    dealerHandTotal = 0;
    playerHandTotal = 0;
    playerHand = [];
    dealerHand = [];
    renderBank();
    shuffledDeck = getNewShuffledDeck();
    getPlayerCard();
    getDealerCard();
    getPlayerCard();
    getDealerCard();
    renderPlayerHand(playerHandEl);
    renderDealerHand(dealerHandEl);  
    evaluatePlayerHand();
    evaluateDealerHand();
    checkForBlackJack();
    render();
};    

function getPlayerCard() {
    playerHand.push(shuffledDeck.shift());
};

function getDealerCard() {
    dealerHand.push(shuffledDeck.shift());
};

function evaluatePlayerHand() {
    playerHand.forEach(function(card) {
      playerHandTotal += card.value;
    });
};

function evaluateDealerHand() {
    dealerHand[0] = hiddenDealerCard;
    dealerHand.forEach(function(card) {
      dealerHandTotal += card.value;
    });
};

function evaluateDealerHiddenHand() {
    dealerHand.forEach(function(card) {
      dealerHandTotal += card.value;
    });
};

function checkForBlackJack() {
    if (playerHandTotal === 21 && dealerHandTotal === 21) {
        bank += bet;
        renderDealerHiddenHand(dealerHandEl);
        messageEl.innerHTML = `It's a Tie!`;
        currentHandStatus = '';
        getNewShuffledDeck();
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        dealerHandTotal = 0;
    } else if (playerHandTotal === 21 && dealerHandTotal !== 21) {
        bank += bet + bet*1.2;
        messageEl.innerHTML = `Blackjack! Player wins!`;
        currentHandStatus = '';
        renderDealerHiddenHand(dealerHandEl);
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        dealerHandTotal = 0;
    } else if (playerHandTotal !== 21 && dealerHandTotal === 21) {
        renderDealerHiddenHand(dealerHandEl);
        messageEl.innerHTML = `Blackjack! Dealer wins!`;
        currentHandStatus = '';
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        dealerHandTotal = 0;
    } else {
        playerTurn();
    };
    render()
};

function renderBet() {
    betEl.innerHTML = `Current Bet: ${bet}`;
};

function playerTurn() {
    playButtonEl.style.visibility = "visible";
};

function dealerTurn() {
    playButtonEl.style.visibility = "hidden";
    renderDealerHiddenHand(dealerHandEl);
    while (dealerHandTotal < 17) {
        dealerHit();
        evaluateDealerHiddenHand();
    };
    compareHands()
};

function compareHands() {
    if (playerHandTotal === dealerHandTotal) {
        messageEl.innerHTML = `It's a Tie!`;
        bank += bet;
        currentHandStatus = '';
        bet = 0;
    } else if (playerHandTotal > dealerHandTotal){
        messageEl.innerHTML = `Player Wins!!`;
        bank += bet*2;
        currentHandStatus = '';
        bet = 0;    
    } else if (dealerHandTotal > 21) {
        messageEl.innerHTML = `Dealer Bust! Player Wins!`;
        bank += bet*2;
        currentHandStatus = '';
        bet = 0;
    } else {
        messageEl.innerHTML = `Dealer Wins!`;
        currentHandStatus = '';
        bet = 0;    
    };
    render();
};

function handlePlay(evt2) {
    // Guards
    if (
        evt2.target.tagName !== 'BUTTON' ||
        playerHandTotal === 0
    ) return;
    if (evt2.target.innerHTML === 'Hit') {
        playerHit();
    } else if (evt2.target.innerHTML === 'Stay') {
        stay();
    } else {
        surrender();
    };
    render();
};

function playerHit() {
    // Guard
    if (
        playerHandTotal >= 18
    ) return;
    getPlayerCard();
    playerHandTotal = 0;
    renderPlayerHand(playerHandEl);
    evaluatePlayerHand();
    if (playerHandTotal > 21) {
        messageEl.innerHTML = `Player Bust! Better Luck Next Time!`;
        renderDealerHiddenHand(dealerHandEl);
        currentHandStatus = '';
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        bet = 0;
        playButtonEl.style.visibility = "hidden";
    };
    render();
};

function dealerHit() {
    getDealerCard();
    dealerHandTotal = 0;
    renderDealerHiddenHand(dealerHandEl);
    // if (dealerHandTotal > 21) {
        //     messageEl.innerHTML = `Dealer Bust! Player Wins!`;
        //     currentHandStatus = '';
        //     playerHand = [];
        //     dealerHand = [];
        //     dealerHandTotal = 0;
        //     bank += bet*2
        // }; 
    };
    
    function stay() {
        dealerTurn();   
    };
    
    function surrender() {
        // Guard
        if (
            playerHand.length !== 2
            ) return;
            renderDealerHiddenHand(dealerHandEl);
            messageEl.innerHTML = `Player Surredered. Dealer Wins.`
            bank += bet/2;
            playerHand = [];
            dealerHand = [];
            bet = 0;
            playerHandTotal = 0;
            dealerHandTotal = 0;
            currentHandStatus = '';
            playButtonEl.style.visibility = "hidden";
            
};
