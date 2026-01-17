#!/bin/bash
# Smoke Test Script for Operation Envelopes
# Run this after starting the server to verify all endpoints

set -e

BASE_URL="http://localhost:3001"
PASS="\033[0;32m✓\033[0m"
FAIL="\033[0;31m✗\033[0m"

echo "=================================================="
echo "Operation Envelopes - Smoke Test Suite"
echo "=================================================="
echo ""

# Check if server is running
echo -n "Checking server health... "
if curl -s -f "${BASE_URL}/api/health" > /dev/null 2>&1; then
    echo -e "$PASS Server is running"
else
    echo -e "$FAIL Server is not running"
    echo "Start server with: cd server && node index.js"
    exit 1
fi

echo ""
echo "Testing Catalog Endpoints"
echo "----------------------------------------"

# Test 1: GET /api/catalog
echo -n "1. GET /api/catalog ... "
RESPONSE=$(curl -s "${BASE_URL}/api/catalog")
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "catalog_load"' > /dev/null 2>&1; then
    CATALOG_VERSION=$(echo "$RESPONSE" | jq -r '.data.details.version')
    CAPABILITY_COUNT=$(echo "$RESPONSE" | jq -r '.metadata.capabilityCount')
    TOOL_COUNT=$(echo "$RESPONSE" | jq -r '.metadata.toolCount')
    echo -e "$PASS (v${CATALOG_VERSION}, ${CAPABILITY_COUNT} capabilities, ${TOOL_COUNT} tools)"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 2: GET /api/catalog/capabilities
echo -n "2. GET /api/catalog/capabilities ... "
RESPONSE=$(curl -s "${BASE_URL}/api/catalog/capabilities")
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "capabilities_list"' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq -r '.metadata.count')
    echo -e "$PASS (${COUNT} capabilities)"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 3: GET /api/catalog/tools
echo -n "3. GET /api/catalog/tools ... "
RESPONSE=$(curl -s "${BASE_URL}/api/catalog/tools")
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "tools_list"' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq -r '.metadata.count')
    echo -e "$PASS (${COUNT} tools)"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 4: GET /api/catalog/policies
echo -n "4. GET /api/catalog/policies ... "
RESPONSE=$(curl -s "${BASE_URL}/api/catalog/policies")
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "policies_list"' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq -r '.metadata.ruleCount')
    echo -e "$PASS (${COUNT} policy rules)"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

echo ""
echo "Testing Tools Inspection Endpoints"
echo "----------------------------------------"

# Test 5: POST /api/tools/inspect (single tool)
echo -n "5. POST /api/tools/inspect (single tool) ... "
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/tools/inspect" \
    -H "Content-Type: application/json" \
    -d '{"tools": ["adb"]}')
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "detect_android_adb"' > /dev/null 2>&1; then
    AVAILABLE=$(echo "$RESPONSE" | jq -r '.data.available')
    echo -e "$PASS (ADB available: ${AVAILABLE})"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 6: POST /api/tools/inspect (multiple tools)
echo -n "6. POST /api/tools/inspect (multiple tools) ... "
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/tools/inspect" \
    -H "Content-Type: application/json" \
    -d '{"tools": ["adb", "fastboot"]}')
if echo "$RESPONSE" | jq -e '.envelope.type == "batch"' > /dev/null 2>&1; then
    COUNT=$(echo "$RESPONSE" | jq -r '.envelope.count')
    echo -e "$PASS (${COUNT} tools inspected)"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 7: GET /api/tools/inspect/:tool
echo -n "7. GET /api/tools/inspect/adb ... "
RESPONSE=$(curl -s "${BASE_URL}/api/tools/inspect/adb")
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "detect_android_adb"' > /dev/null 2>&1; then
    echo -e "$PASS"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 8: GET /api/tools/available
echo -n "8. GET /api/tools/available ... "
RESPONSE=$(curl -s "${BASE_URL}/api/tools/available")
if echo "$RESPONSE" | jq -e '.envelope.type == "inspect" and .operation.id == "tools_availability_check"' > /dev/null 2>&1; then
    AVAILABLE_COUNT=$(echo "$RESPONSE" | jq -r '.data.details.availableCount')
    TOTAL_COUNT=$(echo "$RESPONSE" | jq -r '.data.details.totalCount')
    echo -e "$PASS (${AVAILABLE_COUNT}/${TOTAL_COUNT} tools available)"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

echo ""
echo "Testing Operations Endpoints"
echo "----------------------------------------"

# Test 9: POST /api/operations/simulate
echo -n "9. POST /api/operations/simulate (detection) ... "
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/operations/simulate" \
    -H "Content-Type: application/json" \
    -d '{"operation": "detect_android_adb", "role": "tech"}')
if echo "$RESPONSE" | jq -e '.envelope.type == "simulate"' > /dev/null 2>&1; then
    WOULD_SUCCEED=$(echo "$RESPONSE" | jq -r '.data.wouldSucceed')
    CHECK_COUNT=$(echo "$RESPONSE" | jq -r '.data.simulation.checks | length')
    echo -e "$PASS (${CHECK_COUNT} checks, would succeed: ${WOULD_SUCCEED})"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 10: POST /api/operations/simulate (destructive)
echo -n "10. POST /api/operations/simulate (destructive) ... "
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/operations/simulate" \
    -H "Content-Type: application/json" \
    -d '{"operation": "flash_partition", "role": "admin"}')
if echo "$RESPONSE" | jq -e '.envelope.type == "simulate"' > /dev/null 2>&1; then
    RISK_LEVEL=$(echo "$RESPONSE" | jq -r '.data.simulation.capability.riskLevel')
    echo -e "$PASS (risk level: ${RISK_LEVEL})"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 11: POST /api/operations/execute (policy deny)
echo -n "11. POST /api/operations/execute (policy deny) ... "
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/operations/execute" \
    -H "Content-Type: application/json" \
    -d '{"operation": "flash_partition", "role": "tech"}')
if echo "$RESPONSE" | jq -e '.envelope.type == "policy-deny" and .operation.status == "denied"' > /dev/null 2>&1; then
    MATCHED_RULE=$(echo "$RESPONSE" | jq -r '.data.policy.matchedRule')
    echo -e "$PASS (rule: ${MATCHED_RULE})"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

# Test 12: POST /api/operations/execute (policy pass, execution)
echo -n "12. POST /api/operations/execute (policy pass) ... "
RESPONSE=$(curl -s -X POST "${BASE_URL}/api/operations/execute" \
    -H "Content-Type: application/json" \
    -d '{"operation": "detect_android_adb", "role": "tech"}')
if echo "$RESPONSE" | jq -e '.envelope.type == "execute"' > /dev/null 2>&1; then
    STATUS=$(echo "$RESPONSE" | jq -r '.operation.status')
    echo -e "$PASS (status: ${STATUS})"
else
    echo -e "$FAIL Invalid response"
    exit 1
fi

echo ""
echo "Testing Envelope Validation"
echo "----------------------------------------"

# Test 13: Envelope structure validation
echo -n "13. Validate envelope structure ... "
RESPONSE=$(curl -s "${BASE_URL}/api/catalog")
if echo "$RESPONSE" | jq -e 'has("envelope") and has("operation") and has("data") and has("metadata")' > /dev/null 2>&1; then
    echo -e "$PASS All required fields present"
else
    echo -e "$FAIL Missing required fields"
    exit 1
fi

# Test 14: Correlation ID presence
echo -n "14. Validate correlation IDs ... "
RESPONSE=$(curl -s "${BASE_URL}/api/catalog")
CORRELATION_ID=$(echo "$RESPONSE" | jq -r '.envelope.correlationId')
if [ "$CORRELATION_ID" != "null" ] && [ -n "$CORRELATION_ID" ]; then
    echo -e "$PASS (${CORRELATION_ID})"
else
    echo -e "$FAIL Missing correlation ID"
    exit 1
fi

echo ""
echo "=================================================="
echo -e "$PASS All tests passed!"
echo "=================================================="
echo ""
echo "Summary:"
echo "  - Catalog endpoints: 4/4 passed"
echo "  - Tools inspection endpoints: 4/4 passed"
echo "  - Operations endpoints: 4/4 passed"
echo "  - Envelope validation: 2/2 passed"
echo ""
echo "Total: 14/14 tests passed ✅"
echo ""
