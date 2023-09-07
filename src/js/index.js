// Global app controller
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesViewe"
import { clearLoader, elements, renderLoader } from "./views/base";
import Search from "./models/search";
import Recipe from "./models/recipe";
import List from "./models/list";
import Likes from "./models/like";

const state = {};
window.state = state;
//  search controler
const controlSearch = async () =>{
    const query = searchView.getInput();
    if(query){
        state.search = new Search(query);
        searchView.clearInput();
        searchView.clearResult();
        renderLoader(elements.searchResultList)
        try {
            await state.search.getResults();
            clearLoader()
            searchView.renderResult(state.search.result);
        } catch (error) {
            alert("error");
        }
    }
}
elements.searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    controlSearch();
})

elements.searchResultPages.addEventListener('click',(e)=>{
    const btn = e.target.closest('.btn-inline');

    if(btn){
        const gotoPage = +btn.dataset.goto;
        searchView.clearResult()
        searchView.renderResult(state.search.result, gotoPage)
    }
})

const controlRecipe= async () => {
    // get id from url
    const id = window.location.hash.replace('#','');
    console.log(id);
    if(id){
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // focus on active recipe
        if(state.search) searchView.highLightSelected(id);

        state.recipe = new Recipe(id);
        try {
            await state.recipe.getRecipe(); 
            state.recipe.parseIngredients();
            // calc servings and time
            state.recipe.calcTime();
            state.recipe.calcServing();



            clearLoader()

            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id))
        } catch (error) {
            alert("error");
        }
    }
}
window.addEventListener('load',() =>{
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage()

    likesView.toggleMenu(state.likes.getNumLikes());

    // render the past likes
    state.likes.likes.forEach(el => likesView.renderLike(el))

})


window.addEventListener('hashchange',controlRecipe)
window.addEventListener('load',controlRecipe)
// shoping list controler
const controllerList = () =>{
    // create new list
    state.list = new List();
    // add each ingredient
    state.recipe.ingredients.forEach(ing =>{
        const item = state.list.addItems(ing.count, ing.unit, ing.ingredient);
        listView.renderItem(item);
    })
}

elements.shopping.addEventListener('click', e =>{
    const id = e.target.closest('.shopping__item').dataset.itemid
    console.log(id);
    if(e.target.matches(".shopping__delete, .shopping__delete *")){
        // delete from state
        state.list.deleteItem(id);
        // delete from UI
        listView.deleteItem(id);
    } else if(e.target.matches(".shopping__count-value")){
        // update
        const val = +e.target.value;
        state.list.updateCount(id, val)

    }
})

// like controller

const controllerLike = () =>{
    if(!state.likes)state.likes = new Likes();
    const currentId = state.recipe.id;
    if(!state.likes.isLiked(currentId)) {
        // add like
        const newLikes = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        // toggle to the button
        likesView.toggleLikeBtn(true)
        
        // add to likes page
        likesView.renderLike(newLikes)
    } else {
        // remove like
        state.likes.deleteLike(currentId);

        // toggle to the button
        likesView.toggleLikeBtn(false)
        // delete from likes page
        likesView.deleteLikes(currentId)
    }
    likesView.toggleMenu(state.likes.getNumLikes());
}

// + - button click...

elements.recipe.addEventListener('click',(e)=>{
    if(e.target.matches(".btn-decrease, .btn-decrease *")){
        // - button
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe)
        }
        
    } else if(e.target.matches(".btn-increase, .btn-increase *")){
        // + button
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)

    } else if(e.target.matches(".recipe__love, .recipe__love *")){
        // like button
        controllerLike()
    } else if(e.target.matches(".recipe__btn__add, .recipe__btn__add *")){
        // shoping list
        controllerList();
    }
})