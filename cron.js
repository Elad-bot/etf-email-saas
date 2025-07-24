import yahooFinance from "yahoo-finance2";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Example ETF list — all U.S. focused, large-cap quality ETFs
const etfSymbols = [
  'SPY', 'IVV', 'VOO', 'QQQ', 'VTI', 'SCHX', 'IWM', 'DIA', 'XLK', 'XLF',
  'XLV', 'XLY', 'XLP', 'XLE', 'XLU', 'VUG', 'VTV', 'VO', 'VB', 'SCHB',
  'MDY', 'IJH', 'IJS', 'IJR', 'XLB', 'XBI', 'XME', 'XRT', 'XOP',
  // add more tickers up to 100+
];


async function getETFData(symbol) {
  const quote = await yahooFinance.quote(symbol);
  return {
    symbol,
    price: quote.regularMarketPrice,
    pe: quote.trailingPE,
    ps: quote.priceToSalesTrailing12Months,
    name: quote.shortName
  };
}

function passesFilters(etf) {
  return (
    etf.pe && etf.pe < 20 &&
    etf.ps && etf.ps < 4
  );
}

async function getRecommendations() {
  const results = [];

  for (const symbol of ETF_SYMBOLS) {
    try {
      const etf = await getETFData(symbol);
      if (passesFilters(etf)) {
        results.push(etf);
      }
    } catch (e) {
      console.error(`Error fetching ${symbol}:`, e.message);
    }
  }

  return results;
}

async function sendEmail(recommendations) {
  const body = recommendations.length
    ? recommendations.map(etf => 
        `${etf.name} (${etf.symbol})\nPrice: $${etf.price}\nP/E: ${etf.pe}\nP/S: ${etf.ps}\n\n`
      ).join("")
    : "No ETFs met the criteria today.";

  await sgMail.send({
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: "Daily High-Quality ETF Picks",
    text: body
  });

  console.log("Email sent!");
}

getRecommendations()
  .then(sendEmail)
  .catch(err => console.error("Failed to send ETF email:", err));
