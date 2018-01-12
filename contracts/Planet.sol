pragma solidity ^0.4.17;


contract ERC721 {
    // Required methods
    function totalSupply() public view returns (uint256 total);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function ownerOf(uint256 _tokenId) external view returns (address owner);
    function approve(address _to, uint256 _tokenId) external;
    function transfer(address _to, uint256 _tokenId) external;
    function transferFrom(address _from, address _to, uint256 _tokenId) external;

    // Events
    event Transfer(address from, address to, uint256 tokenId);
    event Approval(address owner, address approved, uint256 tokenId);

    // Optional
    // function name() public view returns (string name);
    // function symbol() public view returns (string symbol);
    // function tokensOfOwner(address _owner) external view returns (uint256[] tokenIds);

    // ERC-165 Compatibility (https://github.com/ethereum/EIPs/issues/165)
    function supportsInterface(bytes4 _interfaceID) external view returns (bool);
}


/**
 * @title PlanetAccessControl
 * Provides boss control, contract pause and unpause
 */

contract PlanetAccessControl {
	address public bossAddress;

	bool public paused = false;

	event ContractUpgrade(address newContract);

	modifier onlyBoss() {
		require(msg.sender == bossAddress);
		_;
	}

	function setBoss(address _newBoss) external onlyBoss {
		require(_newBoss != address(0));
		bossAddress = _newBoss;
	}

	modifier whenNotPaused() {
		require(!paused);
		_;
	}

	modifier whenPaused() {
		require(paused);
		_;
	}

	function pause() external onlyBoss whenNotPaused {
		paused = true;
	}

	function unpause() public onlyBoss whenPaused {
		paused = false;
	}
}


/**
 * @title PlanetBase
 * Base strcut of Planet, waitting to add more
 */

contract PlanetBase is PlanetAccessControl {
	event Discover(address owner, uint256 planetId);
	event Transfer(address from, address to, uint256 tokenId);

	struct Planet {
		uint64 discoverTime;
        string location;
	}

	SaleClockAuction public saleAuction;

	Planet[] planets;
	mapping (uint256 => address) public planetIndexToOwner;
	mapping (address => uint256) public ownershipPlanetCount;
	mapping (uint256 => address) public planetIndexToApproved;

	function _transfer(address _from, address _to, uint256 _tokenId) internal {
		++ownershipPlanetCount[_to];
		planetIndexToOwner[_tokenId] = _to;
		if (_from != address(0)) {
			--ownershipPlanetCount[_from];
			delete planetIndexToApproved[_tokenId];
		}

		Transfer(_from, _to, _tokenId);
	}

	function _discoverPlanet(address _owner, string _location) internal returns(uint256) {
		Planet memory _planet = Planet({
            discoverTime: uint64(now),
            location: _location
        });
		uint256 newPlanetId = planets.push(_planet) - 1;

		Discover(_owner, newPlanetId);
		_transfer(0, _owner, newPlanetId);

		return newPlanetId;
	}
}


/**
 * @title PlanetOwnership
 * Manage planet ownership
 */

contract PlanetOwnership is PlanetBase, ERC721 {
	string public constant name = "CryptoPlanet";
	string public constant symbol = "CP";

	bytes4 constant InterfaceSignature_ERC165 =
        bytes4(keccak256('supportsInterface(bytes4)'));

    bytes4 constant InterfaceSignature_ERC721 =
        bytes4(keccak256('name()')) ^
        bytes4(keccak256('symbol()')) ^
        bytes4(keccak256('totalSupply()')) ^
        bytes4(keccak256('balanceOf(address)')) ^
        bytes4(keccak256('ownerOf(uint256)')) ^
        bytes4(keccak256('approve(address,uint256)')) ^
        bytes4(keccak256('transfer(address,uint256)')) ^
        bytes4(keccak256('transferFrom(address,address,uint256)')) ^
        bytes4(keccak256('tokensOfOwner(address)'));

    function supportsInterface(bytes4 _interfaceID) external view returns (bool) {
        return ((_interfaceID == InterfaceSignature_ERC165) || (_interfaceID == InterfaceSignature_ERC721));
    }

	function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
		return planetIndexToOwner[_tokenId] == _claimant;
	}

	function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
		return planetIndexToApproved[_tokenId] == _claimant;
	}

	function _approve(uint256 _tokenId, address _approved) internal {
		planetIndexToApproved[_tokenId] = _approved;
	}

	function balanceOf(address _owner) public view returns (uint256) {
		return ownershipPlanetCount[_owner];
	}

	function transfer(address _to, uint256 _tokenId) external whenNotPaused {
		require(_to != address(0));
		require(_to != address(this));
		require(_to != address(saleAuction));
		require(_owns(msg.sender, _tokenId));

		_transfer(msg.sender, _to, _tokenId);
	}

	function approve(address _to, uint256 _tokenId) external whenNotPaused {
		require(_owns(msg.sender, _tokenId));
		_approve(_tokenId, _to);
		Approval(msg.sender, _to, _tokenId);
	}

	function transferFrom(address _from, address _to, uint256 _tokenId) external whenNotPaused {
		require(_to != address(0));
		require(_to != address(this));
		require(_approvedFor(msg.sender, _tokenId));
		require(_owns(_from, _tokenId));

		_transfer(_from, _to, _tokenId);
	}

	function totalSupply() public view returns (uint256) {
		return planets.length - 1;
	}

	function ownerOf(uint256 _tokenId) external view returns (address owner) {
		owner = planetIndexToOwner[_tokenId];
		require(owner != address(0));
	}

	function tokensOfOwner(address _owner) external view returns (uint256[]) {
		uint256 cnt = balanceOf(_owner);
		if (cnt == 0) {
			return new uint256[](0);
		} else {
			uint256[] memory result = new uint256[](cnt);
			uint256 totalPlanets = totalSupply();
			uint256 resultIdx = 0;
			uint256 pId;
			for (pId = 1; pId <= totalPlanets; ++pId) {
				if (planetIndexToOwner[pId] == _owner) {
					result[resultIdx] = pId;
					++resultIdx;
				}
			}

			return result;
		}
	}
}


/**
 * @title ClockAuctionBase
 * Base contract of clock auction
 */

contract ClockAuctionBase {
	struct Auction {
		address seller;
		uint128 startingPrice;
		uint128 endingPrice;
		uint64 duration;
		uint64 startedAt;
	}

	ERC721 public nonFungibleContract;
	uint256 public ownerCut;
	mapping (uint256 => Auction) tokenIdToAuction;

	event AuctionCreated(uint256 tokenId, uint256 startingPrice, uint256 endingPrice, uint256 duration);
    event AuctionSuccessful(uint256 tokenId, uint256 totalPrice, address winner);
    event AuctionCancelled(uint256 tokenId);

    function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
    	return nonFungibleContract.ownerOf(_tokenId) == _claimant;
    }

    function _escrow(address _owner, uint256 _tokenId) internal {
    	nonFungibleContract.transferFrom(_owner, this, _tokenId);
    }

    function _transfer(address _receiver, uint256 _tokenId) internal {
    	nonFungibleContract.transfer(_receiver, _tokenId);
    }

    function _addAuction(uint256 _tokenId, Auction _auction) internal {
    	require(_auction.duration >= 1 minutes);
    	tokenIdToAuction[_tokenId] = _auction;
    	AuctionCreated(
            uint256(_tokenId),
            uint256(_auction.startingPrice),
            uint256(_auction.endingPrice),
            uint256(_auction.duration)
        );
    }

    function _removeAuction(uint256 _tokenId) internal {
    	delete tokenIdToAuction[_tokenId];
    }

    function _cancelAuction(uint256 _tokenId, address _seller) internal {
    	_removeAuction(_tokenId);
    	_transfer(_seller, _tokenId);
    	AuctionCancelled(_tokenId);
    }

    function _isOnAuction(Auction storage _auction) internal view returns (bool) {
    	return _auction.startedAt > 0;
    }

    function _computeCurrentPrice(
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration,
        uint256 _secondsPassed
    ) internal pure returns (uint256) {
    	if (_secondsPassed >= _duration) {
    		return _endingPrice;
    	} else {
    		int256 totalPriceChange = int256(_endingPrice) - int256(_startingPrice);
            int256 currentPriceChange = totalPriceChange * int256(_secondsPassed) / int256(_duration);
            int256 currentPrice = int256(_startingPrice) + currentPriceChange;

            return uint256(currentPrice);
    	}
    }

    function _computeCut(uint256 _price) internal view returns (uint256) {
    	return _price * ownerCut / 10000;
    }

    function _currentPrice(Auction storage _auction) internal view returns (uint256) {
    	uint256 secondsPassed = 0;
    	if (secondsPassed > _auction.startedAt) {
    		secondsPassed = now - _auction.startedAt;
    	}

    	return _computeCurrentPrice(
    		_auction.startingPrice,
    		_auction.endingPrice,
    		_auction.duration,
    		secondsPassed
    	);
    }

    function _bid(uint256 _tokenId, uint256 _bidAmount) internal returns (uint256) {
    	Auction storage auction = tokenIdToAuction[_tokenId];
    	require(_isOnAuction(auction));
    	uint256 price = _currentPrice(auction);
    	require(_bidAmount >= price);

    	address seller = auction.seller;
    	_removeAuction(_tokenId);

    	if (price > 0) {
    		uint256 auctioneerCut = _computeCut(price);
    		uint256 sellerProceeds = price - auctioneerCut;
    		seller.transfer(sellerProceeds);
    	}

    	uint256 bidExcess = _bidAmount - price;
    	msg.sender.transfer(bidExcess);

    	AuctionSuccessful(_tokenId, price, msg.sender);

    	return price;
    }
}


/**
 * @title Ownable
 * Provides basic authorization control
 */

contract Ownable {
	address public owner;

	function Ownable() {
		owner = msg.sender;
	}

	modifier onlyOwner() {
		require(msg.sender == owner);
		_;
	}

	function transferOwnership(address newOwner) onlyOwner {
		if (newOwner != address(0)) owner = newOwner;
	}
}


/**
 * @title Pausable
 * Base contract which allows children to implement an emergency stop mechanism.
 */

contract Pausable is Ownable {
  event Pause();
  event Unpause();

  bool public paused = false;

  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  modifier whenPaused {
    require(paused);
    _;
  }

  function pause() onlyOwner whenNotPaused returns (bool) {
    paused = true;
    Pause();
    return true;
  }

  function unpause() onlyOwner whenPaused returns (bool) {
    paused = false;
    Unpause();
    return true;
  }
}


/**
 * @title ClockAuction
 * Base contract manage auction behavior.
 */

contract ClockAuction is Pausable, ClockAuctionBase {
    bytes4 constant InterfaceSignature_ERC721 = bytes4(0x9f40b779);

    function ClockAuction(address _nftAddress, uint256 _cut) public {
        require(_cut <= 10000);
        ownerCut = _cut;

        ERC721 candidateContract = ERC721(_nftAddress);
        require(candidateContract.supportsInterface(InterfaceSignature_ERC721));
        nonFungibleContract = candidateContract;
    }

    function withdrawBalance() external {
        address nftAddress = address(nonFungibleContract);
        require(msg.sender == owner || msg.sender == nftAddress);
        bool res = nftAddress.send(this.balance);
    }

    function createAuction(
        uint256 _tokenId,
        uint256 _startingPrice,
        uint256 _endingPrice,
        uint256 _duration,
        address _seller
    ) external whenNotPaused {
        require(_startingPrice == uint256(uint128(_startingPrice)));
        require(_endingPrice == uint256(uint128(_endingPrice)));
        require(_duration == uint256(uint64(_duration)));
        require(_owns(msg.sender, _tokenId));

        _escrow(msg.sender, _tokenId);
        Auction memory auction = Auction(
            _seller,
            uint128(_startingPrice),
            uint128(_endingPrice),
            uint64(_duration),
            uint64(now)
        );
        _addAuction(_tokenId, auction);
    }

    function bid(uint256 _tokenId) external payable whenNotPaused {
        _bid(_tokenId, msg.value);
        _transfer(msg.sender, _tokenId);
    }

    function cancelAuction(uint256 _tokenId) external {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        address seller = auction.seller;
        require(msg.sender == seller);
        _cancelAuction(_tokenId, seller);
    }

    function cancelAuctionWhenPaused(uint256 _tokenId) whenPaused onlyOwner external {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        _cancelAuction(_tokenId, auction.seller);
    }

    function getAuction(uint256 _tokenId) external view returns (
        address seller,
        uint256 startingPrice,
        uint256 endingPrice,
        uint256 duration,
        uint256 startedAt
    ) {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        return (
            auction.seller,
            auction.startingPrice,
            auction.endingPrice,
            auction.duration,
            auction.startedAt
        );
    }

    function getCurrentPrice(uint256 _tokenId) external view returns (uint256) {
        Auction storage auction = tokenIdToAuction[_tokenId];
        require(_isOnAuction(auction));
        return _currentPrice(auction);
    }

}


/**
 * @title SaleClockAuction
 * Contract provides planet sale.
 */

contract SaleClockAuction is ClockAuction {
	bool public isSaleClockAuction = true;
	uint256 public saleCount = 0;
	uint256[5] public lastSalePrices;

	function SaleClockAuction(address _nftAddress, uint256 _cut) public ClockAuction(_nftAddress, _cut) {}

	function createAuction(
		uint256 _tokenId,
		uint256 _startingPrice,
		uint256 _endingPrice,
		uint256 _duration,
		address _seller
	) external {
		require(_startingPrice == uint256(uint128(_startingPrice)));
		require(_endingPrice == uint256(uint128(_endingPrice)));
		require(_duration == uint256(uint64(_duration)));
		require(msg.sender == address(nonFungibleContract));

		_escrow(_seller, _tokenId);
		Auction memory auction = Auction(
			_seller,
			uint128(_startingPrice),
			uint128(_endingPrice),
			uint64(_duration),
			uint64(now)
		);
		_addAuction(_tokenId, auction);
	}

	function bid(uint256 _tokenId) external payable {
		address seller = tokenIdToAuction[_tokenId].seller;
		uint256 price = _bid(_tokenId, msg.value);
		_transfer(msg.sender, _tokenId);
		if (seller == address(nonFungibleContract)) {
			lastSalePrices[saleCount % 5] = price;
			++saleCount;
		}
	}

	function averageSalePrice() external view returns (uint256) {
		uint256 sum = 0;
		for (uint256 i = 0; i < 5; ++i) {
			sum += lastSalePrices[i];
		}
		return sum / 5;
	}
}


/**
 * @title PlanetAuction
 * Wrapper contract for planet sale.
 */

contract PlanetAuction is PlanetOwnership {
	function setSaleAuctionAddress(address _address) external onlyBoss {
		SaleClockAuction candidateContract = SaleClockAuction(_address);
		require(candidateContract.isSaleClockAuction());
		saleAuction = candidateContract;
	}

	function createSaleAuction(
		uint256 _planetId,
		uint256 _startingPrice,
		uint256 _endingPrice,
		uint256 _duration
	) external whenNotPaused {
		require(_owns(msg.sender, _planetId));
		_approve(_planetId, saleAuction);
		saleAuction.createAuction(
			_planetId,
			_startingPrice,
			_endingPrice,
			_duration,
			msg.sender
		);
	}

	function withdrawAuctionBalance() external onlyBoss {
		saleAuction.withdrawBalance();
	}
}


/**
 * @title PlanetMinting
 * Discover planet and sale.
 */

contract PlanetMinting is PlanetAuction {
	uint256 public constant STARTING_PRICE = 10 finney;
    uint256 public constant AUCTION_DURATION = 1 days;
    uint256 public discoverCount = 0;

    function _computeNextPrice() internal view returns (uint256) {
    	uint256 avgPrice = saleAuction.averageSalePrice();
    	require(avgPrice == uint256(uint128(avgPrice)));
    	uint256 nextPrice = avgPrice + (avgPrice / 2);
    	if (nextPrice < STARTING_PRICE) {
    		nextPrice = STARTING_PRICE;
    	}
    	return nextPrice;
    }

    function discoverPlanetAndAuction(string _location) external onlyBoss {
    	uint256 planetId = _discoverPlanet(address(this), _location);
    	_approve(planetId, saleAuction);
    	saleAuction.createAuction(
    		planetId,
    		_computeNextPrice(),
    		0,
    		AUCTION_DURATION,
    		address(this)
    	);
    	++discoverCount;
    }
}


/**
 * @title PlanetCore
 * Core contract of planet, use other contracts' method.
 */

contract PlanetCore is PlanetMinting {
	address public newContractAddress;

	function PlanetCore() public {
		paused = true;
		bossAddress = msg.sender;
        _discoverPlanet(address(0), 'fake planet');
	}

	function setNewAddress(address _v2Address) external onlyBoss whenPaused {
		newContractAddress = _v2Address;
		ContractUpgrade(_v2Address);
	}

	function getPlanet(uint256 _id) external view returns (
        uint256 discoverTime,
        string location
    ) {
		Planet storage planet = planets[_id];
		discoverTime = planet.discoverTime;
        location = planet.location;
	}

	function unpause() public onlyBoss whenPaused {
        require(saleAuction != address(0));
        require(newContractAddress == address(0));

        super.unpause();
    }

    function withdrawBalance() external onlyBoss {
    	bossAddress.send(this.balance);
    }

    function() external payable {
    	require(msg.sender == address(saleAuction));
    }
}
