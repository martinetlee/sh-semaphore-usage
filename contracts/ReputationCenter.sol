// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "hardhat/console.sol";

import "./ReputationHook/IReputationCheckHook.sol";

contract ReputationCenter is Ownable, ERC1155 {

    ISemaphore public semaphore;

    // groupId to hook address
    mapping (uint256 => address) public hooks;

    constructor(address semaphoreAddress, string memory _uri) Ownable() ERC1155(_uri) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    function createReputationGroup(uint256 _groupId, address reputationCheckHook) external {
        // 2^20 tree depth
        semaphore.createGroup(_groupId, 20, address(this));
        hooks[_groupId] = reputationCheckHook;
    }


    function joinReputationGroup(uint256 _groupId, uint256 identityCommitment, bytes memory _data) external {
        address hook = hooks[_groupId];
        if(hook != address(0)){
            IReputationCheckHook(hook).beforeReputationMint(msg.sender, _data);
        }
        semaphore.addMember(_groupId, identityCommitment);
        if(hook != address(0)){
            IReputationCheckHook(hook).afterReputationMint(msg.sender, _data);
        }
    }

    function exportReputation(
        uint256 _groupId,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        semaphore.verifyProof(
            _groupId, 
            merkleTreeRoot, 
            _groupId, // signal
            nullifierHash, 
            _groupId, // external Nullifier
            proof
        );

        _mint(msg.sender, _groupId, 1, "");
    }

}
