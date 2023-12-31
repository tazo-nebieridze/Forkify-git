import { elements } from "./base"

export const getInput = () =>   elements.searchInput.value;
 
export const clearInput = () => elements.searchInput.value = "";

export const clearResult = () => {
    elements.searchResultList.innerHTML = '';
    elements.searchResultPages.innerHTML = '';
}

export const highLightSelected = id => {
    const resultsArr = [...document.querySelectorAll('.results__link')]
    resultsArr.forEach(el => el.classList.remove("results__link--active"))
    document.querySelector(`.results__link[href='#${id}']`).classList.add("results__link--active")
}

export const limitRecipeTitle = (title , limit = 17) =>{
    const newTitle = [];

    if(title.length > limit){
        title.split(' ').reduce((acc, cur)=>{
            if(acc+cur.length <= limit){
                newTitle.push(cur);
            }
            return acc + cur.length
        },0) 
        return `${newTitle.join(' ')}...`
    } 
    return title;
}


const renderRecipe = recipe =>{
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `
    elements.searchResultList.insertAdjacentHTML("beforeend",markup);
}

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto="${type === 'prev' ? page-1 : page+1}">
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>

`

const renderButton = (page, numResults, resPerPage)=>{

    const pages = Math.ceil(numResults / resPerPage);
    let button;
    if(page == 1 && pages > 1){
        // only next button
        button = createButton(page, 'next')
        console.log('next')
        console.log(page)

    }else if(page < pages){
        // both button
        button = `${createButton(page, 'prev')} ${createButton(page, 'next')}`
        console.log('both')
        console.log(page)

    }else if(page == pages && page > 1){
        //only preview button 
        button = createButton(page, 'prev')
        console.log('last')
        console.log(page)

    }
    elements.searchResultPages.insertAdjacentHTML('afterbegin',button)
}

export const renderResult = (recipes, page = 1, resPerPage = 5 ) =>{
    // render results of current page
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);

    // render pagination buttons
    renderButton(page, recipes.length, resPerPage)

}