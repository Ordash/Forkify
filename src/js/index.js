//GLOBAL CONTROLLER

// https://www.food2fork.com/api/search
// https://www.food2fork.com/api/get


import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.x = state;
/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    // 1. Get query from the view
    const query = searchView.getInput();

    if (query) {
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);


        try {
            // 4. Search for recipes
            await state.search.getResults();

            // 5. Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result)
        } catch (error) {
            console.log("No result")
            clearLoader();
        }
    }
}

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
    // 1. Get query from href recipeID
    const recipeId = window.location.hash.replace('#', '');

    if (recipeId) {
        // 2. prepare UI for recipe
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highligth selected
        if (state.search) searchView.highlightSelected(recipeId);

        // 2. Save new recipe to state
        state.recipe = new Recipe(recipeId);

        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            state.recipe.calcCookingTime();
            state.recipe.calcServings();
            // 4. render recipe details
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(recipeId));
        } catch (error) {
            console.log(`Recipe not found ${error}`);
        }
    }

}

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    if(!state.list) state.list = new List();

    // Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//TESTING
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());
/**
 * LIKE CONTROLLER
 */
const controlLikes = () => {
    if(!state.likes) state.likes = new Likes();
    const id = state.recipe.recipeID;
    // Delete from likes if exists

    if(!state.likes.isLiked(id)) {
        // Add to the state
        const newLike = state.likes.addLike(id, state.recipe.title, state.recipe.author, state.recipe.img);
        // Toggle the like button
        likesView.toggleLikeBtn(true)
        // Render liked recipe to liked list
        likesView.renderLike(newLike)
        //recipeView.like();
    } else {
        // Delete from state
        state.likes.deleteLike(id);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Delete from DOM
        likesView.deleteLike(id);
        // Change the heart to empty on UI


    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Handle delete and update list events
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Delete from DOM
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        let val = parseFloat(e.target.value, 10);
        // Update value in state
        if(val >= 0){
            state.list.updateCount(id, val);
        }
    }
});

// window.addEventListener('hashchange', controlRecipe);
 //window.addEventListener('load', controlRecipe);
// If there are multiple types of events we can iterate over them ->
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage)
    }
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    // The asterisk at the end means anychild so btn-decrease pus any of its child
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add Ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Add recipe to the liked recipes
        controlLikes();
    }
});

