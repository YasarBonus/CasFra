<!DOCTYPE html>
<html>
<body>
    <h2>Calculate Bonus</h2>
    <form>
        <label for="input">Pay In:</label>
        <input type="number" id="input" oninput="calculateBonus()" step="any">
    </form>
    <p>Credit: <span id="credit">0</span> €</p>
    <p>Bonus: <span id="bonus">0</span> €</p>
    <p>Wager: <span id="wager">0</span> €</p>
    
    <script>
        function calculateBonus() {



            var url_string = window.location;
            var url = new URL(url_string);
            var bonus = url.searchParams.get("bonus");
            var maxBonus = url.searchParams.get("maxbonus");
            var wager = url.searchParams.get("wager");
            var wagerType = url.searchParams.get("wagertype");
            console.log (wagerType);

            /*var bonus = 150;
            var maxBonus = 600;
            var wager = 40;
            var wagerType = "B"*/

            var input = parseFloat(document.getElementById("input").value);


            /*var wager = wager.replace(/[\(\)x]/g, '');
            var wager = wager.split(' ');
            var wagerType = wager[1];
            var wager = wager[0];*/

            var credit = input * (bonus / 100);

            if (credit > maxBonus) {
                credit = maxBonus;
            }
            var credit = credit + input;
            document.getElementById("credit").textContent = credit;

            if (wagerType == "1") {
                var wager = credit * wager;
            }

            var bonus = credit - input;
            document.getElementById("bonus").textContent = bonus;

            if (wagerType == "2") {
                var wager = bonus * wager;
            }
            document.getElementById("wager").textContent = wager;




        }
    </script>
</body>
</html>
