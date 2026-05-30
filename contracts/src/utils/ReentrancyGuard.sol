// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReentrancyGuard — minimal, dependency-free reentrancy lock.
/// @notice Equivalent to OpenZeppelin's guard; inlined to keep the scaffold
///         free of external lib installs.
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "reentrant");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
