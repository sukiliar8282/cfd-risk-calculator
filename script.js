"use strict";

const calculatorForm = document.querySelector("#risk-calculator-form");
const formMessage = document.querySelector("#form-message");

const instrumentSpecifications = {
    EURUSD: {
        contractSize: 100000,
        tickSize: 0.0001,
        tickValue: 10,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    GBPUSD: {
        contractSize: 100000,
        tickSize: 0.0001,
        tickValue: 10,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    USDJPY: {
        contractSize: 100000,
        tickSize: 0.01,
        tickValue: 10,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    XAUUSD: {
        contractSize: 100,
        tickSize: 0.01,
        tickValue: 1,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    XAGUSD: {
        contractSize: 5000,
        tickSize: 0.001,
        tickValue: 5,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    US30: {
        contractSize: 1,
        tickSize: 1,
        tickValue: 1,
        minimumVolume: 0.1,
        volumeStep: 0.1,
        maximumVolume: 100
    },

    NAS100: {
        contractSize: 1,
        tickSize: 1,
        tickValue: 1,
        minimumVolume: 0.1,
        volumeStep: 0.1,
        maximumVolume: 100
    },

    SPX500: {
        contractSize: 1,
        tickSize: 0.1,
        tickValue: 0.1,
        minimumVolume: 0.1,
        volumeStep: 0.1,
        maximumVolume: 100
    },

    BTCUSD: {
        contractSize: 1,
        tickSize: 1,
        tickValue: 1,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    ETHUSD: {
        contractSize: 1,
        tickSize: 0.01,
        tickValue: 0.01,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    },

    CUSTOM: {
        contractSize: 1,
        tickSize: 0.01,
        tickValue: 1,
        minimumVolume: 0.01,
        volumeStep: 0.01,
        maximumVolume: 100
    }
};

function calculateRiskAmount(accountBalance, riskMode, riskValue) {
    if (riskMode === "percent") {
        return accountBalance * (riskValue / 100);
    }

    return riskValue;
}

function calculateStopDistance(entryPrice, stopLoss) {
    return Math.abs(entryPrice - stopLoss);
}

function calculateTakeProfitDistance(entryPrice, takeProfit) {
    return Math.abs(takeProfit - entryPrice);
}

function calculateRiskReward(stopDistance, takeProfitDistance) {
    if (stopDistance <= 0) {
        return null;
    }

    return takeProfitDistance / stopDistance;
}

function calculateTheoreticalPositionSize(
    riskAmount,
    stopDistance,
    specification
) {
    if (
        riskAmount <= 0 ||
        stopDistance <= 0 ||
        !specification ||
        specification.tickSize <= 0 ||
        specification.tickValue <= 0
    ) {
        return null;
    }

    const riskPerLot =
        (stopDistance / specification.tickSize) *
        specification.tickValue;

    if (!Number.isFinite(riskPerLot) || riskPerLot <= 0) {
        return null;
    }

    const theoreticalVolume = riskAmount / riskPerLot;

    return Number.isFinite(theoreticalVolume)
        ? theoreticalVolume
        : null;
}

function calculatePositionSize(riskAmount, stopDistance, specification) {
    if (
        riskAmount <= 0 ||
        stopDistance <= 0 ||
        !specification ||
        specification.tickSize <= 0 ||
        specification.tickValue <= 0
    ) {
        return null;
    }

    const riskPerLot =
        (stopDistance / specification.tickSize) *
        specification.tickValue;

    if (!Number.isFinite(riskPerLot) || riskPerLot <= 0) {
        return null;
    }

    const rawVolume = riskAmount / riskPerLot;

    if (!Number.isFinite(rawVolume) || rawVolume <= 0) {
        return null;
    }

    const steppedVolume =
        Math.floor(rawVolume / specification.volumeStep) *
        specification.volumeStep;

    const roundedVolume = Number(steppedVolume.toFixed(8));

    if (roundedVolume < specification.minimumVolume) {
        return null;
    }

    return Math.min(
        roundedVolume,
        specification.maximumVolume
    );
}

function calculatePotentialLoss(
    positionSize,
    stopDistance,
    specification
) {
    if (
        !Number.isFinite(positionSize) ||
        positionSize <= 0 ||
        stopDistance <= 0 ||
        !specification
    ) {
        return null;
    }

    const loss =
        positionSize *
        (stopDistance / specification.tickSize) *
        specification.tickValue;

    return Number.isFinite(loss) ? loss : null;
}

function calculatePotentialProfit(
    positionSize,
    takeProfitDistance,
    specification
) {
    if (
        !Number.isFinite(positionSize) ||
        positionSize <= 0 ||
        takeProfitDistance <= 0 ||
        !specification
    ) {
        return null;
    }

    const profit =
        positionSize *
        (takeProfitDistance / specification.tickSize) *
        specification.tickValue;

    return Number.isFinite(profit) ? profit : null;
}

function getNumberValue(selector) {
    const element = document.querySelector(selector);
    const value = Number(element?.value);

    return Number.isFinite(value) ? value : null;
}

function getSelectedValue(name) {
    const selectedElement = document.querySelector(
        `input[name="${name}"]:checked`
    );

    return selectedElement?.value || "";
}

function formatNumber(value, maximumFractionDigits = 2) {
    if (!Number.isFinite(value)) {
        return "-";
    }

    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits
    }).format(value);
}

function formatCurrency(value, currency) {
    if (!Number.isFinite(value)) {
        return "-";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits:
            currency === "JPY" || currency === "IDR" ? 0 : 2
    }).format(value);
}

function showMessage(message, type = "error") {
    formMessage.textContent = message;
    formMessage.dataset.type = type;
}

function clearMessage() {
    formMessage.textContent = "";
    delete formMessage.dataset.type;
}

function validateSpecification(specification) {
    if (!specification) {
        return false;
    }

    return (
        specification.contractSize > 0 &&
        specification.tickSize > 0 &&
        specification.tickValue > 0 &&
        specification.minimumVolume > 0 &&
        specification.volumeStep > 0 &&
        specification.maximumVolume >= specification.minimumVolume
    );
}

function validateForm(data) {
    if (
        data.accountBalance === null ||
        data.riskValue === null ||
        data.entryPrice === null ||
        data.stopLoss === null ||
        data.takeProfit === null
    ) {
        return "Lengkapi input yang diperlukan terlebih dahulu.";
    }

    if (
        data.accountBalance <= 0 ||
        data.riskValue <= 0 ||
        data.entryPrice <= 0 ||
        data.stopLoss <= 0 ||
        data.takeProfit <= 0
    ) {
        return "Nilai input harus lebih besar dari 0.";
    }

    if (data.riskMode === "percent" && data.riskValue > 100) {
        return "Risk % tidak boleh lebih besar dari 100%.";
    }

    if (data.direction === "long") {
        if (data.stopLoss >= data.entryPrice) {
            return "Untuk posisi Long, Stop Loss harus berada di bawah Entry Price.";
        }

        if (data.takeProfit <= data.entryPrice) {
            return "Untuk posisi Long, Take Profit harus berada di atas Entry Price.";
        }
    }

    if (data.direction === "short") {
        if (data.stopLoss <= data.entryPrice) {
            return "Untuk posisi Short, Stop Loss harus berada di atas Entry Price.";
        }

        if (data.takeProfit >= data.entryPrice) {
            return "Untuk posisi Short, Take Profit harus berada di bawah Entry Price.";
        }
    }
    if (
        data.leverage === null ||
        data.leverage <= 0
    ) {
        return "Masukkan Leverage yang valid.";
    }

    return "";
}

function updateResult(selector, value) {
    const element = document.querySelector(selector);

    if (element) {
        element.textContent = value;
    }
}

function resetResults() {
    updateResult("#risk-amount-result", "-");
    updateResult("#risk-percent-result", "-");
    updateResult("#position-size-result", "-");
    updateResult("#stop-distance-result", "-");
    updateResult("#take-profit-distance-result", "-");
    updateResult("#maximum-loss-result", "-");
    updateResult("#potential-profit-result", "-");
    updateResult("#risk-reward-result", "-");
}
function getLeverageValue() {
    const leverageSelect = document.querySelector("#leverage");
    const customLeverageInput = document.querySelector("#custom-leverage");
    const customLeverageGroup = document.querySelector(
        "#custom-leverage-group"
    );

    if (leverageSelect?.value === "custom") {
        if (customLeverageGroup) {
            customLeverageGroup.hidden = false;
        }

        const customLeverage = Number(
            customLeverageInput?.value
        );

        return Number.isFinite(customLeverage)
            ? customLeverage
            : null;
    }

    if (customLeverageGroup) {
        customLeverageGroup.hidden = true;
    }

    const leverage = Number(leverageSelect?.value);

    return Number.isFinite(leverage) ? leverage : null;
}

function calculateNotionalValue(
    positionSize,
    contractSize,
    entryPrice
) {
    if (
        !Number.isFinite(positionSize) ||
        !Number.isFinite(contractSize) ||
        !Number.isFinite(entryPrice) ||
        positionSize <= 0 ||
        contractSize <= 0 ||
        entryPrice <= 0
    ) {
        return null;
    }

    const notionalValue =
        positionSize * contractSize * entryPrice;

    return Number.isFinite(notionalValue)
        ? notionalValue
        : null;
}

function calculateRequiredMargin(
    notionalValue,
    leverage
) {
    if (
        !Number.isFinite(notionalValue) ||
        !Number.isFinite(leverage) ||
        notionalValue <= 0 ||
        leverage <= 0
    ) {
        return null;
    }

    const requiredMargin = notionalValue / leverage;

    return Number.isFinite(requiredMargin)
        ? requiredMargin
        : null;
}

function calculateMarginPercent(
    requiredMargin,
    accountBalance
) {
    if (
        !Number.isFinite(requiredMargin) ||
        !Number.isFinite(accountBalance) ||
        requiredMargin < 0 ||
        accountBalance <= 0
    ) {
        return null;
    }

    const marginPercent =
        (requiredMargin / accountBalance) * 100;

    return Number.isFinite(marginPercent)
        ? marginPercent
        : null;
}

function updateMarginResults(
    notionalValue,
    requiredMargin,
    marginPercent,
    currency
) {
    updateResult(
        "#notional-value-result",
        formatCurrency(notionalValue, currency)
    );

    updateResult(
        "#required-margin-result",
        formatCurrency(requiredMargin, currency)
    );

    updateResult(
        "#margin-percent-result",
        marginPercent === null
            ? "-"
            : `${formatNumber(marginPercent, 2)}%`
    );
}
function handleCalculation(event) {
    event.preventDefault();
    clearMessage();

    const data = {
        accountBalance: getNumberValue("#account-balance"),
        leverage: getLeverageValue(),
        accountCurrency:
            document.querySelector("#account-currency")?.value || "USD",
        riskMode: getSelectedValue("riskMode"),
        riskValue: getNumberValue("#risk-value"),
        instrument: document.querySelector("#instrument")?.value || "",
        direction: getSelectedValue("direction"),
        entryPrice: getNumberValue("#entry-price"),
        stopLoss: getNumberValue("#stop-loss"),
        takeProfit: getNumberValue("#take-profit")
    };

    const validationMessage = validateForm(data);

    if (validationMessage) {
        showMessage(validationMessage);
        resetResults();
        return;
    }

    const specification = getSpecificationFromForm();

    if (!validateSpecification(specification)) {
        showMessage("Periksa kembali Instrument Specification.");
        resetResults();
        return;
    }

    const riskAmount = calculateRiskAmount(
        data.accountBalance,
        data.riskMode,
        data.riskValue
    );

    const stopDistance = calculateStopDistance(
        data.entryPrice,
        data.stopLoss
    );

    const takeProfitDistance = calculateTakeProfitDistance(
        data.entryPrice,
        data.takeProfit
    );

    const riskReward = calculateRiskReward(
        stopDistance,
        takeProfitDistance
    );

    const theoreticalPositionSize =
        calculateTheoreticalPositionSize(
            riskAmount,
            stopDistance,
            specification
        );

    const positionSize = calculatePositionSize(
        riskAmount,
        stopDistance,
        specification
    );

    const calculationPositionSize =
        theoreticalPositionSize ?? positionSize;

    const actualRiskPercent =
        (riskAmount / data.accountBalance) * 100;

    const potentialLoss = calculatePotentialLoss(
        calculationPositionSize,
        stopDistance,
        specification
    );

    const potentialProfit = calculatePotentialProfit(
        calculationPositionSize,
        takeProfitDistance,
        specification
    );

    const notionalValue = calculateNotionalValue(
        calculationPositionSize,
        specification.contractSize,
        data.entryPrice
    );

    const requiredMargin = calculateRequiredMargin(
        notionalValue,
        data.leverage
    );

    const marginPercent = calculateMarginPercent(
        requiredMargin,
        data.accountBalance
    );

    updateResult(
        "#risk-amount-result",
        formatCurrency(riskAmount, data.accountCurrency)
    );

    updateResult(
        "#risk-percent-result",
        `${formatNumber(actualRiskPercent, 2)}%`
    );

    updateResult(
        "#stop-distance-result",
        formatNumber(stopDistance, 5)
    );

    updateResult(
        "#take-profit-distance-result",
        formatNumber(takeProfitDistance, 5)
    );

    updateResult(
        "#risk-reward-result",
        riskReward === null
            ? "-"
            : `1:${formatNumber(riskReward, 2)}`
    );

    let positionSizeText = "-";

    if (positionSize !== null) {
        positionSizeText = `${formatNumber(positionSize, 4)} Lot`;
    } else if (theoreticalPositionSize !== null) {
        positionSizeText =
            `${formatNumber(theoreticalPositionSize, 4)} Lot ` +
            "(di bawah Minimum Volume)";
    }

    updateResult(
        "#position-size-result",
        positionSizeText
    );
    updateResult(
        "#maximum-loss-result",
        formatCurrency(potentialLoss, data.accountCurrency)
    );

    updateResult(
        "#potential-profit-result",
        formatCurrency(potentialProfit, data.accountCurrency)
    );

    updateMarginResults(
        notionalValue,
        requiredMargin,
        marginPercent,
        data.accountCurrency
    );

    if (positionSize === null) {
        showMessage(
            "Estimasi berhasil dihitung. Theoretical Position Size masih di bawah Minimum Volume broker.",
            "error"
        );
    } else {
        showMessage(
            "Position Size, Maximum Loss, Potential Profit, dan Margin berhasil dihitung.",
            "success"
        );
    }
}

calculatorForm?.addEventListener(
    "submit",
    handleCalculation
);

const quickRiskAmountInput = document.querySelector(
    "#quick-risk-amount"
);

const calculateRiskRewardButton = document.querySelector(
    "#calculate-risk-reward"
);

const riskRewardTableBody = document.querySelector(
    "#risk-reward-table-body"
);

const riskRewardRatios = [1, 1.5, 2, 2.5, 3, 4, 5];

function renderRiskRewardTable() {
    if (!quickRiskAmountInput || !riskRewardTableBody) {
        return;
    }

    const riskAmount = Number(
        quickRiskAmountInput.value
    );

    if (!Number.isFinite(riskAmount) || riskAmount <= 0) {
        riskRewardTableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    Masukkan Risk Amount yang valid.
                </td>
            </tr>
        `;

        return;
    }

    riskRewardTableBody.innerHTML = riskRewardRatios
        .map((ratio) => {
            const potentialProfit = riskAmount * ratio;

            return `
                <tr>
                    <td>1:${formatNumber(ratio, 2)}</td>
                    <td>${formatCurrency(riskAmount, "USD")}</td>
                    <td>${formatCurrency(potentialProfit, "USD")}</td>
                </tr>
            `;
        })
        .join("");
}

calculateRiskRewardButton?.addEventListener(
    "click",
    renderRiskRewardTable
);

renderRiskRewardTable();

const instrumentSelect = document.querySelector(
    "#instrument"
);

const saveSpecificationButton = document.querySelector(
    "#save-specification"
);

const specificationMessage = document.querySelector(
    "#specification-message"
);

const specificationFields = {
    contractSize: document.querySelector("#contract-size"),
    tickSize: document.querySelector("#tick-size"),
    tickValue: document.querySelector("#tick-value"),
    pointSize: document.querySelector("#point-size"),
    minimumVolume: document.querySelector("#minimum-volume"),
    volumeStep: document.querySelector("#volume-step"),
    maximumVolume: document.querySelector("#maximum-volume")
};

function setSpecificationForm(specification) {
    if (!specification) {
        return;
    }

    specificationFields.contractSize.value =
        specification.contractSize ?? "";

    specificationFields.tickSize.value =
        specification.tickSize ?? "";

    specificationFields.tickValue.value =
        specification.tickValue ?? "";

    specificationFields.pointSize.value =
        specification.pointSize ??
        specification.tickSize ??
        "";

    specificationFields.minimumVolume.value =
        specification.minimumVolume ?? "";

    specificationFields.volumeStep.value =
        specification.volumeStep ?? "";

    specificationFields.maximumVolume.value =
        specification.maximumVolume ?? "";
}

function getSpecificationFromForm() {
    return {
        contractSize: Number(
            specificationFields.contractSize.value
        ),
        tickSize: Number(
            specificationFields.tickSize.value
        ),
        tickValue: Number(
            specificationFields.tickValue.value
        ),
        pointSize: Number(
            specificationFields.pointSize.value
        ),
        minimumVolume: Number(
            specificationFields.minimumVolume.value
        ),
        volumeStep: Number(
            specificationFields.volumeStep.value
        ),
        maximumVolume: Number(
            specificationFields.maximumVolume.value
        )
    };
}

function isValidSpecificationForm(specification) {
    return (
        Number.isFinite(specification.contractSize) &&
        specification.contractSize > 0 &&
        Number.isFinite(specification.tickSize) &&
        specification.tickSize > 0 &&
        Number.isFinite(specification.tickValue) &&
        specification.tickValue > 0 &&
        Number.isFinite(specification.pointSize) &&
        specification.pointSize > 0 &&
        Number.isFinite(specification.minimumVolume) &&
        specification.minimumVolume > 0 &&
        Number.isFinite(specification.volumeStep) &&
        specification.volumeStep > 0 &&
        Number.isFinite(specification.maximumVolume) &&
        specification.maximumVolume >=
        specification.minimumVolume
    );
}

function loadSelectedInstrumentSpecification() {
    const instrument = instrumentSelect?.value;
    const specification =
        instrumentSpecifications[instrument];

    if (!specification) {
        return;
    }

    setSpecificationForm({
        ...specification,
        pointSize:
            specification.pointSize ??
            specification.tickSize
    });

    if (specificationMessage) {
        specificationMessage.textContent =
            "Preset dimuat. Pastikan nilainya sesuai dengan broker yang digunakan.";

        specificationMessage.dataset.type = "success";
    }
}

instrumentSelect?.addEventListener(
    "change",
    loadSelectedInstrumentSpecification
);

saveSpecificationButton?.addEventListener(
    "click",
    () => {
        const specification =
            getSpecificationFromForm();

        if (!isValidSpecificationForm(specification)) {
            specificationMessage.textContent =
                "Periksa kembali Instrument Specification.";

            specificationMessage.dataset.type = "error";
            return;
        }

        const instrument =
            instrumentSelect?.value || "CUSTOM";

        instrumentSpecifications[instrument] =
            specification;

        specificationMessage.textContent =
            "Instrument Specification berhasil diterapkan untuk kalkulasi saat ini.";

        specificationMessage.dataset.type = "success";
    }
);

loadSelectedInstrumentSpecification();

const leverageSelect =
    document.querySelector("#leverage");

leverageSelect?.addEventListener(
    "change",
    () => {
        getLeverageValue();
    }
);

const calculateButton =
    document.querySelector("#calculate-button");

calculateButton?.addEventListener(
    "click",
    (event) => {
        const originalText =
            calculateButton.textContent;

        calculateButton.disabled = true;
        calculateButton.textContent = "Menghitung...";

        handleCalculation(event);

        window.setTimeout(() => {
            calculateButton.disabled = false;
            calculateButton.textContent = originalText;
        }, 350);
    }
);
function calculateDrawdown(
    startingBalance,
    currentBalance
) {
    if (
        !Number.isFinite(startingBalance) ||
        !Number.isFinite(currentBalance) ||
        startingBalance <= 0 ||
        currentBalance < 0
    ) {
        return null;
    }

    return Math.max(
        startingBalance - currentBalance,
        0
    );
}

function calculateDrawdownPercent(
    currentDrawdown,
    startingBalance
) {
    if (
        !Number.isFinite(currentDrawdown) ||
        !Number.isFinite(startingBalance) ||
        startingBalance <= 0
    ) {
        return null;
    }

    return (currentDrawdown / startingBalance) * 100;
}

function calculateRemainingLimit(
    limit,
    currentDrawdown
) {
    if (
        !Number.isFinite(limit) ||
        !Number.isFinite(currentDrawdown) ||
        limit < 0 ||
        currentDrawdown < 0
    ) {
        return null;
    }

    return Math.max(limit - currentDrawdown, 0);
}

function calculateRecovery(
    currentDrawdown,
    currentBalance
) {
    if (
        !Number.isFinite(currentDrawdown) ||
        !Number.isFinite(currentBalance) ||
        currentDrawdown <= 0
    ) {
        return 0;
    }

    if (currentBalance <= 0) {
        return null;
    }

    return (
        currentDrawdown / currentBalance
    ) * 100;
}

function updateDrawdownResults() {
    const message = document.querySelector(
        "#drawdown-message"
    );

    const startingBalance = getNumberValue(
        "#starting-balance"
    );

    const currentBalance = getNumberValue(
        "#current-balance"
    );

    const maximumDrawdown = getNumberValue(
        "#maximum-drawdown"
    );

    const dailyLossLimit = getNumberValue(
        "#daily-loss-limit"
    );

    if (
        startingBalance === null ||
        currentBalance === null ||
        maximumDrawdown === null ||
        dailyLossLimit === null
    ) {
        message.textContent =
            "Lengkapi input Drawdown terlebih dahulu.";

        message.dataset.type = "error";
        return;
    }

    if (
        startingBalance <= 0 ||
        currentBalance < 0 ||
        maximumDrawdown <= 0 ||
        dailyLossLimit <= 0
    ) {
        message.textContent =
            "Nilai Drawdown harus valid dan lebih besar dari 0.";

        message.dataset.type = "error";
        return;
    }

    const currentDrawdown = calculateDrawdown(
        startingBalance,
        currentBalance
    );

    const currentDrawdownPercent =
        calculateDrawdownPercent(
            currentDrawdown,
            startingBalance
        );

    const remainingDrawdown =
        calculateRemainingLimit(
            maximumDrawdown,
            currentDrawdown
        );

    const remainingDailyLoss =
        calculateRemainingLimit(
            dailyLossLimit,
            currentDrawdown
        );

    const recoveryNeeded =
        calculateRecovery(
            currentDrawdown,
            currentBalance
        );

    const currency =
        document.querySelector("#account-currency")?.value ||
        "USD";

    updateResult(
        "#current-drawdown-result",
        formatCurrency(currentDrawdown, currency)
    );

    updateResult(
        "#current-drawdown-percent-result",
        `${formatNumber(currentDrawdownPercent, 2)}%`
    );

    updateResult(
        "#remaining-drawdown-result",
        formatCurrency(remainingDrawdown, currency)
    );

    updateResult(
        "#remaining-daily-loss-result",
        formatCurrency(remainingDailyLoss, currency)
    );

    updateResult(
        "#recovery-needed-result",
        `${formatNumber(recoveryNeeded, 2)}%`
    );

    message.textContent =
        "Drawdown berhasil dihitung.";

    message.dataset.type = "success";
}

const calculateDrawdownButton =
    document.querySelector("#calculate-drawdown");

calculateDrawdownButton?.addEventListener(
    "click",
    updateDrawdownResults
);
function calculatePropFirmLimit(
    accountSize,
    percentage
) {
    if (
        !Number.isFinite(accountSize) ||
        !Number.isFinite(percentage) ||
        accountSize <= 0 ||
        percentage < 0
    ) {
        return null;
    }

    return accountSize * (percentage / 100);
}

function calculatePropRemainingLimit(
    limit,
    currentLoss
) {
    if (
        !Number.isFinite(limit) ||
        !Number.isFinite(currentLoss)
    ) {
        return null;
    }

    return Math.max(limit - currentLoss, 0);
}

function calculatePropRiskAmount(
    currentBalance,
    riskPerTradePercent
) {
    if (
        !Number.isFinite(currentBalance) ||
        !Number.isFinite(riskPerTradePercent) ||
        currentBalance <= 0 ||
        riskPerTradePercent <= 0
    ) {
        return null;
    }

    return currentBalance * (riskPerTradePercent / 100);
}

function calculateFullRiskTradesRemaining(
    remainingDailyLoss,
    remainingMaximumLoss,
    riskAmountPerTrade
) {
    if (
        !Number.isFinite(remainingDailyLoss) ||
        !Number.isFinite(remainingMaximumLoss) ||
        !Number.isFinite(riskAmountPerTrade) ||
        riskAmountPerTrade <= 0
    ) {
        return null;
    }

    const dailyTrades =
        Math.floor(
            remainingDailyLoss / riskAmountPerTrade
        );

    const maximumTrades =
        Math.floor(
            remainingMaximumLoss / riskAmountPerTrade
        );

    return Math.max(
        Math.min(dailyTrades, maximumTrades),
        0
    );
}

function updatePropFirmResults() {
    const message = document.querySelector(
        "#prop-firm-message"
    );

    const accountSize = getNumberValue(
        "#prop-account-size"
    );

    const dailyLossPercent = getNumberValue(
        "#prop-daily-loss-percent"
    );

    const maximumLossPercent = getNumberValue(
        "#prop-maximum-loss-percent"
    );

    const currentBalance = getNumberValue(
        "#prop-current-balance"
    );

    const riskPerTradePercent = getNumberValue(
        "#prop-risk-per-trade"
    );

    if (
        accountSize === null ||
        dailyLossPercent === null ||
        maximumLossPercent === null ||
        currentBalance === null ||
        riskPerTradePercent === null
    ) {
        message.textContent =
            "Lengkapi input Prop Firm terlebih dahulu.";

        message.dataset.type = "error";
        return;
    }

    if (
        accountSize <= 0 ||
        currentBalance < 0 ||
        dailyLossPercent <= 0 ||
        dailyLossPercent > 100 ||
        maximumLossPercent <= 0 ||
        maximumLossPercent > 100 ||
        riskPerTradePercent <= 0 ||
        riskPerTradePercent > 100
    ) {
        message.textContent =
            "Periksa kembali nilai Prop Firm yang dimasukkan.";

        message.dataset.type = "error";
        return;
    }

    const dailyLossLimit = calculatePropFirmLimit(
        accountSize,
        dailyLossPercent
    );

    const maximumLoss = calculatePropFirmLimit(
        accountSize,
        maximumLossPercent
    );

    const currentLoss = Math.max(
        accountSize - currentBalance,
        0
    );

    const remainingDailyLoss =
        calculatePropRemainingLimit(
            dailyLossLimit,
            currentLoss
        );

    const remainingMaximumLoss =
        calculatePropRemainingLimit(
            maximumLoss,
            currentLoss
        );

    const riskAmountPerTrade =
        calculatePropRiskAmount(
            currentBalance,
            riskPerTradePercent
        );

    const fullRiskTradesRemaining =
        calculateFullRiskTradesRemaining(
            remainingDailyLoss,
            remainingMaximumLoss,
            riskAmountPerTrade
        );

    const currency =
        document.querySelector("#account-currency")?.value ||
        "USD";

    updateResult(
        "#prop-daily-loss-result",
        formatCurrency(dailyLossLimit, currency)
    );

    updateResult(
        "#prop-maximum-loss-result",
        formatCurrency(maximumLoss, currency)
    );

    updateResult(
        "#prop-remaining-daily-result",
        formatCurrency(remainingDailyLoss, currency)
    );

    updateResult(
        "#prop-remaining-maximum-result",
        formatCurrency(remainingMaximumLoss, currency)
    );

    updateResult(
        "#prop-risk-amount-result",
        formatCurrency(riskAmountPerTrade, currency)
    );

    updateResult(
        "#prop-trades-remaining-result",
        fullRiskTradesRemaining === null
            ? "-"
            : formatNumber(fullRiskTradesRemaining, 0)
    );

    message.textContent =
        "Prop Firm Risk berhasil dihitung.";

    message.dataset.type = "success";
}

const calculatePropFirmButton =
    document.querySelector("#calculate-prop-firm");

calculatePropFirmButton?.addEventListener(
    "click",
    updatePropFirmResults
);
const authOpenButton = document.querySelector(
    "#auth-open-button"
);

const authDialog = document.querySelector(
    "#auth-dialog"
);

const authCloseButton = document.querySelector(
    "#auth-close-button"
);

const authGuestButton = document.querySelector(
    "#auth-guest-button"
);

const authForm = document.querySelector(
    "#auth-form"
);

authOpenButton?.addEventListener(
    "click",
    () => {
        authDialog?.showModal();
    }
);

authCloseButton?.addEventListener(
    "click",
    () => {
        authDialog?.close();
    }
);

authGuestButton?.addEventListener(
    "click",
    () => {
        authDialog?.close();
    }
);

authDialog?.addEventListener(
    "click",
    (event) => {
        if (event.target === authDialog) {
            authDialog.close();
        }
    }
);

authForm?.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();
    }
);
const authLoginButton = document.querySelector(
    "#auth-login-button"
);

const authRegisterButton = document.querySelector(
    "#auth-register-button"
);

const authMessage = document.querySelector(
    "#auth-message"
);

const authUserArea = document.querySelector(
    "#auth-user-area"
);

const authLogoutButton = document.querySelector(
    "#auth-logout-button"
);

const authProfileButton = document.querySelector(
    "#auth-profile-button"
);

const profileDialog = document.querySelector(
    "#profile-dialog"
);

const profileCloseButton = document.querySelector(
    "#profile-close-button"
);

const profileEmail = document.querySelector(
    "#profile-email"
);

const profileStatus = document.querySelector(
    "#profile-status"
);

const profileLogoutButton = document.querySelector(
    "#profile-logout-button"
);

const authEmailInput = document.querySelector(
    "#auth-email"
);

const authPasswordInput = document.querySelector(
    "#auth-password"
);

let supabaseClient = null;

function setAuthMessage(message, type = "info") {
    if (!authMessage) {
        return;
    }

    authMessage.textContent = message;
    authMessage.dataset.type = type;
}

function getAuthCredentials() {
    const email = authEmailInput?.value.trim() || "";
    const password = authPasswordInput?.value || "";

    if (!email || !password) {
        setAuthMessage(
            "Masukkan Email dan Password terlebih dahulu.",
            "error"
        );

        return null;
    }

    if (password.length < 8) {
        setAuthMessage(
            "Password harus memiliki minimal 8 karakter.",
            "error"
        );

        return null;
    }

    return {
        email,
        password
    };
}

function updateAuthUI(session) {
    const isLoggedIn = Boolean(session?.user);
    const userEmail = session?.user?.email || "";

    if (authOpenButton) {
        authOpenButton.hidden = isLoggedIn;
    }

    if (authUserArea) {
        authUserArea.hidden = !isLoggedIn;
    }

    if (profileEmail) {
        profileEmail.textContent =
            isLoggedIn ? userEmail : "Belum login";
    }

    if (profileStatus) {
        profileStatus.textContent =
            isLoggedIn
                ? "Status: Login aktif"
                : "Status: Guest";
    }

    if (authProfileButton && isLoggedIn) {
        authProfileButton.setAttribute(
            "title",
            userEmail
        );
    }
}

async function initializeSupabaseAuth() {
    if (
        !window.supabase ||
        !window.SUPABASE_CONFIG?.url ||
        !window.SUPABASE_CONFIG?.publishableKey
    ) {
        setAuthMessage(
            "Konfigurasi login belum lengkap.",
            "error"
        );

        return;
    }

    supabaseClient = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.publishableKey
    );

    const {
        data: sessionData
    } = await supabaseClient.auth.getSession();

    updateAuthUI(sessionData?.session);

    supabaseClient.auth.onAuthStateChange(
        (_event, session) => {
            updateAuthUI(session);
        }
    );
}

function getCaptchaToken() {
    return (
        document.querySelector(
            'input[name="cf-turnstile-response"]'
        )?.value || ""
    );
}

function resetCaptcha() {
    if (window.turnstile) {
        window.turnstile.reset();
    }
}

authLoginButton?.addEventListener(
    "click",
    async () => {
        const credentials = getAuthCredentials();

        if (!credentials) {
            return;
        }

        if (!supabaseClient) {
            setAuthMessage(
                "Login belum siap. Periksa konfigurasi Supabase.",
                "error"
            );

            return;
        }

        const captchaToken = getCaptchaToken();

        if (!captchaToken) {
            setAuthMessage(
                "Selesaikan verifikasi CAPTCHA terlebih dahulu.",
                "error"
            );

            return;
        }

        authLoginButton.disabled = true;
        setAuthMessage("Sedang login...");

        const {
            error
        } = await supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
            options: {
                captchaToken
            }
        });
        resetCaptcha();
        authLoginButton.disabled = false;

        if (error) {
            console.error("Login Supabase:", error);

            setAuthMessage(
                error.message,
                "error"
            );

            showToast(
                error.message,
                "error"
            );

            authDialog?.classList.remove("is-shaking");

            void authDialog?.offsetWidth;

            authDialog?.classList.add("is-shaking");

            return;
        }

        setAuthMessage(
            "Login berhasil.",
            "success"
        );

        showToast(
            "Login berhasil.",
            "success"
        );

        authDialog?.close();
    }
);

function getAuthRedirectUrl() {
    return (
        window.location.origin +
        window.location.pathname
    );
}

authRegisterButton?.addEventListener(
    "click",
    async () => {
        const credentials = getAuthCredentials();

        if (!credentials) {
            return;
        }

        if (!supabaseClient) {
            setAuthMessage(
                "Login belum siap. Periksa konfigurasi Supabase.",
                "error"
            );

            return;
        }
        const captchaToken = getCaptchaToken();

        if (!captchaToken) {
            setAuthMessage(
                "Selesaikan verifikasi CAPTCHA terlebih dahulu.",
                "error"
            );

            return;
        }

        authRegisterButton.disabled = true;
        setAuthMessage("Sedang membuat akun...");

        const {
            data,
            error
        } = await supabaseClient.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
                emailRedirectTo: getAuthRedirectUrl(),
                captchaToken
            }
        });
        resetCaptcha();
        authRegisterButton.disabled = false;

        if (error) {
            setAuthMessage(
                "Akun belum berhasil dibuat. Periksa kembali data kamu.",
                "error"
            );

            return;
        }

        if (!data.session) {
            setAuthMessage(
                "Akun berhasil dibuat. Cek email kamu untuk verifikasi.",
                "success"
            );

            return;
        }

        setAuthMessage(
            "Akun berhasil dibuat dan kamu sudah login.",
            "success"
        );

        authDialog?.close();
    }
);


initializeSupabaseAuth();

authProfileButton?.addEventListener(
    "click",
    () => {
        profileDialog?.showModal();
    }
);

profileCloseButton?.addEventListener(
    "click",
    () => {
        profileDialog?.close();
    }
);

profileDialog?.addEventListener(
    "click",
    (event) => {
        if (event.target === profileDialog) {
            profileDialog.close();
        }
    }
);

profileLogoutButton?.addEventListener(
    "click",
    async () => {
        if (!supabaseClient) {
            return;
        }

        const {
            error
        } = await supabaseClient.auth.signOut();

        if (error) {
            setAuthMessage(
                "Logout belum berhasil. Coba lagi.",
                "error"
            );

            return;
        }

        profileDialog?.close();
        authUserArea.hidden = true;
        authOpenButton.hidden = false;
    }
);
function resetCaptcha() {
    if (window.turnstile) {
        window.turnstile.reset();
    }

    const captchaInput = document.querySelector(
        'input[name="cf-turnstile-response"]'
    );

    if (captchaInput) {
        captchaInput.value = "";
    }
}
function clearAuthForm() {
    const authForm = document.querySelector("#auth-form");

    authForm?.reset();

    const passwordInput = document.querySelector(
        '#auth-form input[type="password"]'
    );

    if (passwordInput) {
        passwordInput.value = "";
    }

    resetCaptcha();

    setAuthMessage("");
}

window.addEventListener("pagehide", clearAuthForm);
window.addEventListener("pageshow", clearAuthForm);

authDialog?.addEventListener("close", clearAuthForm);

// ===== PASSWORD TOGGLE SHOW/HIDE (PURE SVG) =====
document.addEventListener("click", (e) => {
    const toggleBtn = e.target.closest("#auth-password-toggle");
    if (!toggleBtn) return;

    const passwordField = toggleBtn.closest(".password-field");
    const passwordInput = passwordField ? passwordField.querySelector("input") : document.querySelector("#auth-password");

    if (!passwordInput) return;

    const isPassword = passwordInput.type === "password";

    // 1. Switch Tipe Input (password <-> text)
    passwordInput.type = isPassword ? "text" : "password";

    // 2. Switch Icon SVG (Pakai Toggle Class hidden)
    const eyeOpen = toggleBtn.querySelector(".eye-open");
    const eyeClosed = toggleBtn.querySelector(".eye-closed");

    if (eyeOpen && eyeClosed) {
        eyeOpen.classList.toggle("hidden", isPassword);
        eyeClosed.classList.toggle("hidden", !isPassword);
    }

    // 3. Update Aksesibilitas & Focus
    toggleBtn.setAttribute("aria-pressed", isPassword ? "true" : "false");
    toggleBtn.setAttribute("aria-label", isPassword ? "Sembunyikan password" : "Tampilkan password");

    passwordInput.focus();
}); // <-- TARUH KODE BARU PATEN DI BAWAH TANDA INI

// ===== ENTER KEY TO SUBMIT LOGIN =====
authPasswordInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
        return;
    }

    event.preventDefault();

    authLoginButton?.click();
});
const toastContainer =
    document.querySelector("#toast-container");

function showToast(
    message,
    type = "info",
    duration = 3000
) {
    if (!toastContainer || !message) {
        return;
    }

    const toast = document.createElement("div");

    toast.className = "toast";
    toast.dataset.type = type;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("is-leaving");

        window.setTimeout(() => {
            toast.remove();
        }, 180);
    }, duration);
}

window.showToast = showToast;

function lockPageScroll() {
    document.body.style.overflow = "hidden";
}

function unlockPageScroll() {
    document.body.style.overflow = "";
}

authDialog?.addEventListener("show", lockPageScroll);
authDialog?.addEventListener("close", unlockPageScroll);

profileDialog?.addEventListener("show", lockPageScroll);
profileDialog?.addEventListener("close", unlockPageScroll);

const sidebarNavItems = [
    ...document.querySelectorAll(
        ".app-sidebar .nav-item[href^='#']"
    )
];

const sidebarSections = [
    ...document.querySelectorAll("main section[id]")
];

function showSidebarSection(targetId) {
    const visibleSections =
        targetId === "calculator-section"
            ? ["calculator-section", "results-section"]
            : [targetId];

    sidebarSections.forEach((section) => {
        section.hidden = !visibleSections.includes(section.id);
    });

    sidebarNavItems.forEach((item) => {
        const itemTarget =
            item.getAttribute("href")?.slice(1);

        const isActive =
            itemTarget === targetId;

        item.classList.toggle("is-active", isActive);

        if (isActive) {
            item.setAttribute("aria-current", "page");
        } else {
            item.removeAttribute("aria-current");
        }
    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

sidebarNavItems.forEach((item) => {
    item.addEventListener("click", (event) => {
        event.preventDefault();

        const targetId =
            item.getAttribute("href")?.slice(1);

        if (targetId) {
            showSidebarSection(targetId);
        }
    });
});

showSidebarSection("calculator-section");