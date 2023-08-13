// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

interface IReputationCheckHook {
    function beforeReputationMint(address origin, bytes memory _data) external;
    function afterReputationMint(address origin, bytes memory _data) external;
}