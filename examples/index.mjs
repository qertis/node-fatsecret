import FatSecret from '../src/index.mjs'

const fatSecret = new FatSecret(
  'ACCESS_KEY',
  'SHARED_SECRET'
)

async function getRecipe(name) {
  const {recipes} = await fatSecret.request({
    method: 'recipes.search',
    search_expression: name,
    max_results: 1,
  })
  return recipes
}

async function getFood(name) {
  const {foods} = await fatSecret.request({
    method: 'foods.search',
    search_expression: name,
    max_results: 1,
  })
  return foods
}

(async function () {
  
  // getting recipe
  const {recipe} = await getRecipe('mango')
  console.log('recipes', recipe)
  
  // getting food
  const {food} = await getFood('mango')
  console.log('food', food)
  
})()
