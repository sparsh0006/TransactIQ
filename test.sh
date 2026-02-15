#!/bin/bash

echo "=== Health Check ==="
curl -s http://localhost:3000/api/v1/health

echo -e "\n\n=== Translate Transfer ==="
curl -s -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d "{\"input\": {\"type\": \"intent\", \"action\": \"transfer\", \"params\": {\"amount\": \"1000000000\"}}, \"context\": {\"senderAddress\": \"inj1abc\", \"recipientAddress\": \"inj1xyz\"}}"

echo -e "\n\n=== Translate Stake ==="
curl -s -X POST http://localhost:3000/api/v1/translate \
  -H "Content-Type: application/json" \
  -d "{\"input\": {\"type\": \"intent\", \"action\": \"stake\", \"params\": {\"amount\": \"5000000000\"}}, \"context\": {\"senderAddress\": \"inj1abc\", \"validator\": \"injvaloper1xyz\"}}"

echo -e "\n\n=== Compatibility Check ==="
curl -s -X POST http://localhost:3000/api/v1/compatibility \
  -H "Content-Type: application/json" \
  -d "{\"patterns\": [\"transfer(address,uint256)\", \"approve(address,uint256)\", \"flashLoan(address,uint256)\"]}"

echo -e "\n\n=== Migration Estimate ==="
curl -s -X POST http://localhost:3000/api/v1/migrate/estimate \
  -H "Content-Type: application/json" \
  -d "{\"contractAbi\": [{\"type\": \"function\", \"name\": \"transfer\", \"inputs\": [{\"type\": \"address\"}, {\"type\": \"uint256\"}]}, {\"type\": \"function\", \"name\": \"stake\", \"inputs\": [{\"type\": \"uint256\"}]}]}"

echo -e "\n\n=== Done ==="