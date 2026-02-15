/**
 * ============================================================================
 * INJECTIVE PROTOCOL COMPATIBILITY LAYER API
 * ============================================================================
 * Hackathon-ready API for translating EVM transactions to Injective Protocol
 * 
 * Endpoints:
 *   POST /api/v1/translate          - Translate EVM calldata to Injective messages
 *   POST /api/v1/compatibility      - Check pattern compatibility
 *   POST /api/v1/migrate/estimate   - Estimate migration complexity
 *   GET  /api/v1/health             - Health check
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } }
});
app.use('/api/', limiter);

// ============================================================================
// SELECTOR DATABASE - EVM Function Signatures & Mappings
// ============================================================================

const SELECTOR_DB = {
  // ERC-20 Transfer
  '0xa9059cbb': {
    name: 'transfer',
    signature: 'transfer(address,uint256)',
    paramTypes: ['address', 'uint256'],
    paramNames: ['to', 'amount'],
    category: 'token',
    injectiveMapping: {
      msgType: '/cosmos.bank.v1beta1.MsgSend',
      confidence: 0.98,
      matchType: 'DIRECT'
    }
  },
  
  // ERC-20 Approve
  '0x095ea7b3': {
    name: 'approve',
    signature: 'approve(address,uint256)',
    paramTypes: ['address', 'uint256'],
    paramNames: ['spender', 'amount'],
    category: 'token',
    injectiveMapping: {
      msgType: '/cosmos.authz.v1beta1.MsgGrant',
      confidence: 0.85,
      matchType: 'SEMANTIC',
      notes: 'Injective uses authz module instead of per-token approvals'
    }
  },
  
  // ERC-20 TransferFrom
  '0x23b872dd': {
    name: 'transferFrom',
    signature: 'transferFrom(address,address,uint256)',
    paramTypes: ['address', 'address', 'uint256'],
    paramNames: ['from', 'to', 'amount'],
    category: 'token',
    injectiveMapping: {
      msgType: '/cosmos.bank.v1beta1.MsgSend',
      confidence: 0.80,
      matchType: 'SEMANTIC',
      notes: 'Requires authz grant check'
    }
  },

  // Uniswap V2: swapExactTokensForTokens
  '0x38ed1739': {
    name: 'swapExactTokensForTokens',
    signature: 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
    paramTypes: ['uint256', 'uint256', 'address[]', 'address', 'uint256'],
    paramNames: ['amountIn', 'amountOutMin', 'path', 'to', 'deadline'],
    category: 'swap',
    injectiveMapping: {
      msgType: '/injective.exchange.v1beta1.MsgCreateSpotMarketOrder',
      confidence: 0.90,
      matchType: 'SEMANTIC',
      notes: 'AMM swap converts to orderbook market order'
    }
  },
  
  // Uniswap V2: swapExactETHForTokens
  '0x7ff36ab5': {
    name: 'swapExactETHForTokens',
    signature: 'swapExactETHForTokens(uint256,address[],address,uint256)',
    paramTypes: ['uint256', 'address[]', 'address', 'uint256'],
    paramNames: ['amountOutMin', 'path', 'to', 'deadline'],
    category: 'swap',
    injectiveMapping: {
      msgType: 'COMPOSITE',
      steps: ['/injective.exchange.v1beta1.MsgDeposit', '/injective.exchange.v1beta1.MsgCreateSpotMarketOrder'],
      confidence: 0.85,
      matchType: 'COMPOSITE',
      notes: 'Requires deposit to subaccount first'
    }
  },

  // Add Liquidity (NOT SUPPORTED)
  '0xe8e33700': {
    name: 'addLiquidity',
    signature: 'addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)',
    paramTypes: ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'uint256'],
    paramNames: ['tokenA', 'tokenB', 'amountADesired', 'amountBDesired', 'amountAMin', 'amountBMin', 'to', 'deadline'],
    category: 'liquidity',
    injectiveMapping: {
      msgType: null,
      confidence: 0,
      matchType: 'UNSUPPORTED',
      notes: 'Injective uses orderbook, not AMM. Consider market making.'
    }
  },

  // Stake
  '0xa694fc3a': {
    name: 'stake',
    signature: 'stake(uint256)',
    paramTypes: ['uint256'],
    paramNames: ['amount'],
    category: 'staking',
    injectiveMapping: {
      msgType: '/cosmos.staking.v1beta1.MsgDelegate',
      confidence: 0.95,
      matchType: 'DIRECT'
    }
  },
  
  // Withdraw/Unstake
  '0x2e1a7d4d': {
    name: 'withdraw',
    signature: 'withdraw(uint256)',
    paramTypes: ['uint256'],
    paramNames: ['amount'],
    category: 'staking',
    injectiveMapping: {
      msgType: '/cosmos.staking.v1beta1.MsgUndelegate',
      confidence: 0.95,
      matchType: 'DIRECT'
    }
  },
  
  // Get Reward
  '0x3d18b912': {
    name: 'getReward',
    signature: 'getReward()',
    paramTypes: [],
    paramNames: [],
    category: 'staking',
    injectiveMapping: {
      msgType: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
      confidence: 0.95,
      matchType: 'DIRECT'
    }
  },

  // Flash Loan (NOT SUPPORTED)
  '0xab9c4b5d': {
    name: 'flashLoan',
    signature: 'flashLoan(address,address[],uint256[],uint256[],address,bytes,uint16)',
    paramTypes: ['address', 'address[]', 'uint256[]', 'uint256[]', 'address', 'bytes', 'uint16'],
    paramNames: ['receiverAddress', 'assets', 'amounts', 'modes', 'onBehalfOf', 'params', 'referralCode'],
    category: 'flash',
    injectiveMapping: {
      msgType: null,
      confidence: 0,
      matchType: 'UNSUPPORTED',
      notes: 'Flash loans not supported on Injective'
    }
  }
};

// ============================================================================
// MARKET & DENOM MAPPINGS
// ============================================================================

const MARKET_MAP = {
  'INJ-USDT': { marketId: '0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe' },
  'WETH-USDT': { marketId: '0xd1956e20d74eeb1febe31cd37060781ff1cb266f49e0512b446a5fafa9a16034' }
};

const DENOM_MAP = {
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': { symbol: 'USDT', denom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': { symbol: 'WETH', denom: 'peggy0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function decodeCalldata(calldata) {
  if (!calldata?.startsWith('0x') || calldata.length < 10) {
    throw new Error('Invalid calldata');
  }

  const selector = calldata.slice(0, 10).toLowerCase();
  const paramsData = '0x' + calldata.slice(10);
  const funcInfo = SELECTOR_DB[selector];

  if (!funcInfo) {
    return { selector, decoded: false, error: 'Unknown selector' };
  }

  let params = [];
  try {
    if (funcInfo.paramTypes.length > 0 && paramsData.length > 2) {
      const abiCoder = ethers.AbiCoder.defaultAbiCoder();
      const decoded = abiCoder.decode(funcInfo.paramTypes, paramsData);
      params = funcInfo.paramNames.map((name, i) => ({
        name,
        type: funcInfo.paramTypes[i],
        value: decoded[i].toString()
      }));
    }
  } catch (e) {
    return { selector, functionName: funcInfo.name, decoded: false, error: e.message };
  }

  return {
    selector,
    functionName: funcInfo.name,
    signature: funcInfo.signature,
    category: funcInfo.category,
    parameters: params,
    decoded: true
  };
}

function getSubaccountId(address) {
  return '0x' + address.replace('inj', '').padStart(40, '0') + '0'.repeat(24);
}

// ============================================================================
// MESSAGE BUILDERS
// ============================================================================

const Builders = {
  MsgSend: ({ from, to, amount, denom = 'inj' }) => ({
    '@type': '/cosmos.bank.v1beta1.MsgSend',
    from_address: from,
    to_address: to,
    amount: [{ denom, amount }]
  }),

  MsgDelegate: ({ delegator, validator, amount }) => ({
    '@type': '/cosmos.staking.v1beta1.MsgDelegate',
    delegator_address: delegator,
    validator_address: validator || 'injvaloper1xxx',
    amount: { denom: 'inj', amount }
  }),

  MsgUndelegate: ({ delegator, validator, amount }) => ({
    '@type': '/cosmos.staking.v1beta1.MsgUndelegate',
    delegator_address: delegator,
    validator_address: validator || 'injvaloper1xxx',
    amount: { denom: 'inj', amount }
  }),

  MsgWithdrawReward: ({ delegator, validator }) => ({
    '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
    delegator_address: delegator,
    validator_address: validator || 'injvaloper1xxx'
  }),

  MsgGrant: ({ granter, grantee, amount, denom = 'inj' }) => ({
    '@type': '/cosmos.authz.v1beta1.MsgGrant',
    granter,
    grantee,
    grant: {
      authorization: {
        '@type': '/cosmos.bank.v1beta1.SendAuthorization',
        spend_limit: [{ denom, amount }]
      },
      expiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  }),

  MsgSpotOrder: ({ sender, marketId, quantity, orderType = 1 }) => ({
    '@type': '/injective.exchange.v1beta1.MsgCreateSpotMarketOrder',
    sender,
    order: {
      market_id: marketId,
      order_info: {
        subaccount_id: getSubaccountId(sender),
        fee_recipient: sender,
        price: '0',
        quantity
      },
      order_type: orderType,
      trigger_price: '0'
    }
  }),

  MsgDeposit: ({ sender, amount, denom = 'inj' }) => ({
    '@type': '/injective.exchange.v1beta1.MsgDeposit',
    sender,
    subaccount_id: getSubaccountId(sender),
    amount: { denom, amount }
  })
};

// ============================================================================
// TRANSLATION ENGINE
// ============================================================================

function translate(decoded, ctx = {}) {
  const sender = ctx.senderAddress || 'inj1xxx';
  const funcInfo = SELECTOR_DB[decoded.selector];
  
  if (!funcInfo?.injectiveMapping) {
    return { success: false, error: { code: 'UNSUPPORTED', message: 'Function not supported' } };
  }

  const mapping = funcInfo.injectiveMapping;
  
  if (mapping.matchType === 'UNSUPPORTED') {
    return { success: false, error: { code: 'UNSUPPORTED_PATTERN', message: mapping.notes } };
  }

  const params = {};
  decoded.parameters?.forEach(p => params[p.name] = p.value);

  let messages = [];
  let explanation = '';

  switch (funcInfo.name) {
    case 'transfer':
      messages.push(Builders.MsgSend({
        from: sender,
        to: ctx.recipientAddress || params.to || 'inj1recipient',
        amount: params.amount,
        denom: ctx.denom
      }));
      explanation = `Transfer ${params.amount} tokens`;
      break;

    case 'approve':
      messages.push(Builders.MsgGrant({
        granter: sender,
        grantee: ctx.spenderAddress || params.spender || 'inj1spender',
        amount: params.amount,
        denom: ctx.denom
      }));
      explanation = `Grant spending authorization`;
      break;

    case 'transferFrom':
      messages.push(Builders.MsgSend({
        from: params.from || sender,
        to: params.to || ctx.recipientAddress,
        amount: params.amount,
        denom: ctx.denom
      }));
      explanation = `Transfer from authorized account`;
      break;

    case 'swapExactTokensForTokens':
      messages.push(Builders.MsgSpotOrder({
        sender,
        marketId: MARKET_MAP['INJ-USDT']?.marketId || '0x000',
        quantity: params.amountIn,
        orderType: 1
      }));
      explanation = `Swap via spot market order`;
      break;

    case 'swapExactETHForTokens':
      messages.push(Builders.MsgDeposit({ sender, amount: ctx.ethValue || '0' }));
      messages.push(Builders.MsgSpotOrder({
        sender,
        marketId: MARKET_MAP['INJ-USDT']?.marketId || '0x000',
        quantity: ctx.ethValue || '0',
        orderType: 2
      }));
      explanation = `Deposit then swap (2-step)`;
      break;

    case 'stake':
      messages.push(Builders.MsgDelegate({
        delegator: sender,
        validator: ctx.validator,
        amount: params.amount
      }));
      explanation = `Delegate ${params.amount} INJ`;
      break;

    case 'withdraw':
      messages.push(Builders.MsgUndelegate({
        delegator: sender,
        validator: ctx.validator,
        amount: params.amount
      }));
      explanation = `Undelegate ${params.amount} INJ`;
      break;

    case 'getReward':
      messages.push(Builders.MsgWithdrawReward({
        delegator: sender,
        validator: ctx.validator
      }));
      explanation = `Claim staking rewards`;
      break;

    default:
      return { success: false, error: { code: 'NO_BUILDER', message: `No builder for ${funcInfo.name}` } };
  }

  return {
    success: true,
    translation: { messages, explanation },
    metadata: {
      confidence: mapping.confidence,
      matchType: mapping.matchType,
      warnings: mapping.notes ? [{ message: mapping.notes }] : [],
      originalFunction: funcInfo.signature
    }
  };
}

// ============================================================================
// ROUTES
// ============================================================================

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Translate
app.post('/api/v1/translate', (req, res) => {
  try {
    const { input, context = {} } = req.body;

    if (!input) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_INPUT', message: 'Input required' } });
    }

    let decoded;

    if (input.type === 'calldata') {
      decoded = decodeCalldata(input.data);
      if (!decoded.decoded) {
        return res.status(400).json({ success: false, error: { code: 'DECODE_FAILED', message: decoded.error } });
      }
    } else if (input.type === 'intent') {
      const intentMap = {
        transfer: '0xa9059cbb',
        approve: '0x095ea7b3',
        swap: '0x38ed1739',
        stake: '0xa694fc3a',
        unstake: '0x2e1a7d4d',
        claim: '0x3d18b912'
      };

      const selector = intentMap[input.action];
      if (!selector) {
        return res.status(400).json({ success: false, error: { code: 'UNKNOWN_INTENT', message: `Unknown: ${input.action}` } });
      }

      const funcInfo = SELECTOR_DB[selector];
      decoded = {
        selector,
        functionName: funcInfo.name,
        signature: funcInfo.signature,
        category: funcInfo.category,
        parameters: Object.entries(input.params || {}).map(([name, value]) => ({ name, value: String(value) })),
        decoded: true
      };
    } else {
      return res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Use calldata or intent' } });
    }

    const result = translate(decoded, context);

    if (!result.success) {
      return res.status(422).json(result);
    }

    res.json({
      success: true,
      translation: result.translation,
      metadata: {
        ...result.metadata,
        gasEstimate: { injectiveGas: '100000', injFee: '0.00005 INJ', savings: '~95% cheaper' }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: err.message } });
  }
});

// Compatibility Check
app.post('/api/v1/compatibility', (req, res) => {
  try {
    const { patterns = [], contractAbi = [] } = req.body;

    let allPatterns = [...patterns];

    if (contractAbi.length) {
      contractAbi.filter(i => i.type === 'function').forEach(func => {
        const inputs = (func.inputs || []).map(i => i.type).join(',');
        allPatterns.push(`${func.name}(${inputs})`);
      });
    }

    if (!allPatterns.length) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_INPUT', message: 'Provide patterns or ABI' } });
    }

    const results = allPatterns.map(pattern => {
      let selector;
      try { selector = ethers.id(pattern).slice(0, 10); } catch { selector = null; }

      const funcInfo = selector ? SELECTOR_DB[selector] : null;

      if (!funcInfo) {
        const lower = pattern.toLowerCase();
        if (lower.includes('flash')) return { pattern, status: 'UNSUPPORTED', notes: 'Flash loans not supported' };
        if (lower.includes('liquidity')) return { pattern, status: 'UNSUPPORTED', notes: 'AMM not supported' };
        return { pattern, status: 'UNKNOWN', notes: 'Not in database' };
      }

      const m = funcInfo.injectiveMapping;
      return {
        pattern,
        status: m.matchType === 'UNSUPPORTED' ? 'UNSUPPORTED' : m.matchType === 'DIRECT' ? 'SUPPORTED' : 'PARTIAL',
        injectiveEquivalent: m.msgType,
        confidence: m.confidence,
        notes: m.notes
      };
    });

    const supported = results.filter(r => r.status === 'SUPPORTED').length;
    const partial = results.filter(r => r.status === 'PARTIAL').length;
    const unsupported = results.filter(r => r.status === 'UNSUPPORTED' || r.status === 'UNKNOWN').length;
    const score = Math.round(((supported + partial * 0.5) / results.length) * 100);

    res.json({
      success: true,
      overallCompatibility: {
        score,
        status: score >= 80 ? 'MOSTLY_COMPATIBLE' : score >= 50 ? 'PARTIALLY_COMPATIBLE' : 'INCOMPATIBLE',
        summary: `${supported}/${results.length} supported`
      },
      patterns: results,
      recommendations: [
        supported < results.length && 'Some patterns need workarounds',
        unsupported > 0 && 'Unsupported patterns require redesign'
      ].filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: err.message } });
  }
});

// Migration Estimate
app.post('/api/v1/migrate/estimate', (req, res) => {
  try {
    const { contractAbi = [] } = req.body;

    if (!contractAbi.length) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_INPUT', message: 'Provide contractAbi' } });
    }

    const functions = contractAbi.filter(i => i.type === 'function');
    let supported = 0, partial = 0, unsupported = 0;

    const details = functions.map(func => {
      const inputs = (func.inputs || []).map(i => i.type).join(',');
      const sig = `${func.name}(${inputs})`;
      let selector;
      try { selector = ethers.id(sig).slice(0, 10); } catch { selector = null; }

      const info = selector ? SELECTOR_DB[selector] : null;
      let status, path;

      if (info?.injectiveMapping.matchType === 'DIRECT') {
        supported++;
        status = 'supported';
        path = info.injectiveMapping.msgType;
      } else if (info?.injectiveMapping.matchType === 'UNSUPPORTED') {
        unsupported++;
        status = 'unsupported';
        path = 'Requires redesign';
      } else {
        partial++;
        status = 'partial';
        path = info?.injectiveMapping.msgType || 'Custom handler';
      }

      return { name: func.name, signature: sig, status, migrationPath: path };
    });

    const total = functions.length || 1;
    const complexity = (supported + partial * 2 + unsupported * 4) / total;

    let feasibility, hoursMin, hoursMax;
    if (complexity < 1.5) { feasibility = 'STRAIGHTFORWARD'; hoursMin = 8; hoursMax = 24; }
    else if (complexity < 2.5) { feasibility = 'MODERATE'; hoursMin = 24; hoursMax = 80; }
    else if (complexity < 3.5) { feasibility = 'COMPLEX'; hoursMin = 80; hoursMax = 200; }
    else { feasibility = 'REQUIRES_REDESIGN'; hoursMin = 200; hoursMax = 500; }

    const scale = Math.max(1, Math.log2(total + 1));
    hoursMin = Math.round(hoursMin * scale);
    hoursMax = Math.round(hoursMax * scale);

    res.json({
      success: true,
      summary: {
        feasibility,
        estimatedEffort: { hours: { min: hoursMin, max: hoursMax } },
        featureParity: Math.round(((supported + partial * 0.5) / total) * 100)
      },
      analysis: {
        functions: { total, supported, partial, unsupported, details }
      },
      costComparison: {
        ethereum: { monthlyEstimate: '$4,500 (30 gwei, 1000 tx/day)' },
        injective: { monthlyEstimate: '$45' },
        savings: '~99% reduction'
      },
      migrationPlan: [
        { phase: 1, name: 'Core Logic', tasks: ['Setup CosmWasm', 'Migrate state', 'Basic handlers'], hours: Math.round(hoursMin * 0.4) },
        { phase: 2, name: 'Integration', tasks: ['Exchange module', 'Queries', 'Access control'], hours: Math.round(hoursMin * 0.35) },
        { phase: 3, name: 'Testing', tasks: ['Unit tests', 'Testnet deploy', 'Mainnet'], hours: Math.round(hoursMin * 0.25) }
      ],
      blockers: [
        unsupported > 0 && { issue: 'Unsupported patterns', severity: 'HIGH', resolution: 'Redesign or remove' }
      ].filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: err.message } });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} not found` } });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║     INJECTIVE COMPATIBILITY LAYER API v1.0.0                  ║
╠═══════════════════════════════════════════════════════════════╣
║  Server running on http://localhost:${PORT}                      ║
║                                                               ║
║  Endpoints:                                                   ║
║    GET  /api/v1/health             - Health check             ║
║    POST /api/v1/translate          - EVM → Injective          ║
║    POST /api/v1/compatibility      - Check pattern support    ║
║    POST /api/v1/migrate/estimate   - Migration effort         ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;