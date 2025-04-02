export const countryNameToCode = {
    'india': 'IN',
    'united states': 'US',
    'united kingdom': 'GB',
    'england': 'GB',
    'france': 'FR',
    'germany': 'DE',
    'japan': 'JP'
  };
  
  export const getCountryCode = (countryName) => {
    if (!countryName) return '';
    return countryNameToCode[countryName.toLowerCase()] || '';
  };