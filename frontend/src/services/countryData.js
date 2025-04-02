export const getCountryCapital = async (countryName) => {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`
      );
      
      if (!response.ok) {
        throw new Error(`Country not found (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      
      if (!data[0]?.capital?.[0]) {
        throw new Error('Capital information not available');
      }
      
      return data[0].capital[0];
    } catch (error) {
      console.error('Error in getCountryCapital:', error);
      throw error;
    }
  };