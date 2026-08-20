const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// The selected country's currency can be obtained by:
// const selectedCountry = countriesList.find(c => c.id === (salonData?.country_id || salonCountry));
// const currSymbol = selectedCountry ? (isAr ? selectedCountry.currency_ar : selectedCountry.currency_en) : (isAr ? 'ر.س' : 'SAR');

// Add helper to Dashboards component
const helperStr = `  const isSalonComplete = salonData && salonData.mobile && salonData.address_ar && salonData.name_ar;

  const selectedCountryObj = countriesList.find(c => c.id == (salonCountry || salonData?.country_id));
  const currSymbol = selectedCountryObj ? (isAr ? selectedCountryObj.currency_ar : selectedCountryObj.currency_en) : (isAr ? 'ر.س' : 'SAR');
`;

content = content.replace("  const isSalonComplete = salonData && salonData.mobile && salonData.address_ar && salonData.name_ar;", helperStr);

// Replace static SAR with {currSymbol}
content = content.replace(/SAR {s\.original_price}/g, "{currSymbol} {s.original_price}");
content = content.replace(/SAR {s\.discount_price}/g, "{currSymbol} {s.discount_price}");

fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log("Dashboards updated with dynamic currency");
