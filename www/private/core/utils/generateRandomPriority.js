// Function to generate a random priority
const generateRandomPriority = async () => {
    const random = Math.floor(Math.random() * 100000000000000000000);
    console.log(random);
    return random;
}

module.exports = generateRandomPriority;