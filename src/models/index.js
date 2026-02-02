import User from './User.js';
import Plan from './Plan.js';
import Category from './Category.js';
import City from './City.js';
import Listing from './Listing.js';
import Subscription from './Subscription.js';
import Payment from './Payment.js';

// Relacionamentos

// User -> Plan
User.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Plan.hasMany(User, { foreignKey: 'plan_id', as: 'users' });

// User -> Subscription
User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Subscription -> Plan
Subscription.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });
Plan.hasMany(Subscription, { foreignKey: 'plan_id', as: 'subscriptions' });

// Subscription -> Payment
Subscription.hasMany(Payment, { foreignKey: 'subscription_id', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'subscription' });

// User -> Payment
User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Listing -> User
Listing.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Listing, { foreignKey: 'user_id', as: 'listings' });

// Listing -> Category
Listing.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Listing, { foreignKey: 'category_id', as: 'listings' });

// Listing -> City
Listing.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
City.hasMany(Listing, { foreignKey: 'city_id', as: 'listings' });

// Category -> Category (subcategorias)
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

export {
  User,
  Plan,
  Category,
  City,
  Listing,
  Subscription,
  Payment
};
