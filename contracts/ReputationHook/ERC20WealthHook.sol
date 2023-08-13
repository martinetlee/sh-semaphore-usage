// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "./IReputationCheckHook.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ERC20WealthHook {

    IERC20 token;
    uint256 requiredAmount;

    constructor(address _token, uint256 _requiredAmount) {
        token = IERC20(_token);
        requiredAmount = _requiredAmount;
    }

    function beforeReputationMint(address origin, bytes memory _data) external {
        require(token.balanceOf(origin) >= requiredAmount, "not enough tokens");
    }

    function afterReputationMint(address origin, bytes memory _data) external {

    }
}