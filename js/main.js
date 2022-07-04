/*----- constants -----*/
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
let playerAces;
let dealerAces;
let playerSoft;
let dealerSoft;

/*----- cached element references -----*/
const bankEl = document.getElementById('bank');
const betEl = document.getElementById('current-bet');
const messageEl = document.getElementById('message');
const dealButtonEl = document.getElementById('deal-button');
const resetButtonEl = document.getElementById('reset-button');
const playButtonEl = document.getElementById('play-buttons');
const betButtonEl = document.getElementById('bet-buttons');
const playerHandEl = document.getElementById('player-hand');
const dealerHandEl = document.getElementById('dealer-hand');
const hitButtonEl = document.getElementById('hit-button');
const stayButtonEl = document.getElementById('stay-button');
const surrenderButtonEl = document.getElementById('surrender-button');
const doubleButtonEl = document.getElementById('double-button');
const playAgainButtonEl = document.getElementById('play-again-button');
const playerEl = document.getElementById('player')
const dealerEl = document.getElementById('dealer')

/*----- event listeners -----*/
document.getElementById('bet-buttons').addEventListener('click', handleBet);
document.getElementById('deal-button').addEventListener('click', handleDeal);
document.getElementById('play-buttons').addEventListener('click', handlePlay);
document.getElementById('play-again-button').addEventListener('click', handlePlayAgain)
document.getElementById('reset-button').addEventListener('click', handleReset);
document.getElementById('double-button').addEventListener('click', handleDouble);
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
    hiddenDealerCard = [];
    playerAces = 0;
    dealerAces = 0;
    playerSoft = true;
    dealerSoft = true;
    render();
};

function render() {
    renderBank();
    renderBet();
    checkBank();
};

function renderBank() {
    return bankEl.innerHTML = `Bank: ${bank}`;
};

function handleBet(evt) {
    // Guards
    if (
        evt.target.tagName !== 'BUTTON' ||
        currentHandStatus !== '' ||
        bank === bet ||
        bet + parseInt(evt.target.innerHTML) > bank
    ) return;
        dealButtonEl.style.visibility = 'visible';
        resetButtonEl.style.visibility = 'visible';
        bet += parseInt(evt.target.innerHTML);
        render();
    };
    
function handleReset(evt) {
    if (evt.target.innerHTML === 'Reset') {
        bet = 0;
        dealButtonEl.style.visibility = 'hidden';
        resetButtonEl.style.visibility = 'hidden';
    };
    render();
};

function handleDeal() {
    // Guards
    if (
        currentHandStatus !== '' ||
        bet === 0
    ) return;
    currentHandStatus = 'p';
    messageEl.innerHTML = `Seat Open! Come Try Your Luck!`;
    dealButtonEl.style.visibility = 'hidden';
    betButtonEl.style.visibility = 'hidden';
    surrenderButtonEl.style.visibility = 'visible';
    hitButtonEl.style.visibility = 'visible';
    stayButtonEl.style.visibility = 'visible';
    doubleButtonEl.style.visibility = 'visible';
    resetButtonEl.style.visibility = 'hidden';
    playerEl.innerHTML = `PLAYER`;
    dealerEl.innerHTML = `DEALER`;
    bank = bank - bet;
    dealerHandTotal = 0;
    playerHandTotal = 0;
    playerAces = 0;
    dealerAces = 0;
    playerSoft = true;
    dealerSoft = true;
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
    aces = 0;
    playerHand.forEach(function(card) {
      playerHandTotal += card.value;
      if (card.value === 11) {
        playerAces += 1;
      };
    });
    while (playerHandTotal > 21 && playerAces > 0) {
        playerHandTotal -= 10;
        playerAces -= 1;
        playerSoft = false;
    };
};

function evaluateDealerHand() {
    dealerHand[0] = hiddenDealerCard;
    dealerHand.forEach(function(card) {
      dealerHandTotal += card.value;
      if (card.value === 11) {
        dealerAces += 1;
        };
    });
};

function evaluateDealerHiddenHand() {
    dealerHand.forEach(function(card) {
    dealerHandTotal += card.value;
    if (card.value === 11) {
        dealerAces += 1;
    };
    while (dealerHandTotal > 21 && dealerAces > 0) {
        dealerHandTotal -= 10;
        dealerAces -= 1;
        dealerSoft = false;
    };
})};

function dealerTurn() {
    hidePlayButtons();
    renderDealerHiddenHand(dealerHandEl);
    checkDealerSoft();
    console.log(dealerHand);
    while (dealerHandTotal < 17 || (dealerHandTotal === 17 && dealerSoft === true)) {
        dealerHit();
        evaluateDealerHiddenHand();
        checkDealerSoft();
    };
    dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
    compareHands(); 
};

function checkDealerSoft() {
    if (dealerAces === 0 && dealerHandTotal > 10) {
        dealerSoft = false;
    } else {
        dealerSoft = true;
    };
};

function checkPlayerSoft() {
    if (playerAces === 0 && playerHandTotal > 10) {
        playerSoft = false;
    } else {
        playerSoft = true;
    };
};

function checkForBlackJack() {
    if (playerHandTotal === 21 && dealerHandTotal === 21) {
        bank += bet;
        renderDealerHiddenHand(dealerHandEl);
        messageEl.innerHTML = `It's a Blackjack Tie!`;
        currentHandStatus = '';
        getNewShuffledDeck();
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        dealerHandTotal = 0;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playererHandTotal}`;
        hidePlayButtons();
    } else if (playerHandTotal === 21 && dealerHandTotal !== 21) {
        bank += bet + bet*1.2;
        messageEl.innerHTML = `Blackjack! Player wins!`;
        currentHandStatus = '';
        renderDealerHiddenHand(dealerHandEl);
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        dealerHandTotal = 0;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playererHandTotal}`;
        hidePlayButtons();
    } else if (playerHandTotal !== 21 && dealerHandTotal === 21) {
        renderDealerHiddenHand(dealerHandEl);
        messageEl.innerHTML = `Blackjack! Dealer wins!`;
        currentHandStatus = '';
        playerHand = [];
        dealerHand = [];
        playerHandTotal = 0;
        dealerHandTotal = 0;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playererHandTotal}`;
        hidePlayButtons();
    } else {
        playerTurn();
    };
    render()
};

function renderBet() {
    betEl.innerHTML = `Current Bet: ${bet}`;
};

function playerTurn() {
    checkPlayerSoft();
    if (playerHandTotal >= 19 && playerSoft === false) {
        hidePlayButtons();
        stayButtonEl.style.visibility = 'visible';
        surrenderButtonEl.style.visibility = 'visible'; 
    } else if (playerHandTotal < 12) {
        hitButtonEl.style.visibility = 'visible';
        stayButtonEl.style.visibility = 'hidden';
        surrenderButtonEl.style.visibility = 'visible'; 
        doubleButtonEl.style.visibility = 'visible'; 
    } else {
        hitButtonEl.style.visibility = 'visible';
        stayButtonEl.style.visibility = 'visible';
        surrenderButtonEl.style.visibility = 'visible'; 
        doubleButtonEl.style.visibility = 'visible'; 
    }; 
};

function compareHands() {
    if (playerHandTotal === dealerHandTotal) {
        messageEl.innerHTML = `It's a Tie!`;
        bank += bet;
        currentHandStatus = '';
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else if (playerHandTotal > dealerHandTotal){
        messageEl.innerHTML = `Dealer: ${dealerHandTotal}, Player: ${playerHandTotal}. Player Wins!!`;
        bank += bet*2;
        currentHandStatus = '';
        bet = 0;    
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else if (dealerHandTotal > 21 && dealerSoft === false) {
        messageEl.innerHTML = `Dealer Busted with ${dealerHandTotal}! Player Wins!`;
        bank += bet*2;
        currentHandStatus = '';
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else {
        messageEl.innerHTML = `Dealer: ${dealerHandTotal}, Player: ${playerHandTotal}. Dealer Wins!`;
        currentHandStatus = '';
        bet = 0;  
        betButtonEl.style.visibility = 'visible'; 
        hidePlayButtons()
        checkBank();
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
        doubleButtonEl.style.visibility = 'hidden';
        surrenderButtonEl.style.visibility = 'hidden';
    } else if (evt2.target.innerHTML === 'Stay') {
        stay();
    } else {
        surrender();
    };
    render();
};

function playerHit() {
    getPlayerCard();
    playerHandTotal = 0;
    renderPlayerHand(playerHandEl);
    evaluatePlayerHand();
    if (playerHandTotal > 21) {
        messageEl.innerHTML = `Player Busted with ${playerHandTotal}! Better Luck Next Time!`;
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
        renderDealerHiddenHand(dealerHandEl);
        currentHandStatus = '';
        playerHand = [];
        dealerHand = [];
        // playerHandTotal = 0;
        bet = 0;
        playButtonEl.style.visibility = "hidden";
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else if (playerHandTotal >= 19) {
        hitButtonEl.style.visibility = 'hidden';
        hidePlayButtons();
        stayButtonEl.style.visibility = 'visible';
    };
    playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
    render();
};

function dealerHit() {
    getDealerCard();
    dealerHandTotal = 0;
    renderDealerHiddenHand(dealerHandEl);
    };
    
function stay() {
    dealerTurn(); 
    playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;  
};
    
function surrender() {
    // Guard
    if (
        playerHand.length !== 2
        ) return;
    renderDealerHiddenHand(dealerHandEl);
    messageEl.innerHTML = `Player Surredered. Dealer Wins.`;
    dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
    playerEl.innerHTML = `PLAYER: SURRENDERED`;
    bank += bet/2;
    playerHand = [];
    dealerHand = [];
    bet = 0;
    playerHandTotal = 0;
    dealerHandTotal = 0;
    currentHandStatus = '';
    playButtonEl.style.visibility = "hidden";
    betButtonEl.style.visibility = 'visible';  
    hidePlayButtons();       
};

function checkBank() {
    if(bank < 25) {
        betButtonEl.style.visibility = 'hidden';
        messageEl.innerHTML = `Out Of Money. Better Luck Next Time.`;
        playAgainButtonEl.style.visibility = 'visible';
    };
};

function handlePlayAgain(evt) {
    if (evt.target.innerHTML === 'Play Again') {
        playAgainButtonEl.style.visibility = 'hidden';
        betButtonEl.style.visibility = 'visible';
        playerEl.innerHTML = `PLAYER`;
        dealerEl.innerHTML = `DEALER`;
        initialize();
    };
};
function handleDouble(evt) {
    if (evt.target.innerHTML === 'Double Down') {
        hidePlayButtons();
        stayButtonEl.style.visibility = 'visible';
        bank -= bet;
        bet = bet *2;
        playerHit();
        if (playerHandTotal > 21) {
            messageEl.innerHTML = `Player Busted with ${playerHandTotal}! Better Luck Next Time!`;
            renderDealerHiddenHand(dealerHandEl);
            currentHandStatus = '';
            playerHand = [];
            dealerHand = [];
            playerHandTotal = 0;
            bet = 0;
            playButtonEl.style.visibility = "hidden";
            betButtonEl.style.visibility = 'visible';
            hitButtonEl.style.visibility = 'hidden';
            stayButtonEl.style.visibility = 'hidden';
            checkBank();
        };
    };
};

function hidePlayButtons() {
    surrenderButtonEl.style.visibility = 'hidden';
    hitButtonEl.style.visibility = 'hidden';
    stayButtonEl.style.visibility = 'hidden';
    doubleButtonEl.style.visibility = 'hidden';
};