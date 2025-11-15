export const formatINR = (value) => {
    if (value == null || isNaN(Number(value))) return '₹0.00';
    try {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));
    } catch (e) {
        return `₹${Number(value).toFixed(2)}`;
    }
};

export default formatINR;
