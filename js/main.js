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
const playerEl = document.getElementById('player');
const dealerEl = document.getElementById('dealer');

/*----- event listeners -----*/
document.getElementById('bet-buttons').addEventListener('click', handleBet);
document.getElementById('deal-button').addEventListener('click', handleDeal);
document.getElementById('play-buttons').addEventListener('click', handlePlay);
document.getElementById('play-again-button').addEventListener('click', handlePlayAgain)
document.getElementById('reset-button').addEventListener('click', handleReset);
/*----- functions -----*/

initialize();

function initialize() {
    bank = 1000;
    bet = 0;
    clearHands();
    clearTotals();
    hiddenDealerCard = [];
    playerAces = 0;
    dealerAces = 0;
    playerSoft = true;
    dealerSoft = true;
    render();
};

// Deck Functions

function buildMasterDeck() {
    const masterDeck = [];
    SUITS.forEach(function (suit) {
        RANKS.forEach(function (rank) {
            masterDeck.push({
                face: `${suit}${rank}`,
                back: `back-red`,
                value: Number(rank) || (rank === 'A' ? 11 : 10)
            });
        });
    });
    return masterDeck;
};

function getNewShuffledDeck() {
    const tempDeck = [...FULL_DECK];
    const newShuffledDeck = [];
    while (tempDeck.length) {
        const rndIdx = Math.floor(Math.random() * tempDeck.length);
        newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
    };
    return newShuffledDeck;
};

// Render Hand Functions

function render() {
    renderBank();
    renderBet();
    checkBank();
};

function checkBank() {
    if (bank === 0 && bet === 0) {
        hideBetButtons();
        messageEl.innerHTML = `Out Of Money. Better Luck Next Time.`;
        showPlayAgainButton();
    };
};

function renderBank() {
    return bankEl.innerHTML = `Bank: ${bank}`;
};

function renderBet() {
    betEl.innerHTML = `Current Bet: ${bet}`;
};

function renderDealerHand(dealerHandArea) {
    dealerHandArea.innerHTML = '';
    let cards = '';
    hiddenDealerCard = dealerHand[0];
    cards = dealerHand[0] = `<div class="card ${dealerHand[0].back}"></div>`;
    cards += `<div class="card ${dealerHand[1].face}"></div>`;
    dealerHandArea.innerHTML = cards;
};

function renderDealerHiddenHand(dealerHandArea) {
    dealerHandArea.innerHTML = '';
    let cards = '';
    dealerHand[0] = hiddenDealerCard;
    dealerHand.forEach(function (card) {
        cards += `<div class="card ${card.face}"></div>`;
    });
    dealerHandArea.innerHTML = cards;
};

function renderClearDealerHand(dealerHandArea) {
    dealerHandArea.innerHTML = '';
    let cards = '';
    dealerHand.forEach(function (card) {
        cards += `<div class="card ${card.face}"></div>`;
    });
    dealerHandArea.innerHTML = cards;
};

function renderPlayerHand(playerHandArea) {
    playerHandArea.innerHTML = '';
    let cards = '';
    playerHand.forEach(function (card) {
        cards += `<div class="card ${card.face}"></div>`;
    });
    playerHandArea.innerHTML = cards;
};

// Event Listener Functions

function handleBet(evt) {
    if (
        evt.target.tagName !== 'BUTTON' ||
        bank === bet ||
        bet + parseInt(evt.target.innerHTML) > bank
    ) return;
    showDealButton();
    showResetButton();
    if (evt.target.innerHTML === "All In") {
        bet = bank;
    } else {
        bet += parseInt(evt.target.innerHTML);
    };
    render();
};

function handleDeal() {
    if (
        bet === 0
    ) return;
    messageEl.innerHTML = `Seat Open! Come Try Your Luck!`;
    hideDealButton();
    hideBetButtons();
    showPlayButtons();
    hideResetButton();
    bank = bank - bet;
    clearTotals();
    playerAces = 0;
    dealerAces = 0;
    playerSoft = true;
    dealerSoft = true;
    clearHands();
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
    playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
    dealerEl.innerHTML = `DEALER ${dealerHand[1].value}`;
    checkForBlackJack();
    render();
};

function handlePlay(evt2) {
    if (
        evt2.target.tagName !== 'BUTTON'
    ) return;
    if (evt2.target.innerHTML === 'Hit') {
        playerHit();
        hideDoubleButton();
        hideSurrenderButton();
    } else if (evt2.target.innerHTML === 'Stay') {
        stay();
    } else if (evt2.target.innerHTML === 'Surrender') {
        surrender();
    } else {
        doubleDown();
    };
    render();
};

function handlePlayAgain(evt) {
    if (evt.target.innerHTML === 'More Chips') {
        hidePlayAgainButton();
        showBetButtons();
        playerEl.innerHTML = `PLAYER`;
        dealerEl.innerHTML = `DEALER`;
        messageEl.innerText = `Seat Open! Come Try Your Luck!`;
        clearHands();
        renderClearDealerHand(dealerHandEl);
        renderPlayerHand(playerHandEl);
        initialize();
    };
};

function handleReset(evt) {
    if (evt.target.innerHTML === 'Reset') {
        bet = 0;
        hideDealButton();
        hideResetButton();
    };
    render();
};

// Compare Hand Functions

function evaluatePlayerHand() {
    playerAces = 0;
    playerHand.forEach(function (card) {
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
    dealerHand.forEach(function (card) {
        dealerHandTotal += card.value;
        if (card.value === 11) {
            dealerAces += 1;
        };
    });
};

function evaluateDealerHiddenHand() {
    dealerAces = 0;
    dealerHand.forEach(function (card) {
        dealerHandTotal += card.value;
        if (card.value === 11) {
            dealerAces += 1;
        };
        while (dealerHandTotal > 21 && dealerAces > 0) {
            dealerHandTotal -= 10;
            dealerAces -= 1;
            dealerSoft = false;
        };
    })
};

function checkForBlackJack() {
    if (playerHandTotal === 21 && dealerHandTotal === 21) {
        bank += bet;
        renderDealerHiddenHand(dealerHandEl);
        messageEl.innerHTML = `It's a Blackjack Tie!`;
        getNewShuffledDeck();
        bet = 0;
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
        showBetButtons();
        hidePlayButtons();
    } else if (playerHandTotal === 21 && dealerHandTotal !== 21) {
        bank += bet + bet * 1.2;
        messageEl.innerHTML = `Blackjack! Player wins!`;
        renderDealerHiddenHand(dealerHandEl);
        bet = 0;
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
        showBetButtons();
        hidePlayButtons();
    } else if (playerHandTotal !== 21 && dealerHandTotal === 21) {
        renderDealerHiddenHand(dealerHandEl);
        messageEl.innerHTML = `Blackjack! Dealer wins!`;
        bet = 0;
        dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
        playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
        showBetButtons();
        hidePlayButtons();
    } else {
        playerTurn();
    };
    render()
};

function compareHands() {
    if (playerHandTotal === dealerHandTotal) {
        messageEl.innerHTML = `It's a Tie!`;
        bank += bet;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else if (playerHandTotal > dealerHandTotal) {
        messageEl.innerHTML = `Dealer: ${dealerHandTotal}, Player: ${playerHandTotal}. Player Wins!!`;
        bank += bet * 2;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else if (dealerHandTotal > 21 && dealerSoft === false) {
        messageEl.innerHTML = `Dealer Busted with ${dealerHandTotal}! Player Wins!`;
        bank += bet * 2;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else {
        messageEl.innerHTML = `Dealer: ${dealerHandTotal}, Player: ${playerHandTotal}. Dealer Wins!`;
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons()
        checkBank();
    };
    render();
};

// Miscellaneous Hand Functions

function getPlayerCard() {
    playerHand.push(shuffledDeck.shift());
};

function getDealerCard() {
    dealerHand.push(shuffledDeck.shift());
};

function clearHands() {
    playerHand = [];
    dealerHand = [];
};

function clearTotals() {
    playerHandTotal = 0;
    dealerHandTotal = 0;
};

// Dealer Hand Functions

function checkDealerSoft() {
    if (dealerAces === 0 && dealerHandTotal > 10) {
        dealerSoft = false;
    } else if (dealerHandTotal === 17 && dealerAces === 0) {
        dealerSoft = false;
    } else {
        dealerSoft = true;
    };
};

function dealerHit() {
    getDealerCard();
    dealerHandTotal = 0;
    renderDealerHiddenHand(dealerHandEl);
};

function dealerTurn() {
    hidePlayButtons();
    renderDealerHiddenHand(dealerHandEl);
    checkDealerSoft();
    while (dealerHandTotal < 17 || (dealerHandTotal === 17 && dealerSoft === true)) {
        dealerHit();
        evaluateDealerHiddenHand();
        checkDealerSoft();
    };
    dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
    compareHands();
};

// Player Hand Functions

function checkPlayerSoft() {
    if (playerAces === 0 && playerHandTotal > 10) {
        playerSoft = false;
    } else {
        playerSoft = true;
    };
};

function doubleDown() {
    if (
        bank === 0
        ) return;
    if (bank >= bet) {
        bank -= bet;
        bet = bet * 2;
        playerHit();
        hidePlayButtons();
    } else if (bank < bet) {
        let doubleAmount = bank;
        bank -= doubleAmount;
        bet += doubleAmount;
        playerHit();
        hidePlayButtons();
    } else {
        return;
    };
    if (playerHandTotal > 21) {
        messageEl.innerHTML = `Player Busted with ${playerHandTotal}! Better Luck Next Time!`;
        clearHands();
        playerHandTotal = 0;
        bet = 0;
        showBetButtons();
        hidePlayButtons();
        checkBank();
    } else {
        dealerTurn();
    };
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
        clearHands();
        bet = 0;
        betButtonEl.style.visibility = 'visible';
        hidePlayButtons();
        checkBank();
    } else if (playerHandTotal >= 19 && playerAces === 0) {
        hidePlayButtons();
        showStayButton();
    } else if (playerHandTotal >= 19 && playerSoft === true) {
        hidePlayButtons();
        showStayButton();
        showHitButton();
    } else if (playerHandTotal < 12) {
        hidePlayButtons();
        showHitButton();
    } else {
        hidePlayButtons();
        showHitButton();
        showStayButton();
    };
    playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
    render();
};

function playerTurn() {
    checkPlayerSoft();
    if (playerHandTotal >= 19 && playerSoft === false) {
        hidePlayButtons();
        showStayButton();
        showSurrenderButton();
    } else if (playerHandTotal >= 12 && bank === 0) {
        showPlayButtons();
        hideDoubleButton();
    } else if (playerHandTotal < 12 && bank === 0) {
        showPlayButtons();
        hideStayButton();
        hideDoubleButton();
    } else if (playerHandTotal < 12 && bank !== 0) {
        showPlayButtons();
        hideStayButton();
    } else {
        showPlayButtons();
    };
};

function stay() {
    dealerTurn();
    playerEl.innerHTML = `PLAYER: ${playerHandTotal}`;
};

function surrender() {
    if (
        playerHand.length !== 2
    ) return;
    renderDealerHiddenHand(dealerHandEl);
    messageEl.innerHTML = `Player Surrendered. Dealer Wins.`;
    dealerEl.innerHTML = `DEALER: ${dealerHandTotal}`;
    playerEl.innerHTML = `PLAYER: SURRENDERED`;
    bank += bet / 2;
    clearHands();
    bet = 0;
    clearTotals();
    showBetButtons();
    hidePlayButtons();
};

// Play Again Button Functions

function hidePlayAgainButton() {
    playAgainButtonEl.style.visibility = 'hidden';
};

function showPlayAgainButton() {
    playAgainButtonEl.style.visibility = 'visible';
};

// Reset Button Functions

function hideResetButton() {
    resetButtonEl.style.visibility = 'hidden';
};

function showResetButton() {
    resetButtonEl.style.visibility = 'visible';
};

// Deal Button Functions

function hideDealButton() {
    dealButtonEl.style.visibility = 'hidden';
};

function showDealButton() {
    dealButtonEl.style.visibility = 'visible';
};

// Bet Button Functions

function hideBetButtons() {
    betButtonEl.style.visibility = 'hidden';
};

function showBetButtons() {
    betButtonEl.style.visibility = 'visible';
};

// Play Button Functions

function hidePlayButtons() {
    surrenderButtonEl.style.visibility = 'hidden';
    hitButtonEl.style.visibility = 'hidden';
    stayButtonEl.style.visibility = 'hidden';
    doubleButtonEl.style.visibility = 'hidden';
};

function showPlayButtons() {
    surrenderButtonEl.style.visibility = 'visible';
    hitButtonEl.style.visibility = 'visible';
    stayButtonEl.style.visibility = 'visible';
    doubleButtonEl.style.visibility = 'visible';
};

function hideDoubleButton() {
    doubleButtonEl.style.visibility = 'hidden';
};

function hideHitButton() {
    hitButtonEl.style.visibility = 'hidden';
};

function hideStayButton() {
    stayButtonEl.style.visibility = 'hidden';
};

function hideSurrenderButton() {
    surrenderButtonEl.style.visibility = 'hidden';
};

function showDoubleButton() {
    doubleButtonEl.style.visibility = 'visible';
};

function showHitButton() {
    hitButtonEl.style.visibility = 'visible';
};

function showStayButton() {
    stayButtonEl.style.visibility = 'visible';
};

function showSurrenderButton() {
    surrenderButtonEl.style.visibility = 'visible';
};