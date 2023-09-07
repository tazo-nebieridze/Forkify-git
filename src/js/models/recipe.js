import axios from "axios";

export default class Recipe {
    constructor(id){
        this.id = id;
    }
    async getRecipe(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title
            this.author = res.data.recipe.publisher
            this.img = res.data.recipe.image_url
            this.url = res.data.recipe.source_url
            this.ingredients = res.data.recipe.ingredients  
        } catch (error) {
            alert("error");
        }
        
    }
    
    calcTime(){
        const numIng = this.ingredients.length
        const periods = Math.ceil(numIng/3) 
        this.time = periods * 15; 
    }

    calcServing(){
        this.servings = 4;
    }

    parseIngredients(){
        const newIngredients = this.ingredients.map(el => {
            const unitLong = ["tablespoons",'tablespoon','ounce','ounces','teaspoons','teaspoon','cups'];
            const unitShorts = ['tbsp','tbsp','oz','oz','tsp','tsp','cup'];
            const units = [...unitShorts, 'kg','g','pound'];

            // 1. uniform unit
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit, i)=>{
                ingredient = ingredient.replace(unit, unitShorts[i]);
            })
            // 2. remove frchxilebi
            ingredient = ingredient.replace(/ *\([^)]*\)*/g," ")
            // 3. parse ingredients into count, unit and ingredient
            const arrIngr = ingredient.split(' ');
            const unitIndex = arrIngr.findIndex(value => units.includes(value))

            let objIng;
            if(unitIndex > -1){
                // there is unit 
                const arrCount = arrIngr.slice(0,unitIndex);
                let count;
                if(arrCount.length == 1){
                    count = eval(arrIngr[0]);
                } else{
                    count = eval(arrCount.join('+'))
                }
                objIng = {
                    count,
                    unit: arrIngr[unitIndex],
                    ingredient: arrIngr.slice(unitIndex+1).join(' ')
                }

            } else if(parseInt(arrIngr[0],10)){
                objIng = {
                    count: +arrIngr[0],
                    unit: "",
                    ingredient: arrIngr.slice(1).join(' ')
                }
            } else if(unitIndex == -1){
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                } 
            }
            return objIng;
        })
        this.ingredients = newIngredients; 
    }
    updateServings(type){
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1
        
        this.ingredients.forEach(ing => ing.count *= (newServings / this.servings) )
        this.servings = newServings
    }
}