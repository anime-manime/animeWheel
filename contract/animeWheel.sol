// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract BetGame {
    address public owner;
    address public betToken;
    uint256 public feePercent = 10;
    uint256 public durationInSecond;
    uint256 public currentBetId = 0;

    bool public isNativeTokenBet;

    struct Bet {
        address[] players;
        mapping(address => uint256) playerBets;
        uint256 totalPool;
        uint256 betStartTime;
        uint256 betEndTime;
        address tokenAddress;
        bool winnerDeclared;
        address winner;
    }

    Bet[] public bets;
    bytes32 private salt;

    event BetPlaced(
        uint256 indexed betId,
        address indexed player,
        uint256 amount
    );
    event WinnerDeclared(
        uint256 indexed betId,
        address indexed winner,
        uint256 prize
    );
    event BetEndedWithoutAttendance(uint256 indexed betId);
    event BetCreated(uint256 indexed betId, uint256 betStartTime);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(bool isNativeToken, uint256 _durationInSecond) {
        durationInSecond = _durationInSecond;
        isNativeTokenBet = isNativeToken;
        owner = msg.sender;
        Bet storage newBet = bets.push();
        newBet.betStartTime = block.timestamp;
        newBet.betEndTime = block.timestamp + durationInSecond;
        newBet.tokenAddress = betToken;
        emit BetCreated((bets.length - 1), block.timestamp);
    }

    function setBetTokenAddress(address _betToken) public onlyOwner {
        betToken = _betToken;
    }

    function setBetDuration(uint256 _durationInSecond) public onlyOwner {
        durationInSecond = _durationInSecond;
    }

    function setFeePercent(uint256 _feePercent) public onlyOwner {
        require(_feePercent >= 0, "Fee percent must be greater than zero");
        feePercent = _feePercent;
    }

    function placeBet(uint256 _amount) public payable {
        Bet storage bet = bets[currentBetId];
        require(!bet.winnerDeclared, "Winner already declared");
        if (block.timestamp >= bet.betEndTime) {
            endBetAndPickWinner();
            _placeBet(currentBetId, _amount);
        } else {
            _placeBet(currentBetId, _amount);
        }
    }

    function _placeBet(uint256 betId, uint256 _amount) internal {
        Bet storage bet = bets[betId];
        uint256 previousBet = bet.playerBets[msg.sender];
        if (isNativeTokenBet) {
            require(msg.value > 0, "No native token sent");
            bet.playerBets[msg.sender] = previousBet + msg.value;
            bet.totalPool += msg.value;
        } else {
            require(_amount > 0, "Bet amount must be greater than zero");
            require(
                IERC20(bet.tokenAddress).transferFrom(
                    msg.sender,
                    address(this),
                    _amount
                ),
                "ERC20 transfer failed"
            );
            bet.playerBets[msg.sender] = previousBet + _amount;
            bet.totalPool += _amount;
        }

        // İlk defa bahis yapanı listeye ekle
        if (previousBet == 0) {
            bet.players.push(msg.sender);
        }

        updateSalt(betId);
        emit BetPlaced(
            betId,
            msg.sender,
            isNativeTokenBet ? msg.value : _amount
        );
    }

    function endBetAndPickWinner() public returns(address ){
        Bet storage bet = bets[currentBetId];
        if (bet.players.length == 0) {
            bet.winnerDeclared = true;
            emit BetEndedWithoutAttendance(currentBetId);

            Bet storage newBet = bets.push();
            newBet.betStartTime = block.timestamp;
            newBet.betEndTime = block.timestamp + durationInSecond;
            newBet.tokenAddress = betToken;
            emit BetCreated((bets.length - 1), block.timestamp);
            currentBetId = currentBetId + 1;
        } else {
            require(
                block.timestamp >= bet.betEndTime,
                "Betting period is not over yet"
            );
            require(!bet.winnerDeclared, "Winner already declared");

            uint256 fee = (bet.totalPool * feePercent) / 100;
            uint256 prize = bet.totalPool - fee;

            bytes memory weightedString = generateWeightedString(currentBetId);
            uint256 randomIndex = enhancedRandom(currentBetId) % weightedString.length;
            address winner = bet.players[
                getPlayerIndexFromChar(
                    weightedString[randomIndex],
                    bet
                )
            ];

            if (isNativeTokenBet) {
                payable(winner).transfer(prize);
                payable(owner).transfer(fee);
            } else {
                require(
                    IERC20(bet.tokenAddress).transfer(winner, prize),
                    "Prize transfer failed"
                );
                require(
                    IERC20(bet.tokenAddress).transfer(owner, fee),
                    "Fee transfer failed"
                );
            }

            bet.winnerDeclared = true;
            bet.winner = winner;
            emit WinnerDeclared(currentBetId, winner, prize);

            Bet storage newBet = bets.push();
            newBet.betStartTime = block.timestamp;
            newBet.betEndTime = block.timestamp + durationInSecond;
            newBet.tokenAddress = betToken;
            emit BetCreated((bets.length - 1), block.timestamp);
            currentBetId = currentBetId + 1;
            return winner;
        }
    }

    function generateWeightedString(uint256 betId)
        internal
        view
        returns (bytes memory)
    {
        Bet storage bet = bets[betId];
        bytes memory weightedString;
        for (uint256 i = 0; i < bet.players.length; i++) {
            uint256 weight = (bet.playerBets[bet.players[i]] * 100) /
                bet.totalPool;
            for (uint256 j = 0; j < weight; j++) {
                weightedString = abi.encodePacked(
                    weightedString,
                    bytes1(uint8(i + 97))
                );
            }
        }
        return weightedString;
    }

    function getPlayerIndexFromChar(bytes1 char, Bet storage bet)
        private
        view
        returns (uint256)
    {
        uint256 index = uint8(char) - 97;
        require(
            index < bet.players.length,
            "Invalid character mapping to player index"
        );
        return index;
    }

    function getPlayerBet(uint256 betId, address player)
        public
        view
        returns (uint256 betOfPlayer)
    {
        Bet storage bet = bets[betId];
        betOfPlayer = bet.playerBets[player];
    }

    function getPlayers(uint256 betId)
        public
        view
        returns (address[] memory players)
    {
        Bet storage bet = bets[betId];
        players = bet.players;
    }

    function enhancedRandom(uint256 betId) internal view returns (uint256) {
        Bet storage bet = bets[betId];
        bytes32 hashInput = keccak256(
            abi.encodePacked(
                salt,
                block.timestamp,
                block.number,
                bet.totalPool
            )
        );
        uint256 randomValue = uint256(hashInput);
        for (uint256 i = 0; i < bet.players.length; i++) {
            randomValue ^= uint256(
                keccak256(
                    abi.encodePacked(
                        bet.players[i],
                        bet.playerBets[bet.players[i]]
                    )
                )
            );
        }
        return randomValue;
    }

    function updateSalt(uint256 betId) private {
        Bet storage bet = bets[betId];
        bytes32 newSalt = keccak256(abi.encodePacked(salt));
        for (uint256 i = 0; i < bet.players.length; i++) {
            newSalt ^= keccak256(abi.encodePacked(bet.players[i]));
        }
        salt = newSalt;
    }

    function withdrawERC20(address token, uint256 amount) public onlyOwner {
        require(IERC20(token).transfer(owner, amount), "Withdraw failed");
    }

    function withdrawNative(uint256 amount) public onlyOwner {
        payable(owner).transfer(amount);
    }
}
