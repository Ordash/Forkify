import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
}

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
}

const renderRecipe = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.id}">
                <figure class="results__fig">
                    <img src="${recipe.icon_url}" alt="Test">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${shortenString(recipe.value)}</h4>
                    <p class="results__author">The Pioneer Woman</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
}

/**
 * Shortens the string to longest word array what is below the limit
 * @param {*} string
 * @param {*} limit
 */
const shortenString = (string, limit = 17) => {
    const newString = [];
    if (string.length > limit) {
        string.split(' ').reduce((acc, cur) => {
            if (acc + cur.length <= limit) {
                newString.push(cur);
            }
            return acc + cur.length;
        }, 0);

        return `${newString.join(' ')}...`;
    }
    return string;
}

const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
    </button>
`;

const renderButtons = (page, numResults, resPerPages) => {
    const pages = Math.ceil(numResults / resPerPages);

    let button;
    if (page === 1 && pages > 1) {
        // Only button to go to next page
        button = createButton(page, 'next');
    } else if (page < pages) {
        // Both
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    } else if (page === pages && pages > 1) {
        // Only button to go the prev
        button = createButton(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button)
}

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);

    renderButtons(page, recipes.length, 5);
}
