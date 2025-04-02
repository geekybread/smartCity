export const countryNameToCode = {
    // Americas
    'argentina': 'AR',
    'brazil': 'BR',
    'canada': 'CA',
    'chile': 'CL',
    'colombia': 'CO',
    'mexico': 'MX',
    'united states': 'US',
    'united states of america': 'US',
    'usa': 'US',

    // Europe
    'austria': 'AT',
    'belgium': 'BE',
    'croatia': 'HR',
    'czech republic': 'CZ',
    'denmark': 'DK',
    'finland': 'FI',
    'france': 'FR',
    'germany': 'DE',
    'greece': 'GR',
    'hungary': 'HU',
    'ireland': 'IE',
    'italy': 'IT',
    'netherlands': 'NL',
    'norway': 'NO',
    'poland': 'PL',
    'portugal': 'PT',
    'russia': 'RU',
    'spain': 'ES',
    'sweden': 'SE',
    'switzerland': 'CH',
    'turkey': 'TR',
    'ukraine': 'UA',
    'united kingdom': 'GB',
    'england': 'GB',
    'scotland': 'GB',
    'wales': 'GB',

    // Asia
    'china': 'CN',
    'hong kong': 'HK',
    'india': 'IN',
    'indonesia': 'ID',
    'iran': 'IR',
    'israel': 'IL',
    'japan': 'JP',
    'malaysia': 'MY',
    'pakistan': 'PK',
    'philippines': 'PH',
    'saudi arabia': 'SA',
    'singapore': 'SG',
    'south korea': 'KR',
    'korea': 'KR',
    'thailand': 'TH',
    'united arab emirates': 'AE',
    'uae': 'AE',
    'vietnam': 'VN',

    // Africa
    'egypt': 'EG',
    'kenya': 'KE',
    'morocco': 'MA',
    'nigeria': 'NG',
    'south africa': 'ZA',

    // Oceania
    'australia': 'AU',
    'new zealand': 'NZ'
};

export const getCountryCode = (countryName) => {
    if (!countryName) return '';
    const normalized = countryName.toLowerCase().trim();
    return countryNameToCode[normalized] || '';
};
