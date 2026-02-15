Here's a professional, hackathon-winning README:

---

```markdown
<div align="center">

# 🚀 Injective Protocol Compatibility Layer API

### Seamlessly Translate EVM Transactions to Injective Protocol

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Injective](https://img.shields.io/badge/Injective-Protocol-00F2FE?style=for-the-badge)](https://injective.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Bridge the gap between EVM and Injective ecosystems</strong>
</p>

[Features](#-features) •
[Quick Start](#-quick-start) •
[API Reference](#-api-reference) •
[Examples](#-examples) •
[Architecture](#-architecture)

</div>

---

## 🎯 Problem Statement

Developers migrating from Ethereum/EVM chains to Injective face significant challenges:

| Challenge | Impact |
|-----------|--------|
| 🔄 Different message formats | EVM calldata vs Cosmos messages |
| 📊 Different trading models | AMM pools vs Orderbook |
| 🔐 Different auth patterns | `approve()` vs `authz` module |
| ⏱️ Steep learning curve | Weeks of research required |

## 💡 Our Solution

A **Translation Layer API** that instantly converts EVM transaction patterns to their Injective equivalents:

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   EVM Calldata  │   ──►   │  Translation    │   ──►   │    Injective    │
│   or Intent     │         │     Engine      │         │    Messages     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔄 Smart Translation
- Decode raw EVM calldata
- Intent-based translation
- Multi-step transaction handling
- Automatic parameter mapping

</td>
<td width="50%">

### 📊 Compatibility Analysis
- Pattern recognition
- Support level scoring
- Workaround suggestions
- Alternative recommendations

</td>
</tr>
<tr>
<td width="50%">

### 📈 Migration Planning
- Effort estimation
- Cost comparison (99% savings!)
- Phase-by-phase roadmap
- Blocker identification

</td>
<td width="50%">

### ⚡ Developer Experience
- Simple REST API
- Detailed error messages
- Code snippet generation
- Comprehensive documentation

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/injective-compat-api.git
cd injective-compat-api

# Install dependencies
npm install

# Start the server
npm start
```

### Verify Installation

```bash
curl http://localhost:3000/api/v1/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-03T..."
}
```

---

## 📡 API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/translate` | Translate EVM → Injective |
| `POST` | `/compatibility` | Check pattern compatibility |
| `POST` | `/migrate/estimate` | Estimate migration effort |

---

### 1️⃣ Health Check

```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-03T10:30:00.000Z"
}
```

---

### 2️⃣ Translate EVM to Injective

```http
POST /api/v1/translate
Content-Type: application/json
```

#### Option A: Using Intent (Recommended)

```json
{
  "input": {
    "type": "intent",
    "action": "transfer",
    "params": {
      "amount": "1000000000000000000"
    }
  },
  "context": {
    "senderAddress": "inj1sender...",
    "recipientAddress": "inj1recipient..."
  }
}
```

#### Option B: Using Raw Calldata

```json
{
  "input": {
    "type": "calldata",
    "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f2bd730000000000000000000000000000000000000000000000000de0b6b3a7640000"
  },
  "context": {
    "senderAddress": "inj1sender..."
  }
}
```

#### Supported Actions

| Action | EVM Function | Injective Message |
|--------|--------------|-------------------|
| `transfer` | `transfer(address,uint256)` | `MsgSend` |
| `approve` | `approve(address,uint256)` | `MsgGrant` |
| `stake` | `stake(uint256)` | `MsgDelegate` |
| `unstake` | `withdraw(uint256)` | `MsgUndelegate` |
| `claim` | `getReward()` | `MsgWithdrawDelegatorReward` |
| `swap` | `swapExactTokensForTokens(...)` | `MsgCreateSpotMarketOrder` |

#### Response

```json
{
  "success": true,
  "translation": {
    "messages": [
      {
        "@type": "/cosmos.bank.v1beta1.MsgSend",
        "from_address": "inj1sender...",
        "to_address": "inj1recipient...",
        "amount": [{ "denom": "inj", "amount": "1000000000000000000" }]
      }
    ],
    "explanation": "Transfer 1000000000000000000 tokens"
  },
  "metadata": {
    "confidence": 0.98,
    "matchType": "DIRECT",
    "gasEstimate": {
      "injectiveGas": "100000",
      "injFee": "0.00005 INJ",
      "savings": "~95% cheaper"
    }
  }
}
```

---

### 3️⃣ Check Compatibility

```http
POST /api/v1/compatibility
Content-Type: application/json
```

**Request:**
```json
{
  "patterns": [
    "transfer(address,uint256)",
    "approve(address,uint256)",
    "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
    "addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)",
    "flashLoan(address,uint256)"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "overallCompatibility": {
    "score": 57,
    "status": "PARTIALLY_COMPATIBLE",
    "summary": "3/5 supported"
  },
  "patterns": [
    {
      "pattern": "transfer(address,uint256)",
      "status": "SUPPORTED",
      "injectiveEquivalent": "/cosmos.bank.v1beta1.MsgSend",
      "confidence": 0.98
    },
    {
      "pattern": "flashLoan(address,uint256)",
      "status": "UNSUPPORTED",
      "notes": "Flash loans not supported"
    }
  ],
  "recommendations": [
    "Some patterns need workarounds",
    "Unsupported patterns require redesign"
  ]
}
```

#### Status Levels

| Status | Meaning |
|--------|---------|
| ✅ `SUPPORTED` | Direct 1:1 mapping available |
| ⚠️ `PARTIAL` | Supported with modifications |
| ❌ `UNSUPPORTED` | No equivalent, requires redesign |

---

### 4️⃣ Estimate Migration

```http
POST /api/v1/migrate/estimate
Content-Type: application/json
```

**Request:**
```json
{
  "contractAbi": [
    { "type": "function", "name": "transfer", "inputs": [{"type": "address"}, {"type": "uint256"}] },
    { "type": "function", "name": "stake", "inputs": [{"type": "uint256"}] },
    { "type": "function", "name": "addLiquidity", "inputs": [{"type": "address"}, {"type": "uint256"}] }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "feasibility": "MODERATE",
    "estimatedEffort": {
      "hours": { "min": 67, "max": 225 }
    },
    "featureParity": 75
  },
  "costComparison": {
    "ethereum": { "monthlyEstimate": "$4,500 (30 gwei, 1000 tx/day)" },
    "injective": { "monthlyEstimate": "$45" },
    "savings": "~99% reduction"
  },
  "migrationPlan": [
    { "phase": 1, "name": "Core Logic", "hours": 27 },
    { "phase": 2, "name": "Integration", "hours": 23 },
    { "phase": 3, "name": "Testing", "hours": 17 }
  ],
  "blockers": []
}
```

---

## 📝 Examples

### Example 1: Translate a Token Transfer

```bash
curl -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "type": "intent",
      "action": "transfer",
      "params": { "amount": "1000000000000000000" }
    },
    "context": {
      "senderAddress": "inj1abc123",
      "recipientAddress": "inj1xyz789"
    }
  }'
```

### Example 2: Translate Staking

```bash
curl -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "type": "intent",
      "action": "stake",
      "params": { "amount": "5000000000000000000" }
    },
    "context": {
      "senderAddress": "inj1abc123",
      "validator": "injvaloper1xyz"
    }
  }'
```

### Example 3: Decode Raw EVM Calldata

```bash
curl -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "type": "calldata",
      "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f2bd730000000000000000000000000000000000000000000000000de0b6b3a7640000"
    },
    "context": {
      "senderAddress": "inj1abc123"
    }
  }'
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         API LAYER                                 │
│                    Express.js + Middleware                        │
├──────────────────────────────────────────────────────────────────┤
│    /translate      │   /compatibility    │   /migrate/estimate   │
├──────────────────────────────────────────────────────────────────┤
│                     TRANSLATION ENGINE                            │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐    │
│  │   Decoder    │  │    Pattern    │  │  Message Builder   │    │
│  │  (ethers.js) │  │    Matcher    │  │  (Injective msgs)  │    │
│  └──────────────┘  └───────────────┘  └────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│                    SELECTOR DATABASE                              │
│         Function signatures, mappings, confidence scores          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Supported Translations

| EVM Function | Injective Equivalent | Confidence | Status |
|--------------|---------------------|------------|--------|
| `transfer(address,uint256)` | `MsgSend` | 98% | ✅ Direct |
| `approve(address,uint256)` | `MsgGrant` | 85% | ⚠️ Semantic |
| `transferFrom(address,address,uint256)` | `MsgSend` + authz | 80% | ⚠️ Semantic |
| `swapExactTokensForTokens(...)` | `MsgCreateSpotMarketOrder` | 90% | ⚠️ Semantic |
| `swapExactETHForTokens(...)` | `MsgDeposit` + `MsgCreateSpotMarketOrder` | 85% | 🔄 Composite |
| `stake(uint256)` | `MsgDelegate` | 95% | ✅ Direct |
| `withdraw(uint256)` | `MsgUndelegate` | 95% | ✅ Direct |
| `getReward()` | `MsgWithdrawDelegatorReward` | 95% | ✅ Direct |
| `addLiquidity(...)` | ❌ | 0% | ❌ Unsupported |
| `flashLoan(...)` | ❌ | 0% | ❌ Unsupported |

---

## 💰 Cost Comparison

| Metric | Ethereum | Injective | Savings |
|--------|----------|-----------|---------|
| Avg Transaction Fee | $2-50 | $0.001 | ~99% |
| Monthly (1000 tx/day) | $4,500 | $45 | 99% |
| Block Time | ~12s | ~1s | 12x faster |
| Finality | ~6 min | Instant | ∞ |

---

## 🛣️ Roadmap

- [x] Core translation engine
- [x] ERC-20 operations support
- [x] Staking operations support
- [x] Swap operations support
- [x] Compatibility checker
- [x] Migration estimator
- [ ] Uniswap V3 support
- [ ] Aave/Compound patterns
- [ ] Web UI dashboard
- [ ] SDK packages (TypeScript, Python)
- [ ] Real-time market ID resolution

---

## 🤝 Contributing

Contributions are welcome! Areas we need help:

- Adding more function selectors
- Testing with real contracts
- SDK development
- Documentation improvements

```bash
# Fork the repo
# Create your feature branch
git checkout -b feature/amazing-feature

# Commit your changes
git commit -m 'Add amazing feature'

# Push to the branch
git push origin feature/amazing-feature

# Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Injective Protocol](https://injective.com/) - For building the future of DeFi
- [ethers.js](https://docs.ethers.org/) - For EVM calldata decoding
- Hackathon organizers and mentors

---

<div align="center">

**Built with ❤️ for the Injective Ecosystem**

[⬆ Back to Top](#-injective-protocol-compatibility-layer-api)

</div>
```

---



# TransactIQ
