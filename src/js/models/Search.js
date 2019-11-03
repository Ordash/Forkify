import axios from 'axios';
import * as config from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        console.log(`${config.chuckNorris.searchUrl}?query=${this.query}`);
        try {
            const res = await axios.get(
                `${config.chuckNorris.searchUrl}?query=${this.query}`, config.chuckNorris.headers);
            //const res = await axios(`${config.proxy}https://www.food2fork.com///api/search?key=${config.recipeKey}&q=${this.query}`);

            this.result = res.data.result;
            //console.log(this.result);
        } catch (error) {
            console.log(error);
        }
    }
}