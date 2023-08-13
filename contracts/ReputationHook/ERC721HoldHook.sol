// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "./IReputationCheckHook.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ERC721HoldHook {

    IERC721 token;
    uint256 requiredAmount;

    constructor(address _token, uint256 _requiredAmount) {
        token = IERC721(_token);
        requiredAmount = _requiredAmount;
    }

    function beforeReputationMint(address origin, bytes memory _data) external {
        require(token.balanceOf(origin) >= requiredAmount, "not enough tokens");
    }

    function afterReputationMint(address origin, bytes memory _data) external {

    }
}