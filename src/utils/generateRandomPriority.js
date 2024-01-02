// Function to generate a random priority
const generateRandomPriority = () => {
    const random = Math.floor(Math.random() * 100000000000000000000);
    return random;
}

module.exports = generateRandomPriority;