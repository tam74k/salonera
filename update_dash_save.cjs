const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const isoMap = {
  1: 'SA', 2: 'EG', 3: 'AE', 4: 'KW', 5: 'QA', 6: 'BH', 7: 'OM', 8: 'JO', 
  9: 'PS', 10: 'LB', 11: 'SY', 12: 'IQ', 13: 'YE', 14: 'SD', 15: 'LY', 16: 'TN', 
  17: 'DZ', 18: 'MA', 19: 'MR', 20: 'DJ', 21: 'SO', 22: 'KM'
};

const handleSaveSettingsPattern = "const handleSaveSettings = async () => {\\n    if (!salonData) return;\\n    setIsSavingSettings(true);";

const updatedHandleSaveSettings = \`const handleSaveSettings = async () => {
    if (!salonData) return;
    setIsSavingSettings(true);

    const cId = salonCountry ? parseInt(salonCountry.toString()) : null;
    const selectedCountryObj = countriesList.find(c => c.id === cId);
    
    let currencyToSave = salonSettingsData.currency;
    let countryCodeToSave = salonData.country;

    if (selectedCountryObj) {
      currencyToSave = selectedCountryObj.currency_en || currencyToSave;
      const isoMap: Record<number, string> = {
        1: 'SA', 2: 'EG', 3: 'AE', 4: 'KW', 5: 'QA', 6: 'BH', 7: 'OM', 8: 'JO', 
        9: 'PS', 10: 'LB', 11: 'SY', 12: 'IQ', 13: 'YE', 14: 'SD', 15: 'LY', 16: 'TN', 
        17: 'DZ', 18: 'MA', 19: 'MR', 20: 'DJ', 21: 'SO', 22: 'KM'
      };
      countryCodeToSave = isoMap[selectedCountryObj.id] || countryCodeToSave;
    }\`;

content = content.replace(handleSaveSettingsPattern, updatedHandleSaveSettings);

// Also need to update the update payload
const oldUpdatePayload = \`city_id: salonCity ? parseInt(salonCity.toString()) : null,
      lat: salonLat,
      lng: salonLng,
      name_ar: salonSettingsData.name_ar,
      name_en: salonSettingsData.name_en,
      description_ar: salonSettingsData.description_ar,
      description_en: salonSettingsData.description_en,
      address_ar: salonSettingsData.address_ar,
      address_en: salonSettingsData.address_en,
      mobile: salonSettingsData.mobile,
      email: salonSettingsData.email,
      whatsapp: salonSettingsData.whatsapp,
      working_hours_start: salonSettingsData.working_hours_start,
      working_hours_end: salonSettingsData.working_hours_end,
      type: salonSettingsData.salon_type,
      currency: salonSettingsData.currency,
      images: salonSettingsData.images,\`;

const newUpdatePayload = \`city_id: salonCity ? parseInt(salonCity.toString()) : null,
      lat: salonLat,
      lng: salonLng,
      name_ar: salonSettingsData.name_ar,
      name_en: salonSettingsData.name_en,
      description_ar: salonSettingsData.description_ar,
      description_en: salonSettingsData.description_en,
      address_ar: salonSettingsData.address_ar,
      address_en: salonSettingsData.address_en,
      mobile: salonSettingsData.mobile,
      email: salonSettingsData.email,
      whatsapp: salonSettingsData.whatsapp,
      working_hours_start: salonSettingsData.working_hours_start,
      working_hours_end: salonSettingsData.working_hours_end,
      type: salonSettingsData.salon_type,
      currency: currencyToSave,
      country: countryCodeToSave,
      images: salonSettingsData.images,\`;

content = content.replace(oldUpdatePayload, newUpdatePayload);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
