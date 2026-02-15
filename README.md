<div align="center">

# 🚀 TransactIQ

### Think EVM. Execute Injective.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Injective](https://img.shields.io/badge/Injective-Protocol-00F2FE?style=for-the-badge)](https://injective.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Intelligent EVM → Injective Compatibility Layer API</strong>
</p>

[Features](#-features) •
[Quick Start](#-quick-start) •
[API Reference](#-api-reference) •
[Examples](#-examples) •
[Architecture](#-architecture)

</div>

---

## 🎯 Problem Statement

Developers migrating from Ethereum and other EVM chains to Injective encounter structural differences:

| Challenge | Impact |
|------------|----------|
| 🔄 Message formats | EVM calldata vs Cosmos SDK messages |
| 📊 Trading model | AMM pools vs Orderbook exchange |
| 🔐 Authorization model | `approve()` vs `authz` module |
| ⏱️ Learning curve | Weeks of research and trial |

---

## 💡 What is TransactIQ?

**TransactIQ** is a deterministic translation API that converts EVM transaction patterns into Injective-compatible Cosmos SDK messages.

It enables developers to:

- Decode raw EVM calldata
- Translate ERC-20 operations into Injective messages
- Convert AMM swaps into orderbook market orders
- Analyze compatibility before migration
- Estimate migration complexity and cost savings

---

## 🧠 How It Works

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   EVM Calldata  │   ──►   │   TransactIQ    │   ──►   │    Injective    │
│   or Intent     │         │  Translation    │         │    Messages     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

TransactIQ:

1. Extracts the function selector  
2. Decodes ABI parameters  
3. Matches patterns in the selector database  
4. Maps to Injective message types  
5. Returns structured Cosmos SDK message objects  

---

## ✨ Features

### 🔄 Smart Translation
- Raw calldata decoding
- Intent-based transaction support
- Composite multi-step operations
- Deterministic message generation

### 📊 Compatibility Analysis
- Pattern recognition
- Direct / Partial / Unsupported scoring
- Confidence metrics
- Redesign recommendations

### 📈 Migration Planning
- Feature parity scoring
- Effort estimation (hours range)
- Cost comparison modeling
- Phase-by-phase migration plan

### ⚡ Developer Experience
- Clean REST architecture
- Predictable JSON responses
- Clear error handling
- Hackathon-ready deployment

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/yourusername/transactiq.git
cd transactiq
npm install
npm start
```

Server runs at:

```
http://localhost:3000
```

---

## 🔍 Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-02-03T10:30:00.000Z"
}
```

---

## 📡 API Reference

Base URL:

```
http://localhost:3000/api/v1
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /translate | Translate EVM → Injective |
| POST | /compatibility | Pattern compatibility |
| POST | /migrate/estimate | Migration complexity |

---

## 🔁 Translate Example

### Request

```json
{
  "input": {
    "type": "intent",
    "action": "transfer",
    "params": { "amount": "1000000000" }
  },
  "context": {
    "senderAddress": "inj1abc",
    "recipientAddress": "inj1xyz"
  }
}
```

### Response

```json
{
  "success": true,
  "translation": {
    "messages": [
      {
        "@type": "/cosmos.bank.v1beta1.MsgSend",
        "from_address": "inj1abc",
        "to_address": "inj1xyz",
        "amount": [{ "denom": "inj", "amount": "1000000000" }]
      }
    ],
    "explanation": "Transfer 1000000000 tokens"
  },
  "metadata": {
    "confidence": 0.98,
    "matchType": "DIRECT"
  }
}
```

---

## 🧪 Compatibility Example

```json
{
  "patterns": [
    "transfer(address,uint256)",
    "approve(address,uint256)",
    "flashLoan(address,uint256)"
  ]
}
```

Response:

```json
{
  "success": true,
  "overallCompatibility": {
    "score": 57,
    "status": "PARTIALLY_COMPATIBLE"
  }
}
```

---

## 📊 Migration Estimate Example

```json
{
  "contractAbi": [
    { "type": "function", "name": "transfer", "inputs": [{ "type": "address" }, { "type": "uint256" }] },
    { "type": "function", "name": "stake", "inputs": [{ "type": "uint256" }] }
  ]
}
```

Response includes:

- Feasibility rating
- Estimated effort (hours range)
- Feature parity percentage
- Cost comparison (~99% lower fees)

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────┐
│               API Layer                     │
│              Express Server                 │
├──────────────────────────────────────────────┤
│   /translate  /compatibility  /migrate      │
├──────────────────────────────────────────────┤
│           Translation Engine                │
│  - ABI Decoder (ethers.js)                  │
│  - Selector Database                        │
│  - Pattern Matcher                          │
│  - Cosmos Message Builders                  │
└──────────────────────────────────────────────┘
```

---

## 💰 Cost Comparison

| Metric | Ethereum | Injective |
|--------|----------|------------|
| Avg Tx Fee | $2–50 | ~$0.001 |
| Monthly (1000 tx/day) | ~$4,500 | ~$45 |
| Block Time | ~12s | ~1s |
| Finality | ~6 min | Instant |

---

## 🛣 Roadmap

- [x] ERC-20 translation
- [x] Staking support
- [x] Swap mapping
- [x] Compatibility scoring
- [x] Migration estimator
- [ ] Dynamic market resolution
- [ ] On-chain broadcast support
- [ ] SDK packages (TS / Python)
- [ ] Web dashboard

---

## 🧩 Scope

TransactIQ currently provides:

✔ Calldata decoding  
✔ Semantic mapping  
✔ Cosmos message construction  
✔ Compatibility analytics  

It does not:

✖ Broadcast transactions  
✖ Sign with private keys  
✖ Query live chain state  

It functions as an intelligent off-chain translation layer.

---

## 📄 License

MIT License

---

<div align="center">

### TransactIQ  
### Think EVM. Execute Injective.

</div>
