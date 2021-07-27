const restaurantsService = require("./restaurants.service.js");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function restaurantExists(req, res, next) {
  const { restaurantId } = req.params;

  const restaurant = await restaurantsService.read(restaurantId);

  if (restaurant) {
    res.locals.restaurant = restaurant;
    return next();
  }
  next({ status: 404, message: `Restaurant cannot be found.` });
}

function validateRestaurant(req, res, next){
  const { restaurant_name, cuisine, address } = req.body.data;
  if(!(restaurant_name && cuisine && address) || Object.keys(req.body.data).length > 3){//!restaurant_name || !cuisine || !address){
    console.log(req.body.data);
    return next({ status: 400, message: `restaurant_name, cuisine, address invalid, not_supported`});
  }
 return next();
}

async function list(req, res, next) {
  const data = await restaurantsService.list();
  res.json({ data });
}

async function create(req, res, next) {
  // your solution here
  restaurantsService
    .create(req.body.data)
    .then((data) => {
      res.status(201).json({
        data: {
          cuisine: data[0].cuisine,
          restaurant_name: data[0].restaurant_name,
          address: data[0].address,
        },
      });
    })
    .catch(next);
}

async function update(req, res, next) {
  const updatedRestaurant = {
    ...res.locals.restaurant,
    ...req.body.data,
    restaurant_id: res.locals.restaurant.restaurant_id,
  };

  const data = await restaurantsService.update(updatedRestaurant);

  res.json({ data });
}

async function destroy(req, res, next) {
  // your solution here
  const { restaurantId } = req.params;
  restaurantsService
  .delete(restaurantId)
  .then(data => {
    console.log(data);
    res.status(204).json({ data })
  })
  .catch(next);
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [validateRestaurant, asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(restaurantExists), asyncErrorBoundary(destroy)],
};
