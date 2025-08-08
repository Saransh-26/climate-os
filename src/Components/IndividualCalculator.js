import React, { useState, useEffect } from 'react';
import './IndividualCalculator.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const EMISSION_FACTORS = {
    electricity: {
        nationalGridKgCo2ePerKWh: 0.757, // kg CO2e/kWh
        rajasthanGridKgCo2ePerKWh: 0.000422, // kg CO2e/kWh (was g, converted for consistency)
    },
    transportation: {
        fuel: {
            petrolKgCo2ePerLitre: 2.31, // kg CO2e/litre
            dieselKgCo2ePerLitre: 2.68, // kg CO2e/litre
        },
        vehicleKm: {
            motorcycleBelow125ccKgCo2PerKm: 0.0290, // kg CO2/km
            threeWheelerPetrolKgCo2PerKm: 0.1135, // kg CO2/km
            threeWheelerCngKgCo2PerKm: 0.10768, // kg CO2/km
            sedanDieselBelow1600ccKgCo2PerKm: 0.131, // kg CO2/km
            hdvTruckKgCo2PerKm: 0.7375, // kg CO2/km
        },
        paxKm: {
            intracityBusKgCo2PerPaxKm: 0.015161, // kg CO2/pax-km
        }
    },
    waste: {
        mswOpenBurningKgCo2PerKgWaste: 0.572, // kg CO2/kg waste
        // New: Example factors for other waste streams (for advanced mode)
        landfillMixedWasteKgCo2ePerKg: 0.2, // Hypothetical, needs proper source
        compostedWasteAvoidedEmissionsKgCo2ePerKg: -0.1, // Hypothetical, represents avoided emissions
    }
};

// Tooltip content for emission factors
const TOOLTIP_CONTENT = {
  electricityKWh: `Factor: ${EMISSION_FACTORS.electricity.nationalGridKgCo2ePerKWh} kg CO2e/kWh (National Grid) or ${EMISSION_FACTORS.electricity.rajasthanGridKgCo2ePerKWh} kg CO2e/kWh (Rajasthan Grid).`,

  petrolLitres: `Factor: ${EMISSION_FACTORS.transportation.fuel.petrolKgCo2ePerLitre} kg CO2e/litre.`,
  dieselLitres: `Factor: ${EMISSION_FACTORS.transportation.fuel.dieselKgCo2ePerLitre} kg CO2e/litre.`,

  motorcycleKm: `Factor: ${EMISSION_FACTORS.transportation.vehicleKm.motorcycleBelow125ccKgCo2PerKm} kg CO2/km.`,
  threeWheelerPetrolKm: `Factor: ${EMISSION_FACTORS.transportation.vehicleKm.threeWheelerPetrolKgCo2PerKm} kg CO2/km.`,
  threeWheelerCngKm: `Factor: ${EMISSION_FACTORS.transportation.vehicleKm.threeWheelerCngKgCo2PerKm} kg CO2/km.`,
  sedanDieselKm: `Factor: ${EMISSION_FACTORS.transportation.vehicleKm.sedanDieselBelow1600ccKgCo2PerKm} kg CO2/km.`,
  hdvTruckKm: `Factor: ${EMISSION_FACTORS.transportation.vehicleKm.hdvTruckKgCo2PerKm} kg CO2/km.`,
  intracityBusPaxKm: `Factor: ${EMISSION_FACTORS.transportation.paxKm.intracityBusKgCo2PerPaxKm} kg CO2/pax-km.`,

  wasteKg: `Factor: ${EMISSION_FACTORS.waste.mswOpenBurningKgCo2PerKgWaste} kg CO2/kg waste (for open burning).`,

  // Advanced waste tooltips
  landfillMixedWaste: `Factor: ${EMISSION_FACTORS.waste.landfillMixedWasteKgCo2ePerKg} kg CO2e/kg.`,
  compostedWaste: `Avoided Emissions: ${EMISSION_FACTORS.waste.compostedWasteAvoidedEmissionsKgCo2ePerKg} kg CO2e/kg.`,
};


function IndividualCalculator() {
    // State for Electricity
    const [electricityKWh, setElectricityKWh] = useState('');
    const [electricityLocation, setElectricityLocation] = useState('national');

    // State for Transportation - Fuel
    const [petrolLitres, setPetrolLitres] = useState('');
    const [dieselLitres, setDieselLitres] = useState('');

    // State for Transportation - Vehicle Distance
    const [motorcycleKm, setMotorcycleKm] = useState('');
    const [threeWheelerPetrolKm, setThreeWheelerPetrolKm] = useState('');
    const [threeWheelerCngKm, setThreeWheelerCngKm] = useState('');
    const [sedanDieselKm, setSedanDieselKm] = useState('');
    const [hdvTruckKm, setHdvTruckKm] = useState('');

    // State for Transportation - Passenger-km
    const [intracityBusPaxKm, setIntracityBusPaxKm] = useState('');

    // State for Waste
    const [wasteKg, setWasteKg] = useState('');
    const [useAdvancedWaste, setUseAdvancedWaste] = useState(false);
    const [landfillMixedWasteKg, setLandfillMixedWasteKg] = useState('');
    const [compostedWasteKg, setCompostedWasteKg] = useState('');

    // Total Carbon Footprint
    const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(null);
    const [footprintPeriod, setFootprintPeriod] = useState('monthly'); // 'monthly' or 'annual'

    // States for waste management actions (not directly used in calculation, but for feedback)
    const [recycles, setRecycles] = useState('');
    const [composts, setComposts] = useState('');
    const [wasteReductionEfforts, setWasteReductionEfforts] = useState('');

    // New states for detailed breakdown and pop-up
    const [calculationBreakdown, setCalculationBreakdown] = useState({});
    const [showBreakdownPopup, setShowBreakdownPopup] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [suggestions, setSuggestions] = useState([]); // To store reduction suggestions

    // Helper to calculate total CO2 and breakdown
    const calculateFootprint = () => {
        let totalCo2 = 0; // in kg CO2e
        let electricityCo2 = 0;
        let transportationCo2 = 0;
        let wasteCo2 = 0;

        // 1. Electricity Emissions
        if (electricityKWh) {
            const factor = electricityLocation === 'rajasthan' ?
                           EMISSION_FACTORS.electricity.rajasthanGridKgCo2ePerKWh :
                           EMISSION_FACTORS.electricity.nationalGridKgCo2ePerKWh;
            electricityCo2 = parseFloat(electricityKWh) * factor;
            totalCo2 += electricityCo2;
        }

        // 2. Transportation Emissions
        // Fuel-based
        if (petrolLitres) {
            transportationCo2 += parseFloat(petrolLitres) * EMISSION_FACTORS.transportation.fuel.petrolKgCo2ePerLitre;
        }
        if (dieselLitres) {
            transportationCo2 += parseFloat(dieselLitres) * EMISSION_FACTORS.transportation.fuel.dieselKgCo2ePerLitre;
        }

        // Vehicle-distance based
        if (motorcycleKm) {
            transportationCo2 += parseFloat(motorcycleKm) * EMISSION_FACTORS.transportation.vehicleKm.motorcycleBelow125ccKgCo2PerKm;
        }
        if (threeWheelerPetrolKm) {
            transportationCo2 += parseFloat(threeWheelerPetrolKm) * EMISSION_FACTORS.transportation.vehicleKm.threeWheelerPetrolKgCo2PerKm;
        }
        if (threeWheelerCngKm) {
            transportationCo2 += parseFloat(threeWheelerCngKm) * EMISSION_FACTORS.transportation.vehicleKm.threeWheelerCngKgCo2PerKm;
        }
        if (sedanDieselKm) {
            transportationCo2 += parseFloat(sedanDieselKm) * EMISSION_FACTORS.transportation.vehicleKm.sedanDieselBelow1600ccKgCo2PerKm;
        }
        if (hdvTruckKm) {
            transportationCo2 += parseFloat(hdvTruckKm) * EMISSION_FACTORS.transportation.vehicleKm.hdvTruckKgCo2PerKm;
        }

        // Passenger-kilometer based
        if (intracityBusPaxKm) {
            transportationCo2 += parseFloat(intracityBusPaxKm) * EMISSION_FACTORS.transportation.paxKm.intracityBusKgCo2PerPaxKm;
        }
        totalCo2 += transportationCo2;

        // 3. Waste Emissions
        if (useAdvancedWaste) {
            if (landfillMixedWasteKg) {
                wasteCo2 += parseFloat(landfillMixedWasteKg) * EMISSION_FACTORS.waste.landfillMixedWasteKgCo2ePerKg;
            }
            if (compostedWasteKg) {
                // Composting avoids emissions, so it subtracts
                wasteCo2 += parseFloat(compostedWasteKg) * EMISSION_FACTORS.waste.compostedWasteAvoidedEmissionsKgCo2ePerKg;
            }
        } else {
            if (wasteKg) {
                wasteCo2 = parseFloat(wasteKg) * EMISSION_FACTORS.waste.mswOpenBurningKgCo2PerKgWaste;
            }
        }
        totalCo2 += wasteCo2;

        const finalTotalCo2 = footprintPeriod === 'annual' ? totalCo2 * 12 : totalCo2;

        setTotalCarbonFootprint(finalTotalCo2.toFixed(3)); // Round to 3 decimal places

        // Store breakdown for the pop-up
        const currentBreakdown = {
            electricity: electricityCo2.toFixed(3),
            transportation: transportationCo2.toFixed(3),
            waste: wasteCo2.toFixed(3),
        };
        setCalculationBreakdown(currentBreakdown);

        // Prepare data for the pie chart
        const labels = [];
        const dataValues = [];
        const backgroundColors = [];

        if (electricityCo2 > 0) {
            labels.push('Electricity');
            dataValues.push(electricityCo2);
            backgroundColors.push('#007bff'); // Primary Blue for electricity
        }
        if (transportationCo2 > 0) {
            labels.push('Transportation');
            dataValues.push(transportationCo2);
            backgroundColors.push('#ffc107'); // Amber for transportation
        }
        if (wasteCo2 !== 0) { // Can be negative if composting is high
            labels.push('Waste');
            dataValues.push(wasteCo2);
            backgroundColors.push('#dc3545'); // Red for waste
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

        // Generate suggestions based on breakdown
        generateSuggestions(currentBreakdown);
    };

    const generateSuggestions = (breakdown) => {
        const tips = [];
        if (parseFloat(breakdown.electricity) > 10) { // Example threshold
            tips.push("Consider switching to energy-efficient appliances and LED lighting to reduce electricity consumption.");
            tips.push("Unplug electronics when not in use. Even idle devices consume 'vampire' energy!");
        }
        if (parseFloat(breakdown.transportation) > 50) {
            tips.push("Explore carpooling, public transport, cycling, or walking for shorter distances.");
            tips.push("If possible, consider electric vehicles for your next purchase. They significantly reduce tailpipe emissions.");
            tips.push("Regular vehicle maintenance can improve fuel efficiency.");
        }
        if (parseFloat(breakdown.waste) > 5) { // Example threshold
            tips.push("Focus on reducing waste by choosing products with minimal packaging and using reusable bags/bottles.");
            tips.push("Start composting organic waste at home to divert it from landfills and open burning.");
            tips.push("Segregate your waste properly for recycling (plastics, paper, glass, metal).");
        }
        if (tips.length === 0) {
            tips.push("Great job! Your carbon footprint seems relatively low in the calculated categories. Keep up the good work!");
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
                        return '${label}: ${value.toFixed(2)} kg CO2e (${percentage}%)';
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
        const textToShare = `My estimated monthly carbon footprint is ${totalCarbonFootprint} kg CO2e. Calculate yours at [Your App URL]`;


        if (navigator.share) {
            navigator.share({
                title: 'My Carbon Footprint',
                text: textToShare,
                url: window.location.href,
            }).catch((error) => console.log('Error sharing', error));
        } else {
            alert('Share feature not supported in this browser. You can copy this:\n\n' + textToShare);
            navigator.clipboard.writeText(textToShare); // Copy to clipboard as fallback
        }
    };

    return (
        <div className="carbon-calculator-container">
            <h2>
                Personal Carbon Footprint Calculator - ClimateOS
            </h2>
            <p>
                Estimate your {footprintPeriod} carbon footprint based on India-specific emission factors from the ClimateOS data.
            </p>

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

            {/* Electricity Section */}
            <div className="calculator-section electricity-section">
                <h3>1. Electricity Consumption</h3>
                <div className="form-group">
                    <label>
                        Monthly Electricity Usage (kWh):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.electricityKWh}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={electricityKWh}
                        onChange={(e) => setElectricityKWh(e.target.value)}
                        placeholder="e.g., 200 (Average household: ~150-300 kWh)"
                        min="0"
                    />
                </div>
                <div className="form-group radio-group">
                    <label>
                        Select Grid Location:
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="national"
                            checked={electricityLocation === 'national'}
                            onChange={() => setElectricityLocation('national')}
                        />
                        National Grid
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="rajasthan"
                            checked={electricityLocation === 'rajasthan'}
                            onChange={() => setElectricityLocation('rajasthan')}
                        />
                        Rajasthan Grid
                    </label>
                </div>
            </div>

            {/* Transportation Section */}
            <div className="calculator-section transportation-section">
                <h3>2. Transportation</h3>

                <h4>Fuel Consumption</h4>
                <div className="form-group">
                    <label>
                        Monthly Petrol Consumed (litres):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.petrolLitres}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={petrolLitres}
                        onChange={(e) => setPetrolLitres(e.target.value)}
                        placeholder="e.g., 30"
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>
                        Monthly Diesel Consumed (litres):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.dieselLitres}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={dieselLitres}
                        onChange={(e) => setDieselLitres(e.target.value)}
                        placeholder="e.g., 20"
                        min="0"
                    />
                </div>

                <h4>Vehicle Distance Traveled</h4>
                <div className="form-group">
                    <label>
                        Motorcycle {'<'}125 CC Distance (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.motorcycleKm}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={motorcycleKm}
                        onChange={(e) => setMotorcycleKm(e.target.value)}
                        placeholder="e.g., 500"
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>
                        Three-wheeler (Petrol) Distance (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.threeWheelerPetrolKm}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={threeWheelerPetrolKm}
                        onChange={(e) => setThreeWheelerPetrolKm(e.target.value)}
                        placeholder="e.g., 100"
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>
                        Three-wheeler (CNG) Distance (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.threeWheelerCngKm}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={threeWheelerCngKm}
                        onChange={(e) => setThreeWheelerCngKm(e.target.value)}
                        placeholder="e.g., 100"
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>
                        Sedan {'<'}1600 CC Diesel Distance (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.sedanDieselKm}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={sedanDieselKm}
                        onChange={(e) => setSedanDieselKm(e.target.value)}
                        placeholder="e.g., 300"
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>
                        HDV Truck ({'>'}12T) Distance (km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.hdvTruckKm}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={hdvTruckKm}
                        onChange={(e) => setHdvTruckKm(e.target.value)}
                        placeholder="e.g., 50"
                        min="0"
                    />
                </div>

                <h4>Passenger-Kilometer Based</h4>
                <div className="form-group">
                    <label>
                        Intracity Bus (Passenger-km/month):
                        <span className="tooltip-container">
                            i
                            <span className="tooltip-text">{TOOLTIP_CONTENT.intracityBusPaxKm}</span>
                        </span>
                    </label>
                    <input
                        type="number"
                        value={intracityBusPaxKm}
                        onChange={(e) => setIntracityBusPaxKm(e.target.value)}
                        placeholder="e.g., 1000"
                        min="0"
                    />
                    <p className="hint-text">
                        *Passenger-km = Distance traveled by bus (km) * Number of passengers (e.g., if you travel 50km daily for 20 days: 50 * 20 * 1 = 1000 pax-km)
                    </p>
                </div>
            </div>

            {/* Waste Section */}
            <div className="calculator-section waste-section">
                <h3>3. Waste Disposal</h3>
                <div className="form-group" style={{ marginBottom: '25px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={useAdvancedWaste}
                            onChange={(e) => setUseAdvancedWaste(e.target.checked)}
                        />
                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>Use Advanced Waste Input</span>
                    </label>
                </div>

                {!useAdvancedWaste ? (
                    <div className="form-group">
                        <label>
                            Waste Disposed by Open Burning (kg/month):
                            <span className="tooltip-container">
                                i
                                <span className="tooltip-text">{TOOLTIP_CONTENT.wasteKg}</span>
                            </span>
                        </label>
                        <input
                            type="number"
                            value={wasteKg}
                            onChange={(e) => setWasteKg(e.target.value)}
                            placeholder="e.g., 5"
                            min="0"
                        />
                        <p className="hint-text">
                            *This typically applies to waste that is not collected by municipal services and is instead burned.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="waste-management-info">
                            *For more precise waste emissions, input quantities for different disposal methods.
                            Estimates are provided for illustrative purposes and need specific data sources.
                        </p>
                        <div className="form-group">
                            <label>
                                Mixed Waste to Landfill (kg/month):
                                <span className="tooltip-container">
                                    i
                                    <span className="tooltip-text">{TOOLTIP_CONTENT.landfillMixedWaste}</span>
                                </span>
                            </label>
                            <input
                                type="number"
                                value={landfillMixedWasteKg}
                                onChange={(e) => setLandfillMixedWasteKg(e.target.value)}
                                placeholder="e.g., 15"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                Organic Waste Composted (kg/month):
                                <span className="tooltip-container">
                                    i
                                    <span className="tooltip-text">{TOOLTIP_CONTENT.compostedWaste}</span>
                                </span>
                            </label>
                            <input
                                type="number"
                                value={compostedWasteKg}
                                onChange={(e) => setCompostedWasteKg(e.target.value)}
                                placeholder="e.g., 3"
                                min="0"
                            />
                            <p className="hint-text">
                                *Composting diverts organic waste from landfills, reducing methane emissions. This value subtracts from your total.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Waste Management (Focus on Action/Diversion) - Retaining this for feedback */}
            <div className="calculator-section waste-section">
                <h3>4. Your Waste Management Efforts</h3>
                <p className="waste-management-info">
                    *Your efforts in reducing and diverting waste significantly impact the overall footprint,
                    even if precise individual emissions are complex to calculate directly from these actions.
                </p>

                <div className="form-group">
                    <label>
                        How often do you actively try to reduce waste (e.g., choose unpackaged goods, use reusables)?
                    </label>
                    <select
                        value={wasteReductionEfforts}
                        onChange={(e) => setWasteReductionEfforts(e.target.value)}
                    >
                        <option value="">Select an option</option>
                        <option value="very_high">Very High (Consciously minimize waste)</option>
                        <option value="medium">Medium (Some efforts, but room for improvement)</option>
                        <option value="low">Low (Rarely focus on waste reduction)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>
                        Do you regularly recycle dry waste (plastics, paper, glass, metal)?
                    </label>
                    <select
                        value={recycles}
                        onChange={(e) => setRecycles(e.target.value)}
                    >
                        <option value="">Select an option</option>
                        <option value="always">Always</option>
                        <option value="sometimes">Sometimes</option>
                        <option value="never">Never</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>
                        Do you compost your organic/wet waste at home?
                    </label>
                    <select
                        value={composts}
                        onChange={(e) => setComposts(e.target.value)}
                    >
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>

                {recycles && composts && wasteReductionEfforts && (
                    <div className="waste-feedback">
                        <p>
                            Your waste diversion efforts are important! Reducing, reusing, and recycling/composting directly decrease the amount of waste sent to landfills, helping to reduce methane emissions.
                            <br/>
                            For precise emissions from municipal waste, rely on large-scale data and specialized assessments.
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={calculateFootprint}
                className="calculate-button"
            >
                Calculate My Total Carbon Footprint
            </button>

            {totalCarbonFootprint !== null && (
                <div className="result-container">
                    <h3>Your Estimated {footprintPeriod === 'annual' ? 'Annual' : 'Monthly'} Carbon Footprint:</h3>
                    <p className="result-value">
                        {totalCarbonFootprint} kg CO2e
                    </p>
                    <p className="result-description">
                        This comprehensive calculation is based on the precise India-specific emission factors provided in the ClimateOS document for electricity, transportation, and waste disposal.
                    </p>
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
                        Share My Footprint
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
                        <h3>Your Carbon Footprint Breakdown</h3>
                        <div className="breakdown-details">
                            <p><span>Electricity:</span> <strong>{parseFloat(calculationBreakdown.electricity || 0) * (footprintPeriod === 'annual' ? 12 : 1) .toFixed(3)} kg CO2e</strong></p>
                            <p><span>Transportation:</span> <strong>{parseFloat(calculationBreakdown.transportation || 0) * (footprintPeriod === 'annual' ? 12 : 1) .toFixed(3)} kg CO2e</strong></p>
                            <p><span>Waste:</span> <strong>{parseFloat(calculationBreakdown.waste || 0) * (footprintPeriod === 'annual' ? 12 : 1) .toFixed(3)} kg CO2e</strong></p>
                        </div>

                        {chartData && chartData.datasets[0].data.length > 0 ? (
                            <div className="chart-container">
                                <h4>Contribution to Total Emissions:</h4>
                                <Pie data={chartData} options={pieChartOptions} />
                            </div>
                        ) : (
                            <p className="no-data-message">No data to display in chart. Please fill in some values.</p>
                        )}
                        <div className="impact-message">
                            <h4>Actionable Steps to Reduce Your Footprint:</h4>
                            <ul>
                                {suggestions.map((tip, index) => (
                                    <li key={index} style={{ marginBottom: '10px', textAlign: 'left' }}>{tip}</li>
                                ))}
                            </ul>
                            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
                                Every small step counts towards a greener planet!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IndividualCalculator;