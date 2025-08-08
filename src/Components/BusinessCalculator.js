import React, { useState } from 'react';
import './BusinessCalculator.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Emission Factors from the provided document
const EMISSION_FACTORS = {
    scope1: {
        fuel: {
            petrolKgCo2ePerLitre: 2.31, // kg CO2e/litre
            dieselKgCo2ePerLitre: 2.68, // kg CO2e/litre
            naturalGasKgCo2ePerUnit: 2.0, // kg CO2e/unit (e.g., Nm3, hypothetical)
            lpgKgCo2ePerKg: 3.0, // kg CO2e/kg (hypothetical)
        },
        vehicleKm: {
            hdvTruckKgCo2PerKm: 0.7375, // kg CO2/km (>12T)
            sedanDieselBelow1600ccKgCo2PerKm: 0.131, // kg CO2/km
        }
    },
    scope2: {
        electricity: {
            nationalGridKgCo2ePerKWh: 0.757, // kg CO2e/kWh
            rajasthanGridKgCo2ePerKWh: 0.000422, // kg CO2e/kWh
        }
    },
    scope3: {
        businessTravel: {
            airTravelLongHaulKgCo2ePerKm: 0.15,
            airTravelShortHaulKgCo2ePerKm: 0.20,
            railTravelElectricKgCo2ePerKWh: 0.82,
            taxiPetrolKgCo2ePerKm: 0.2,
        },
        employeeCommute: {
            motorcycleBelow125ccKgCo2PerKm: 0.0290,
            threeWheelerPetrolKgCo2PerKm: 0.1135,
            threeWheelerCngKgCo2PerKm: 0.10768,
            intracityBusKgCo2PerPaxKm: 0.015161,
            personalCarPetrolKgCo2PerKm: 0.18,
            personalCarDieselKgCo2PerKm: 0.22,
        },
        waste: {
            mswOpenBurningKgCo2PerKgWaste: 0.572,
            landfillMixedWasteKgCo2ePerKg: 0.2,
            compostedWasteAvoidedEmissionsKgCo2ePerKg: -0.1,
            recycledWasteAvoidedEmissionsKgCo2ePerKg: -0.05,
        },
        purchasedGoodsAndServicesKgCo2ePerINRMillionRevenue: 10,
    }
};

const TOOLTIP_CONTENT = {
  petrolLitresScope1: `Factor: ${EMISSION_FACTORS.scope1.fuel.petrolKgCo2ePerLitre} kg CO2e/litre (for owned vehicles/equipment).`,
  dieselLitresScope1: `Factor: ${EMISSION_FACTORS.scope1.fuel.dieselKgCo2ePerLitre} kg CO2e/litre (for owned vehicles/generators/boilers).`,
  naturalGasUnits: `Hypothetical Factor: ${EMISSION_FACTORS.scope1.fuel.naturalGasKgCo2ePerUnit} kg CO2e/unit (e.g., Nm3) for boilers/furnaces.`,
  lpgKg: `Hypothetical Factor: ${EMISSION_FACTORS.scope1.fuel.lpgKgCo2ePerKg} kg CO2e/kg for boilers/cookstoves.`,
  hdvTruckKmOwned: `Factor: ${EMISSION_FACTORS.scope1.vehicleKm.hdvTruckKgCo2PerKm} kg CO2/km (>12T truck).`,
  sedanDieselKmOwned: `Factor: ${EMISSION_FACTORS.scope1.vehicleKm.sedanDieselBelow1600ccKgCo2PerKm} kg CO2/km (Sedan <1600 CC Diesel).`,

  electricityKWhScope2: `Factor: ${EMISSION_FACTORS.scope2.electricity.nationalGridKgCo2ePerKWh} kg CO2e/kWh (National Grid) or ${EMISSION_FACTORS.scope2.electricity.rajasthanGridKgCo2ePerKWh} kg CO2e/kWh (Rajasthan Grid).`,

  airTravelLongHaulKm: `Hypothetical Factor: ${EMISSION_FACTORS.scope3.businessTravel.airTravelLongHaulKgCo2ePerKm} kg CO2e/pax-km for long-haul flights.`,
  airTravelShortHaulKm: `Hypothetical Factor: ${EMISSION_FACTORS.scope3.businessTravel.airTravelShortHaulKgCo2ePerKm} kg CO2e/pax-km for short-haul flights.`,
  railTravelElectricKWh: `Factor: ${EMISSION_FACTORS.scope3.businessTravel.railTravelElectricKgCo2ePerKWh} kg CO2/kWh for electric rail.`,
  taxiPetrolKm: `Hypothetical Factor: ${EMISSION_FACTORS.scope3.businessTravel.taxiPetrolKgCo2ePerKm} kg CO2e/km (proxy for taxi/ride-hailing).`,

  motorcycleCommuteKm: `Factor: ${EMISSION_FACTORS.scope3.employeeCommute.motorcycleBelow125ccKgCo2PerKm} kg CO2/km (Motorcycle <125 CC).`,
  threeWheelerPetrolCommuteKm: `Factor: ${EMISSION_FACTORS.scope3.employeeCommute.threeWheelerPetrolKgCo2PerKm} kg CO2/km (Three-wheeler Petrol).`,
  threeWheelerCngCommuteKm: `Factor: ${EMISSION_FACTORS.scope3.employeeCommute.threeWheelerCngKgCo2PerKm} kg CO2/km (Three-wheeler CNG).`,
  intracityBusPaxCommuteKm: `Factor: ${EMISSION_FACTORS.scope3.employeeCommute.intracityBusKgCo2PerPaxKm} kg CO2/pax-km (Intracity Bus).`,
  personalCarPetrolCommuteKm: `Hypothetical Factor: ${EMISSION_FACTORS.scope3.employeeCommute.personalCarPetrolKgCo2PerKm} kg CO2/km.`,
  personalCarDieselCommuteKm: `Hypothetical Factor: ${EMISSION_FACTORS.scope3.employeeCommute.personalCarDieselKgCo2PerKm} kg CO2/km.`,

  wasteOpenBurning: `Factor: ${EMISSION_FACTORS.scope3.waste.mswOpenBurningKgCo2PerKgWaste} kg CO2/kg waste (for open burning).`,
  wasteLandfillMixed: `Hypothetical Factor: ${EMISSION_FACTORS.scope3.waste.landfillMixedWasteKgCo2ePerKg} kg CO2e/kg for mixed waste to landfill. This follows IPCC's First Order Decay (FOD) methodology.`,
  wasteComposted: `Hypothetical Avoided Emissions: ${EMISSION_FACTORS.scope3.waste.compostedWasteAvoidedEmissionsKgCo2ePerKg} kg CO2e/kg for composted organic waste, accounting for biological treatments as per IPCC guidelines.`,
  wasteRecycled: `Hypothetical Avoided Emissions: ${EMISSION_FACTORS.scope3.waste.recycledWasteAvoidedEmissionsKgCo2ePerKg} kg CO2e/kg for recycled dry waste.`,

  purchasedGoodsAndServicesRevenue: `Hypothetical and highly simplified factor: ${EMISSION_FACTORS.scope3.purchasedGoodsAndServicesKgCo2ePerINRMillionRevenue} kg CO2e per INR Million Revenue. Full Scope 3 requires detailed spend data as per BRSR Core & Assurance.`,
};


function BusinessCalculator() {
    // Company Information (for context, not calculation)
    const [companyType, setCompanyType] = useState('');
    const [monthlyRevenueINR, setMonthlyRevenueINR] = useState('');

    // Scope 1 States (Direct Emissions)
    const [petrolLitresScope1, setPetrolLitresScope1] = useState(''); // Owned fleet, generators
    const [dieselLitresScope1, setDieselLitresScope1] = useState(''); // Owned fleet, generators, boilers
    const [naturalGasUnits, setNaturalGasUnits] = useState(''); // For boilers, furnaces
    const [lpgKg, setLpgKg] = useState(''); // For heating, cooking
    const [hdvTruckKmOwned, setHdvTruckKmOwned] = useState(''); // Company-owned HDV trucks
    const [sedanDieselKmOwned, setSedanDieselKmOwned] = useState(''); // Company-owned sedan

    // Scope 2 States (Indirect Energy Emissions)
    const [electricityKWhScope2, setElectricityKWhScope2] = useState('');
    const [electricityLocationScope2, setElectricityLocationScope2] = useState('national');

    // Scope 3 States (Value Chain Emissions - Selected Categories for MVP)
    // Business Travel
    const [airTravelLongHaulKm, setAirTravelLongHaulKm] = useState(''); // Pax-km
    const [airTravelShortHaulKm, setAirTravelShortHaulKm] = useState(''); // Pax-km
    const [railTravelElectricKWh, setRailTravelElectricKWh] = useState(''); // kWh for electric rail
    const [taxiPetrolKm, setTaxiPetrolKm] = useState(''); // km for taxi/ride-hailing

    // Employee Commute (simplified for aggregate input)
    const [motorcycleCommuteKm, setMotorcycleCommuteKm] = useState('');
    const [threeWheelerPetrolCommuteKm, setThreeWheelerPetrolCommuteKm] = useState('');
    const [threeWheelerCngCommuteKm, setThreeWheelerCngCommuteKm] = useState('');
    const [intracityBusPaxCommuteKm, setIntracityBusPaxCommuteKm] = useState('');
    const [personalCarPetrolCommuteKm, setPersonalCarPetrolCommuteKm] = useState('');
    const [personalCarDieselCommuteKm, setPersonalCarDieselCommuteKm] = useState('');


    // Waste Generated in Operations
    const [wasteOpenBurning, setWasteOpenBurning] = useState(''); // Open burning
    const [wasteLandfillMixed, setWasteLandfillMixed] = useState(''); // Landfill
    const [wasteComposted, setWasteComposted] = useState(''); // Composting (avoided)
    const [wasteRecycled, setWasteRecycled] = useState(''); // Recycling (avoided)

    // Purchased Goods and Services (highly simplified placeholder)
    const [purchasedGoodsAndServicesAmount, setPurchasedGoodsAndServicesAmount] = useState(''); // in INR Million Revenue

    // Calculation & Display States
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(null);
    const [footprintPeriod, setFootprintPeriod] = useState('monthly'); // 'monthly' or 'annual'
    const [calculationBreakdown, setCalculationBreakdown] = useState({});
    const [showBreakdownPopup, setShowBreakdownPopup] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    // Function to perform the calculation
    const calculateFootprint = () => {
        let scope1Co2 = 0;
        let scope2Co2 = 0;
        let scope3Co2 = 0;

        // --- Scope 1 Emissions (Direct) ---
        if (petrolLitresScope1) {
            scope1Co2 += parseFloat(petrolLitresScope1) * EMISSION_FACTORS.scope1.fuel.petrolKgCo2ePerLitre;
        }
        if (dieselLitresScope1) {
            scope1Co2 += parseFloat(dieselLitresScope1) * EMISSION_FACTORS.scope1.fuel.dieselKgCo2ePerLitre;
        }
        if (naturalGasUnits) {
            scope1Co2 += parseFloat(naturalGasUnits) * EMISSION_FACTORS.scope1.fuel.naturalGasKgCo2ePerUnit;
        }
        if (lpgKg) {
            scope1Co2 += parseFloat(lpgKg) * EMISSION_FACTORS.scope1.fuel.lpgKgCo2ePerKg;
        }
        if (hdvTruckKmOwned) {
            scope1Co2 += parseFloat(hdvTruckKmOwned) * EMISSION_FACTORS.scope1.vehicleKm.hdvTruckKgCo2PerKm;
        }
        if (sedanDieselKmOwned) {
            scope1Co2 += parseFloat(sedanDieselKmOwned) * EMISSION_FACTORS.scope1.vehicleKm.sedanDieselBelow1600ccKgCo2PerKm;
        }

        // --- Scope 2 Emissions (Purchased Electricity) ---
        if (electricityKWhScope2) {
            const factor = electricityLocationScope2 === 'rajasthan' ?
                           EMISSION_FACTORS.scope2.electricity.rajasthanGridKgCo2ePerKWh :
                           EMISSION_FACTORS.scope2.electricity.nationalGridKgCo2ePerKWh;
            scope2Co2 = parseFloat(electricityKWhScope2) * factor;
        }

        // --- Scope 3 Emissions (Value Chain) ---
        // Business Travel
        if (airTravelLongHaulKm) {
            scope3Co2 += parseFloat(airTravelLongHaulKm) * EMISSION_FACTORS.scope3.businessTravel.airTravelLongHaulKgCo2ePerKm;
        }
        if (airTravelShortHaulKm) {
            scope3Co2 += parseFloat(airTravelShortHaulKm) * EMISSION_FACTORS.scope3.businessTravel.airTravelShortHaulKgCo2ePerKm;
        }
        if (railTravelElectricKWh) {
            scope3Co2 += parseFloat(railTravelElectricKWh) * EMISSION_FACTORS.scope3.businessTravel.railTravelElectricKgCo2ePerKWh;
        }
        if (taxiPetrolKm) {
            scope3Co2 += parseFloat(taxiPetrolKm) * EMISSION_FACTORS.scope3.businessTravel.taxiPetrolKgCo2ePerKm;
        }

        // Employee Commute
        if (motorcycleCommuteKm) {
            scope3Co2 += parseFloat(motorcycleCommuteKm) * EMISSION_FACTORS.scope3.employeeCommute.motorcycleBelow125ccKgCo2PerKm;
        }
        if (threeWheelerPetrolCommuteKm) {
            scope3Co2 += parseFloat(threeWheelerPetrolCommuteKm) * EMISSION_FACTORS.scope3.employeeCommute.threeWheelerPetrolKgCo2PerKm;
        }
        if (threeWheelerCngCommuteKm) {
            scope3Co2 += parseFloat(threeWheelerCngCommuteKm) * EMISSION_FACTORS.scope3.employeeCommute.threeWheelerCngKgCo2PerKm;
        }
        if (intracityBusPaxCommuteKm) {
            scope3Co2 += parseFloat(intracityBusPaxCommuteKm) * EMISSION_FACTORS.scope3.employeeCommute.intracityBusKgCo2PerPaxKm;
        }
        if (personalCarPetrolCommuteKm) {
            scope3Co2 += parseFloat(personalCarPetrolCommuteKm) * EMISSION_FACTORS.scope3.employeeCommute.personalCarPetrolKgCo2PerKm;
        }
        if (personalCarDieselCommuteKm) {
            scope3Co2 += parseFloat(personalCarDieselCommuteKm) * EMISSION_FACTORS.scope3.employeeCommute.personalCarDieselCommuteKgCo2PerKm;
        }

        // Waste Generated in Operations
        if (wasteOpenBurning) {
            scope3Co2 += parseFloat(wasteOpenBurning) * EMISSION_FACTORS.scope3.waste.mswOpenBurningKgCo2PerKgWaste;
        }
        if (wasteLandfillMixed) {
            scope3Co2 += parseFloat(wasteLandfillMixed) * EMISSION_FACTORS.scope3.waste.landfillMixedWasteKgCo2ePerKg;
        }
        if (wasteComposted) {
            scope3Co2 += parseFloat(wasteComposted) * EMISSION_FACTORS.scope3.waste.compostedWasteAvoidedEmissionsKgCo2ePerKg;
        }
        if (wasteRecycled) {
            scope3Co2 += parseFloat(wasteRecycled) * EMISSION_FACTORS.scope3.waste.recycledWasteAvoidedEmissionsKgCo2ePerKg;
        }

        // Purchased Goods and Services (simplified)
        if (purchasedGoodsAndServicesAmount) {
            // Assuming purchasedGoodsAndServicesAmount is in Lakhs, convert to Millions
            const revenueInMillions = parseFloat(purchasedGoodsAndServicesAmount) / 10;
            scope3Co2 += revenueInMillions * EMISSION_FACTORS.scope3.purchasedGoodsAndServicesKgCo2ePerINRMillionRevenue;
        }


        let totalCo2Monthly = scope1Co2 + scope2Co2 + scope3Co2;

        // Determine the scaling factor based on the selected period
        const scalingFactor = footprintPeriod === 'annual' ? 12 : 1;

        setTotalCarbonFootprint((totalCo2Monthly * scalingFactor).toFixed(3));

        // Store breakdown for the pop-up, scaled to the chosen period
        const currentBreakdown = {
            scope1: (scope1Co2 * scalingFactor).toFixed(3),
            scope2: (scope2Co2 * scalingFactor).toFixed(3),
            scope3: (scope3Co2 * scalingFactor).toFixed(3),
        };
        setCalculationBreakdown(currentBreakdown);

        // Prepare data for the pie chart, scaled to the chosen period
        const labels = [];
        const dataValues = [];
        const backgroundColors = [];

        if ((scope1Co2 * scalingFactor) > 0) {
            labels.push('Scope 1 (Direct)');
            dataValues.push(scope1Co2 * scalingFactor);
            backgroundColors.push('#dc3545'); // Red
        }
        if ((scope2Co2 * scalingFactor) > 0) {
            labels.push('Scope 2 (Electricity)');
            dataValues.push(scope2Co2 * scalingFactor);
            backgroundColors.push('#007bff'); // Blue
        }
        // Scope 3 can be negative due to avoided emissions, so check for non-zero contribution
        if ((scope3Co2 * scalingFactor) !== 0) {
            labels.push('Scope 3 (Value Chain)');
            dataValues.push(scope3Co2 * scalingFactor);
            backgroundColors.push('#ffc107'); // Amber
        }

        setChartData({
            labels: labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                },
            ],
        });

        generateSuggestions(currentBreakdown, companyType);
    };

    const generateSuggestions = (breakdown, companyType) => {
        const tips = [];
        tips.push("Understanding your emissions by scope is the first step towards a comprehensive decarbonization strategy. ClimateOS provides audit-ready reports and scenario modeling for deeper analysis.");

        if (parseFloat(breakdown.scope1) > 0) {
            tips.push("For Scope 1 (Direct Emissions): Implement regular maintenance for company vehicles and equipment to improve fuel efficiency. Explore switching to cleaner fuels or electric/hybrid company fleets.");
        }
        if (parseFloat(breakdown.scope2) > 0) {
            tips.push("For Scope 2 (Electricity): Invest in energy-efficient lighting (LEDs) and HVAC systems. Consider installing rooftop solar panels or sourcing renewable energy through Power Purchase Agreements (PPAs).");
        }
        if (parseFloat(breakdown.scope3) > 0) { // Only suggest if Scope 3 is positive
            tips.push("For Scope 3 (Value Chain): Engage with your suppliers to encourage sustainable practices. Promote public transport, carpooling, or cycling for employee commute. Implement robust waste segregation and recycling programs.");
        } else if (parseFloat(breakdown.scope3) < 0) {
             tips.push("Excellent work on Scope 3 waste management! Your composting and recycling efforts are leading to avoided emissions. Keep up the great work!");
        }

        // Add company type specific suggestions based on benchmarks
        if (companyType === 'Manufacturing') {
            tips.push("<span class='tip'>Manufacturing Sector Tip: Focus on optimizing production processes and exploring alternative, lower-carbon materials. Consider energy audits to identify efficiency opportunities. (Typical: 150-300 tCO2e/crore revenue)</span>");
        } else if (companyType === 'IT Services') {
            tips.push("<span class='tip'>IT Services Sector Tip: Optimize data center energy consumption. Encourage remote work where feasible and promote sustainable commuting for employees. (Typical: 20-50 tCO2e/crore revenue)</span>");
        } else if (companyType === 'Factory') {
            tips.push("<span class='tip'>Factory Specific Tip: Evaluate boiler efficiency, explore waste heat recovery, and invest in process electrification where viable. (e.g., Steel industry: ~2.5 tonnes of CO2 per tonne of crude steel (T/tcs); Cement industry: ~0.5-0.6 tCO2/tonne cement)</span>");
        } else if (companyType === 'Construction') {
            tips.push("<span class='tip'>Construction Sector Tip: Focus on sustainable building materials, optimize site logistics to reduce fuel consumption, and manage construction waste effectively. (Typical: 200-400 tCO2e/crore revenue)</span>");
        }


        if (tips.length === 0) {
            tips.push("Enter some data to see tailored suggestions for your business!");
        }
        setSuggestions(tips);
    };


    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 14,
                        family: 'Roboto'
                    },
                    color: '#333'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw;
                        const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value.toFixed(2)} kg CO2e (${percentage}%)`;

                    }
                },
                bodyFont: {
                    family: 'Roboto'
                },
                titleFont: {
                    family: 'Roboto'
                }
            }
        },
    };

    const handleShare = () => {
       const textToShare = `My company's estimated ${footprintPeriod} GHG footprint is ${totalCarbonFootprint} kg CO2e. Calculate your business's impact with ClimateOS: [Your ClimateOS Website URL Here] #ClimateOS #GHGEmissions #Sustainability #India`;


        if (navigator.share) {
            navigator.share({
                title: 'My Business GHG Footprint',
                text: textToShare,
                url: 'https://www.climateos.in' || window.location.href, // Replace with actual ClimateOS URL
            }).catch((error) => console.log('Error sharing', error));
        } else {
            alert('Share feature not supported in this browser. You can copy this:\n\n' + textToShare);
            navigator.clipboard.writeText(textToShare);
        }
    };

    return (
        <div className="carbon-calculator-container">
            <h2>
                Business GHG Footprint Estimator - ClimateOS
            </h2>
            <p>
                Estimate your {footprintPeriod} Greenhouse Gas (GHG) emissions across Scope 1, Scope 2, and key Scope 3 categories,
                using India-specific emission factors from the ClimateOS data.
            </p>

            {/* Company Info Section */}
            <div className="calculator-section">
                <h3>Your Business Profile</h3>
                <div className="form-group">
                    <label>
                        Type of Business:
                    </label>
                    <select
                        value={companyType}
                        onChange={(e) => setCompanyType(e.target.value)}
                    >
                        <option value="">Select your industry</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="IT Services">IT Services</option>
                        <option value="Factory">Factory/Industrial Production</option>
                        <option value="Construction">Construction</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>
                        Approx. Monthly Revenue (INR in Crores):
                    </label>
                    <input
                        type="number"
                        value={monthlyRevenueINR}
                        onChange={(e) => setMonthlyRevenueINR(e.target.value)}
                        placeholder="e.g., 50 (for ₹50 Crore)"
                        min="0"
                    />
                    <p className="hint-text">
                        *This helps in providing more context-aware suggestions and potential benchmarking.
                    </p>
                </div>
            </div>


            {/* Monthly/Annual Toggle */}
            <div className="form-group radio-group" style={{ textAlign: 'center', marginBottom: '30px' }}>
                <label>
                    <input
                        type="radio"
                        value="monthly"
                        checked={footprintPeriod === 'monthly'}
                        onChange={() => setFootprintPeriod('monthly')}
                    />
                    Monthly Footprint
                </label>
                <label>
                    <input
                        type="radio"
                        value="annual"
                        checked={footprintPeriod === 'annual'}
                        onChange={() => setFootprintPeriod('annual')}
                    />
                    Annual Footprint
                </label>
            </div>

            {/* Scope 1 Section */}
            <div className="calculator-section scope1-section">
                <h3>1. Scope 1 Emissions (Direct Emissions)</h3>
                <p className="info-note">
                    Emissions from sources owned or controlled by your company (e.g., fuel combustion in owned vehicles, generators, or boilers).
                </p>

                <h4>Fuel Combustion - Stationary & Mobile</h4>
                <div className="form-group">
                    <label>
                        Petrol Consumed by Company Vehicles/Generators (litres/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.petrolLitresScope1}</span>
                        </span>
                    </label>
                    <input type="number" value={petrolLitresScope1} onChange={(e) => setPetrolLitresScope1(e.target.value)} placeholder="e.g., 500" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Diesel Consumed by Company Vehicles/Generators/Boilers (litres/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.dieselLitresScope1}</span>
                        </span>
                    </label>
                    <input type="number" value={dieselLitresScope1} onChange={(e) => setDieselLitresScope1(e.target.value)} placeholder="e.g., 1500" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Natural Gas Consumed (units/month, e.g., Nm³):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.naturalGasUnits}</span>
                        </span>
                    </label>
                    <input type="number" value={naturalGasUnits} onChange={(e) => setNaturalGasUnits(e.target.value)} placeholder="e.g., 100" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        LPG Consumed (kg/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.lpgKg}</span>
                        </span>
                    </label>
                    <input type="number" value={lpgKg} onChange={(e) => setLpgKg(e.target.value)} placeholder="e.g., 50" min="0" />
                </div>

                <h4>Owned/Operated Fleet Distance</h4>
                <div className="form-group">
                    <label>
                        HDV Truck ({'>'}12T) Distance Traveled (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.hdvTruckKmOwned}</span>
                        </span>
                    </label>
                    <input type="number" value={hdvTruckKmOwned} onChange={(e) => setHdvTruckKmOwned(e.target.value)} placeholder="e.g., 2000" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Company Sedan {'<'}1600 CC Diesel Distance (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.sedanDieselKmOwned}</span>
                        </span>
                    </label>
                    <input type="number" value={sedanDieselKmOwned} onChange={(e) => setSedanDieselKmOwned(e.target.value)} placeholder="e.g., 1000" min="0" />
                </div>
            </div>

            {/* Scope 2 Section */}
            <div className="calculator-section scope2-section">
                <h3>2. Scope 2 Emissions (Indirect Energy Emissions)</h3>
                <p className="info-note">
                    Emissions from the generation of purchased electricity, steam, heating, and cooling consumed by your company.
                </p>
                <div className="form-group">
                    <label>
                        Monthly Purchased Electricity Usage (kWh):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.electricityKWhScope2}</span>
                        </span>
                    </label>
                    <input type="number" value={electricityKWhScope2} onChange={(e) => setElectricityKWhScope2(e.target.value)} placeholder="e.g., 10000" min="0" />
                </div>
                <div className="form-group radio-group">
                    <label>
                        Select Electricity Grid Location:
                    </label>
                    <label>
                        <input type="radio" value="national" checked={electricityLocationScope2 === 'national'} onChange={() => setElectricityLocationScope2('national')} />
                        National Grid
                    </label>
                    <label>
                        <input type="radio" value="rajasthan" checked={electricityLocationScope2 === 'rajasthan'} onChange={() => setElectricityLocationScope2('rajasthan')} />
                        Rajasthan Grid
                    </label>
                </div>
            </div>

            {/* Scope 3 Section (Key Categories for MVP) */}
            <div className="calculator-section scope3-section">
                <h3>3. Scope 3 Emissions (Selected Value Chain Categories)</h3>
                <p className="info-note">
                    Indirect emissions, not included in Scope 2, that occur in the value chain of the reporting company, both upstream and downstream.
                    <br/> Note: This calculator covers key Scope 3 categories; a full BRSR compliant report requires deeper analysis and Scope 3 typically has 15 categories.
                </p>

                <h4>Business Travel (Air & Rail)</h4>
                <div className="form-group">
                    <label>
                        Air Travel - Long Haul (passenger-km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.airTravelLongHaulKm}</span>
                        </span>
                    </label>
                    <input type="number" value={airTravelLongHaulKm} onChange={(e) => setAirTravelLongHaulKm(e.target.value)} placeholder="e.g., 5000 (total pax-km)" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Air Travel - Short Haul (passenger-km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.airTravelShortHaulKm}</span>
                        </span>
                    </label>
                    <input type="number" value={airTravelShortHaulKm} onChange={(e) => setAirTravelShortHaulKm(e.target.value)} placeholder="e.g., 2000 (total pax-km)" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Rail Travel - Electric Traction (kWh/month consumed for travel):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.railTravelElectricKWh}</span>
                        </span>
                    </label>
                    <input type="number" value={railTravelElectricKWh} onChange={(e) => setRailTravelElectricKWh(e.target.value)} placeholder="e.g., 100" min="0" />
                    <p className="hint-text">
                        *This is for electric rail consumption by your employees/business.
                    </p>
                </div>
                <div className="form-group">
                    <label>
                        Taxi/Ride-Hailing Kilometers (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.taxiPetrolKm}</span>
                        </span>
                    </label>
                    <input type="number" value={taxiPetrolKm} onChange={(e) => setTaxiPetrolKm(e.target.value)} placeholder="e.g., 300" min="0" />
                </div>

                <h4>Employee Commuting (Aggregate)</h4>
                <p className="info-note">
                    Estimate the total distance traveled by employees commuting to/from work, aggregated for your workforce.
                </p>
                <div className="form-group">
                    <label>
                        Motorcycle {'<'}125 CC Commute (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.motorcycleCommuteKm}</span>
                        </span>
                    </label>
                    <input type="number" value={motorcycleCommuteKm} onChange={(e) => setMotorcycleCommuteKm(e.target.value)} placeholder="e.g., 5000" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Three-wheeler (Petrol) Commute (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.threeWheelerPetrolCommuteKm}</span>
                        </span>
                    </label>
                    <input type="number" value={threeWheelerPetrolCommuteKm} onChange={(e) => setThreeWheelerPetrolCommuteKm(e.target.value)} placeholder="e.g., 1000" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Three-wheeler (CNG) Commute (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.threeWheelerCngCommuteKm}</span>
                        </span>
                    </label>
                    <input type="number" value={threeWheelerCngCommuteKm} onChange={(e) => setThreeWheelerCngCommuteKm(e.target.value)} placeholder="e.g., 1000" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Intracity Bus Commute (passenger-km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.intracityBusPaxCommuteKm}</span>
                        </span>
                    </label>
                    <input type="number" value={intracityBusPaxCommuteKm} onChange={(e) => setIntracityBusPaxCommuteKm(e.target.value)} placeholder="e.g., 10000 (total for all employees)" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Personal Car (Petrol) Commute (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.personalCarPetrolCommuteKm}</span>
                        </span>
                    </label>
                    <input type="number" value={personalCarPetrolCommuteKm} onChange={(e) => setPersonalCarPetrolCommuteKm(e.target.value)} placeholder="e.g., 5000" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Personal Car (Diesel) Commute (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.personalCarDieselCommuteKm}</span>
                        </span>
                    </label>
                    <input type="number" value={personalCarDieselCommuteKm} onChange={(e) => setPersonalCarDieselCommuteKm(e.target.value)} placeholder="e.g., 2000" min="0" />
                </div>

                <h4>Waste Generated in Operations</h4>
                <p className="info-note">
                    This includes waste generated from your facilities that is not owned/controlled by you after disposal.
                </p>
                <div className="form-group">
                    <label>
                        Waste Disposed by Open Burning (kg/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.wasteOpenBurning}</span>
                        </span>
                    </label>
                    <input type="number" value={wasteOpenBurning} onChange={(e) => setWasteOpenBurning(e.target.value)} placeholder="e.g., 100" min="0" />
                    <p className="hint-text">
                        Common in areas lacking formal waste collection.
                    </p>
                </div>
                <div className="form-group">
                    <label>
                        Mixed Waste to Landfill (kg/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.wasteLandfillMixed}</span>
                        </span>
                    </label>
                    <input type="number" value={wasteLandfillMixed} onChange={(e) => setWasteLandfillMixed(e.target.value)} placeholder="e.g., 500" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Organic Waste Composted (kg/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.wasteComposted}</span>
                        </span>
                    </label>
                    <input type="number" value={wasteComposted} onChange={(e) => setWasteComposted(e.target.value)} placeholder="e.g., 50 (for avoided emissions)" min="0" />
                </div>
                <div className="form-group">
                    <label>
                        Dry Waste Recycled (Plastics, Paper, Metal, Glass) (kg/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.wasteRecycled}</span>
                        </span>
                    </label>
                    <input type="number" value={wasteRecycled} onChange={(e) => setWasteRecycled(e.target.value)} placeholder="e.g., 150 (for avoided emissions)" min="0" />
                </div>

                <h4>Purchased Goods and Services (Simplified)</h4>
                <p className="info-note">
                    This is a highly simplified estimation for illustrative purposes. 
                    For accurate Scope 3, category 1 emissions, ClimateOS uses detailed spend-based and supplier-specific data,
                     crucial for BRSR compliance.
                </p>
                <div className="form-group">
                    <label>
                        Total Monthly Spend on Goods/Services (INR in Lakhs):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.purchasedGoodsAndServicesRevenue}</span>
                        </span>
                    </label>
                    <input type="number" value={purchasedGoodsAndServicesAmount} onChange={(e) => setPurchasedGoodsAndServicesAmount(e.target.value)} placeholder="e.g., 50 (for ₹50 Lakhs)" min="0" />
                    <p className="hint-text">
                        *1 Crore INR = 100 Lakhs INR. This input of '50' would represent ₹0.5 Crore.
                    </p>
                </div>

            </div>

            <button
                onClick={calculateFootprint}
                className="calculate-button"
            >
                Calculate My Company's GHG Footprint
            </button>

            {totalCarbonFootprint !== null && (
                <div className="result-container">
                    <h3>Your Estimated {footprintPeriod === 'annual' ? 'Annual' : 'Monthly'} GHG Footprint:</h3>
                    <p className="result-value">
                        {totalCarbonFootprint} kg CO2e
                    </p>
                    <p className="result-description">
                        This estimation provides a quick overview of your business's GHG emissions based on India-specific factors.
                        For comprehensive BRSR compliance and detailed reporting, ClimateOS offers a full-suite platform.
                    </p>
                    {companyType && monthlyRevenueINR && parseFloat(monthlyRevenueINR) > 0 && (
                         <div className="info-note" style={{marginTop: '20px', textAlign: 'center', borderLeft: '4px solid #28a745'}}>
                            <p style={{textAlign: 'center', margin: '0'}}>
                                For context, typical {companyType} industry benchmarks are:
                                {companyType === 'Manufacturing' && " 150-300 tCO2e/crore revenue.[span_44](end_span)"}
                                {companyType === 'IT Services' && " 20-50 tCO2e/crore revenue.[span_45](end_span)"}
                                {companyType === 'Construction' && " 200-400 tCO2e/crore revenue.[span_46](end_span)"}
                                {companyType === 'Factory' && (
                                    <>
                                        <br/>Indian Steel Industry: ~2.5 tonnes of CO2 per tonne of crude steel (T/tcs) in 2020.
                                        <br/>Cement Industry: ~0.5-0.6 tCO2/tonne cement.
                                    </>
                                )}
                                <br/>Your calculated footprint is {((parseFloat(totalCarbonFootprint) / 1000) / (parseFloat(monthlyRevenueINR) * (footprintPeriod === 'annual' ? 1 : 12))).toFixed(2)} tonnes CO2e per Crore INR Revenue.
                                <p className="hint-text" style={{textAlign: 'center'}}>
                                    *Note: Benchmarks are rough estimates; ClimateOS offers precise peer benchmarking.
                                </p>
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setShowBreakdownPopup(true)}
                        className="view-details-button"
                    >
                        View Detailed Breakdown & Suggestions
                    </button>
                    <button
                        onClick={handleShare}
                        className="share-button"
                    >
                        Share This Estimate
                    </button>
                </div>
            )}

            {/* Breakdown Pop-up */}
            {showBreakdownPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <button className="close-popup-button" onClick={() => setShowBreakdownPopup(false)}>
                            &times;
                        </button>
                        <h3>Your GHG Footprint Breakdown</h3>
                        <div className="breakdown-details">
                            <p><span>Scope 1 (Direct Emissions):</span> <strong>{parseFloat(calculationBreakdown.scope1 || 0).toFixed(3)} kg CO2e</strong></p>
                            <p><span>Scope 2 (Electricity):</span> <strong>{parseFloat(calculationBreakdown.scope2 || 0).toFixed(3)} kg CO2e</strong></p>
                            <p><span>Scope 3 (Value Chain):</span> <strong>{parseFloat(calculationBreakdown.scope3 || 0).toFixed(3)} kg CO2e</strong></p>
                        </div>

                        {chartData && chartData.datasets[0].data.length > 0 ? (
                            <div className="chart-container">
                                <h4>Contribution by Scope:</h4>
                                <Pie data={chartData} options={pieChartOptions} />
                            </div>
                        ) : (
                            <p className="no-data-message">No data to display in chart. Please fill in some values.</p>
                        )}
                        <div className="impact-message">
                            <h4>Actionable Steps for Your Business:</h4>
                            <ul>
                                {suggestions.map((tip, index) => (
                                    <li key={index} style={{ marginBottom: '10px', textAlign: 'left' }}>{tip}</li>
                                ))}
                            </ul>
                            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
                                ClimateOS can help your business streamline GHG reporting, meet BRSR mandates, and drive real decarbonization strategies.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BusinessCalculator;