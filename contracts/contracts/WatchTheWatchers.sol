// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WatchTheWatchers {
    struct SurveillanceSystem {
        string id;
        string name;
        string systemType;
        string location;
        uint256 threatScore;
        address reporter;
        uint256 timestamp;
        uint256 flags;
        bool challenged;
        bool active;
    }

    // Array of all registered systems
    SurveillanceSystem[] public systems;

    // Mapping from system ID string to index in array + 1 (0 means not registered)
    mapping(string => uint256) private idToSystemIndex;

    // Tracks whether an address has flagged a specific system index
    mapping(uint256 => mapping(address => bool)) public hasFlagged;

    // Events
    event SystemRegistered(uint256 indexed index, string id, string systemType, uint256 threatScore, address indexed reporter);
    event SystemFlagged(uint256 indexed index, string id, uint256 totalFlags, address indexed flagger);
    event SystemChallenged(uint256 indexed index, string id, bool challenged);

    // Modifier to check if system exists
    modifier systemExists(string memory id) {
        require(idToSystemIndex[id] > 0, "SYSTEM DOES NOT EXIST IN ON-CHAIN REGISTRY.");
        _;
    }

    /**
     * @dev Registers a new surveillance system on the immutable ledger.
     */
    function registerSystem(
        string memory id,
        string memory name,
        string memory systemType,
        string memory location,
        uint256 threatScore
    ) public {
        require(bytes(id).length > 0, "SYSTEM ID REQ.");
        require(idToSystemIndex[id] == 0, "SYSTEM ID ALREADY REGISTERED ON-CHAIN.");
        require(threatScore <= 10, "THREAT SCORE CANNOT EXCEED 10.");

        systems.push(SurveillanceSystem({
            id: id,
            name: name,
            systemType: systemType,
            location: location,
            threatScore: threatScore,
            reporter: msg.sender,
            timestamp: block.timestamp,
            flags: 0,
            challenged: false,
            active: true
        }));

        uint256 newIndex = systems.length;
        idToSystemIndex[id] = newIndex;

        emit SystemRegistered(newIndex - 1, id, systemType, threatScore, msg.sender);
    }

    /**
     * @dev Flags a surveillance system as highly invasive or suspicious.
     * Prevents duplicate votes from the same citizen wallet.
     */
    function flagSystem(string memory id) public systemExists(id) {
        uint256 systemIndex = idToSystemIndex[id] - 1;
        require(!hasFlagged[systemIndex][msg.sender], "ALREADY FLAGGED BY THIS WALLET ACCOUNT.");

        hasFlagged[systemIndex][msg.sender] = true;
        systems[systemIndex].flags += 1;

        emit SystemFlagged(systemIndex, id, systems[systemIndex].flags, msg.sender);

        // Auto-challenge if flags exceed threshold (e.g., 5 flags)
        if (systems[systemIndex].flags >= 5 && !systems[systemIndex].challenged) {
            systems[systemIndex].challenged = true;
            emit SystemChallenged(systemIndex, id, true);
        }
    }

    /**
     * @dev Explicitly challenges the legality of a surveillance system.
     */
    function challengeSystem(string memory id) public systemExists(id) {
        uint256 systemIndex = idToSystemIndex[id] - 1;
        // Only allow challenging if there are flags or by general consensus
        require(systems[systemIndex].flags > 0 || msg.sender == systems[systemIndex].reporter, "INSUFFICIENT BASIS TO CHALLENGE.");

        systems[systemIndex].challenged = true;
        emit SystemChallenged(systemIndex, id, true);
    }

    /**
     * @dev Retreives total system count in registry.
     */
    function getSystemCount() public view returns (uint256) {
        return systems.length;
    }

    /**
     * @dev Retrieves full details of a specific system by string ID.
     */
    function getSystem(string memory id) public view systemExists(id) returns (SurveillanceSystem memory) {
        uint256 index = idToSystemIndex[id] - 1;
        return systems[index];
    }
}
