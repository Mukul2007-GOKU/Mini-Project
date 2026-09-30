// ===============================
// RECIPE FINDER - FINAL JAVASCRIPT
// ===============================

const API_URL =
    "https://www.themealdb.com/api/json/v1/1";

// Current recipes
let currentMeals = [];

// Cart
let cart = JSON.parse(localStorage.getItem("recipeCart")) || [];


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    showHome();
    loadDefaultRecipes();
});


// ===============================
// LOAD DEFAULT RECIPES
// ===============================

async function loadDefaultRecipes() {

    const recipesDiv = document.getElementById("recipes");

    recipesDiv.innerHTML = `
        <div class="loading">
            <h2>🍽️ Loading delicious recipes...</h2>
        </div>
    `;

    try {

        // Load some popular searches
        const searches = [
            "chicken",
            "pasta",
            "pizza",
            "beef"
        ];

        let allMeals = [];

        for (let search of searches) {

            const response = await fetch(
                `${API_URL}/search.php?s=${search}`
            );

            const data = await response.json();

            if (data.meals) {
                allMeals = allMeals.concat(data.meals);
            }
        }

        // Remove duplicate meals
        const uniqueMeals = [];

        allMeals.forEach(meal => {

            if (
                !uniqueMeals.some(
                    item => item.idMeal === meal.idMeal
                )
            ) {
                uniqueMeals.push(meal);
            }

        });

        displayRecipes(uniqueMeals.slice(0, 20));

    } catch (error) {

        console.error(error);

        recipesDiv.innerHTML = `
            <div class="error">
                <h2>❌ Unable to load recipes</h2>
                <p>Please check your internet connection.</p>
            </div>
        `;
    }
}


// ===============================
// SEARCH RECIPE
// ===============================

async function searchRecipe() {

    const input =
        document.getElementById("recipeSearch");

    const searchText =
        input.value.trim();

    if (searchText === "") {

        loadDefaultRecipes();
        return;
    }

    const recipesDiv =
        document.getElementById("recipes");

    recipesDiv.innerHTML = `
        <div class="loading">
            <h2>🔍 Searching for "${searchText}"...</h2>
        </div>
    `;

    try {

        // Search by meal name
        const response = await fetch(
            `${API_URL}/search.php?s=${encodeURIComponent(searchText)}`
        );

        const data = await response.json();

        let meals = data.meals || [];


        // ===============================
        // INGREDIENT SEARCH FALLBACK
        // ===============================

        if (meals.length === 0) {

            const ingredientResponse = await fetch(
                `${API_URL}/filter.php?i=${encodeURIComponent(searchText)}`
            );

            const ingredientData =
                await ingredientResponse.json();

            if (ingredientData.meals) {

                const filteredMeals =
                    ingredientData.meals.slice(0, 12);

                // Filter endpoint gives limited data,
                // so get complete meal details
                const details = await Promise.all(

                    filteredMeals.map(async meal => {

                        const detailResponse =
                            await fetch(
                                `${API_URL}/lookup.php?i=${meal.idMeal}`
                            );

                        const detailData =
                            await detailResponse.json();

                        return detailData.meals
                            ? detailData.meals[0]
                            : null;
                    })

                );

                meals = details.filter(Boolean);
            }
        }


        // ===============================
        // NO RESULTS
        // ===============================

        if (meals.length === 0) {

            recipesDiv.innerHTML = `
                <div class="no-results">
                    <h2>😕 No recipes found</h2>
                    <p>
                        Try searching:
                        chicken, pasta, pizza, beef, seafood
                    </p>
                </div>
            `;

            return;
        }


        // Show results
        displayRecipes(meals);

    } catch (error) {

        console.error(error);

        recipesDiv.innerHTML = `
            <div class="error">
                <h2>❌ Something went wrong</h2>
                <p>Please try again.</p>
            </div>
        `;
    }
}


// ===============================
// ENTER KEY SEARCH
// ===============================

function handleSearch(event) {

    if (event.key === "Enter") {

        searchRecipe();

    }
}


// ===============================
// DISPLAY RECIPES
// ===============================

function displayRecipes(meals) {

    currentMeals = meals;

    const recipesDiv =
        document.getElementById("recipes");

    recipesDiv.innerHTML = "";


    meals.forEach(meal => {

        const card =
            document.createElement("div");

        card.className = "recipe";


        card.innerHTML = `

            <img
                src="${meal.strMealThumb}"
                alt="${meal.strMeal}"
            >

            <div class="recipe-info">

                <h2>${meal.strMeal}</h2>

                <p>
                    <strong>Category:</strong>
                    ${meal.strCategory || "Food"}
                </p>

                <p>
                    <strong>Area:</strong>
                    ${meal.strArea || "International"}
                </p>

                <button
                    onclick="addToCart('${meal.idMeal}')"
                    class="cart-btn"
                >
                    🛒 Add to Cart
                </button>

            </div>

        `;


        recipesDiv.appendChild(card);

    });
}


// ===============================
// ADD TO CART
// ===============================

function addToCart(mealId) {

    const meal =
        currentMeals.find(
            item => item.idMeal === mealId
        );

    if (!meal) {
        return;
    }


    const existingItem =
        cart.find(
            item => item.id === meal.idMeal
        );


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            id: meal.idMeal,

            name: meal.strMeal,

            image: meal.strMealThumb,

            category:
                meal.strCategory || "Food",

            area:
                meal.strArea || "International",

            quantity: 1

        });

    }


    saveCart();

    updateCartCount();

    // Open cart automatically
    showCart();
}


// ===============================
// SAVE CART
// ===============================

function saveCart() {

    localStorage.setItem(
        "recipeCart",
        JSON.stringify(cart)
    );

}


// ===============================
// UPDATE CART COUNT
// ===============================

function updateCartCount() {

    const cartCount =
        document.getElementById("cartCount");

    if (!cartCount) return;


    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    cartCount.textContent =
        totalItems;

}


// ===============================
// SHOW HOME
// ===============================

function showHome() {

    const homePage =
        document.getElementById("homePage");

    const cartPage =
        document.getElementById("cartPage");


    homePage.style.display = "block";

    cartPage.style.display = "none";

}


// ===============================
// SHOW CART
// ===============================

function showCart() {

    const homePage =
        document.getElementById("homePage");

    const cartPage =
        document.getElementById("cartPage");


    homePage.style.display = "none";

    cartPage.style.display = "block";


    displayCart();

}


// ===============================
// DISPLAY CART
// ===============================

function displayCart() {

    const cartDiv =
        document.getElementById("cart");


    if (cart.length === 0) {

        cartDiv.innerHTML = `

            <div class="empty-cart">

                <h2>🛒 Your cart is empty</h2>

                <p>
                    Go to Home and add some
                    delicious recipes!
                </p>

                <button
                    onclick="showHome()"
                >
                    🏠 Go to Home
                </button>

            </div>

        `;

        return;
    }


    cartDiv.innerHTML = "";


    cart.forEach(item => {

        const cartItem =
            document.createElement("div");

        cartItem.className =
            "cart-item";


        cartItem.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="cart-details">

                <h2>${item.name}</h2>

                <p>
                    ${item.category}
                    •
                    ${item.area}
                </p>


                <div class="quantity">

                    <button
                        onclick="decreaseQuantity('${item.id}')"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity('${item.id}')"
                    >
                        +
                    </button>

                </div>


                <button
                    onclick="removeFromCart('${item.id}')"
                    class="remove-btn"
                >
                    ❌ Remove
                </button>

            </div>

        `;


        cartDiv.appendChild(cartItem);

    });

}


// ===============================
// INCREASE QUANTITY
// ===============================

function increaseQuantity(id) {

    const item =
        cart.find(
            item => item.id === id
        );


    if (item) {

        item.quantity++;

        saveCart();

        updateCartCount();

        displayCart();

    }

}


// ===============================
// DECREASE QUANTITY
// ===============================

function decreaseQuantity(id) {

    const item =
        cart.find(
            item => item.id === id
        );


    if (!item) return;


    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart =
            cart.filter(
                item => item.id !== id
            );

    }


    saveCart();

    updateCartCount();

    displayCart();

}


// ===============================
// REMOVE FROM CART
// ===============================

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );


    saveCart();

    updateCartCount();

    displayCart();

}

// ===============================
// SHOW RECIPES PAGE
// ===============================

function showRecipes() {

    document.getElementById("homePage").style.display = "none";

    document.getElementById("recipesPage").style.display = "block";

    document.getElementById("cartPage").style.display = "none";

    // If recipes are not loaded yet
    if (currentMeals.length === 0) {
        loadDefaultRecipes();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ===============================
// HOME SEARCH
// ===============================

function homeSearch() {

    const input =
        document.getElementById("homeSearch");

    const searchText =
        input.value.trim();

    if (searchText === "") {

        showRecipes();

        return;
    }

    // Put same text into navbar search
    document.getElementById("recipeSearch").value =
        searchText;

    showRecipes();

    searchRecipe();
}


// ===============================
// HOME SEARCH ENTER
// ===============================

function handleHomeSearch(event) {

    if (event.key === "Enter") {

        homeSearch();

    }
}


// ===============================
// CATEGORY SEARCH
// ===============================

function searchByCategory(category) {

    document.getElementById("recipeSearch").value =
        category;

    showRecipes();

    searchRecipe();
}