# CoinGecko API Integration

## Endpoint: POST /data/fetch

Fetches cryptocurrency historical market data from CoinGecko API and saves it to a file.

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `coinId` | string | Yes | Cryptocurrency ID | `bitcoin`, `ethereum`, `cardano` |
| `vsCurrency` | string | Yes | Target currency | `usd`, `eur`, `gbp` |
| `days` | number | Yes | Number of days of historical data | `1`, `7`, `30`, `90`, `365` |
| `format` | string | No | File format to save data | `json` (default), `excel` |

### Example Request (cURL)

```bash
curl -X POST http://localhost:3000/data/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "bitcoin",
    "vsCurrency": "usd",
    "days": 30,
    "format": "json"
  }'
```

### Example Request (Swagger UI)

Navigate to: `http://localhost:3000/api`

Use the `/data/fetch` endpoint with:
```json
{
  "coinId": "bitcoin",
  "vsCurrency": "usd",
  "days": 30,
  "format": "json"
}
```

### Popular Cryptocurrency IDs

- `bitcoin` - Bitcoin
- `ethereum` - Ethereum
- `cardano` - Cardano
- `binancecoin` - Binance Coin
- `ripple` - XRP
- `solana` - Solana
- `polkadot` - Polkadot
- `dogecoin` - Dogecoin
- `avalanche-2` - Avalanche
- `polygon` - Polygon

### Supported Currencies

- `usd` - US Dollar
- `eur` - Euro
- `gbp` - British Pound
- `jpy` - Japanese Yen
- `btc` - Bitcoin
- `eth` - Ethereum

### API Endpoint Used

```
GET https://api.coingecko.com/api/v3/coins/{coinId}/market_chart?vs_currency={vsCurrency}&days={days}
```

### Response Format

The API returns historical data including:
- **prices**: Array of [timestamp, price] pairs
- **market_caps**: Array of [timestamp, market_cap] pairs
- **total_volumes**: Array of [timestamp, volume] pairs

### Example Response

```json
{
  "success": true,
  "message": "Cryptocurrency data fetched and saved successfully",
  "data": {
    "recordCount": 1,
    "filePath": "/path/to/data/data_1234567890.json",
    "format": "json",
    "duration": 1234
  }
}
```

### Notes

- CoinGecko API is free but has rate limits (10-50 calls/minute depending on plan)
- Data is saved to the `data/` directory in the service root
- Files are named with timestamps: `data_{timestamp}.json` or `data_{timestamp}.xlsx`
