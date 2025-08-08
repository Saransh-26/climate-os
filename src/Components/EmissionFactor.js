const EMISSION_FACTORS = {
  electricity: {
    nationalGridKgCo2ePerKWh: 0.757, // kg CO2e/kWh
    rajasthanGridKgCo2ePerKWh: 0.000422, // gCO2e/kWh converted to kg for consistency
  },
  transportation: {
    petrolKgCo2ePerLitre: 2.31, // kg CO2e/litre
    dieselKgCo2ePerLitre: 2.68, // kg CO2e/litre
    motorcycleBelow125ccKgCo2PerKm: 0.0290, // kg CO2/km
    threeWheelerPetrolKgCo2PerKm: 0.1135, // kg CO2/km
    threeWheelerCngKgCo2PerKm: 0.10768, // kg CO2/km
    sedanDieselBelow1600ccKgCo2PerKm: 0.131, // kg CO2/km
    intracityBusKgCo2PerPaxKm: 0.015161, // kg CO2/pax-km
    hdvTruckKgCo2PerKm: 0.7375, // kg CO2/km
    // Note: Rail Freight (Electric Traction) needs kWh input, might be more complex for a simple user calculator
  },
  waste: {
    mswOpenBurningKgCo2PerKgWaste: 0.572 // kg CO2/kg waste
  }
  // Industrial Process Emissions (Steel, Cement) are for B2B and highly specialized, not typically in a basic calculator
};

export default EMISSION_FACTORS;