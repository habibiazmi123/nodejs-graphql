const graphql = require('graphql');
const bcrypt = require('bcrypt');
const ProductType = require('./TypeDefs/ProductType');
const OrderType = require('./TypeDefs/OrderType');

const { Product } = require('../models/products');
const { Order } = require('../models/orders');
const { User } = require('../models/users');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
} = graphql;

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        getAllProduct: {
            type: new GraphQLList(ProductType),
            args: { id: { type: GraphQLString } },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error("Unauthenticated");
                }

                const productList = await Product.find();
                return productList;
            }
        },

        getProduct: {
            type: ProductType,
            args: { id: { type: GraphQLString } },
            async resolve(parent, args) {
                const product = await Product.find(args.id);
                return product;
            }
        },

        getAllOrders: {
            type: new GraphQLList(OrderType),
            args: { id: { type: GraphQLString } },
            async resolve(parent, args, req) {
                if (!req.isAuth) {
                    throw new Error("Unauthenticated");
                }
                const orderList = await Order.find({ userId: args.id });
                return orderList;
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        createProduct: {
            type: ProductType,
            args: {
                brand: { type: GraphQLString },
                category: { type: GraphQLString },
                description: { type: GraphQLString },
                discountPercentage: { type: GraphQLFloat },
                images: { type: GraphQLString },
                price: { type: GraphQLFloat },
                rating: { type: GraphQLFloat },
                stock: { type: GraphQLInt },
                thumbnail: { type: GraphQLString },
                title: { type: GraphQLString },
            },
            async resolve(parent, args, req) {
                const newProduct = new Product({
                    title: args.title,
                    brand: args.brand,
                    category: args.category,
                    description: args.description,
                    discountPercentage: args.discountPercentage,
                    images: args.images,
                    price: args.price,
                    rating: args.rating,
                    stock: args.stock,
                    thumbnail: args.thumbnail,
                });

                await newProduct.save();

                return newProduct;
            }
        },

        updateProduct: {
            type: ProductType,
            args: {
                id: { type: GraphQLString },
                brand: { type: GraphQLString },
                category: { type: GraphQLString },
                description: { type: GraphQLString },
                discountPercentage: { type: GraphQLFloat },
                images: { type: GraphQLString },
                price: { type: GraphQLFloat },
                rating: { type: GraphQLFloat },
                stock: { type: GraphQLInt },
                thumbnail: { type: GraphQLString },
                title: { type: GraphQLString },
            },
            async resolve(parent, args, req) {
                const newProduct = await Product.findByIdAndUpdate(args.id, {
                    title: args.title,
                    brand: args.brand,
                    category: args.category,
                    description: args.description,
                    discountPercentage: args.discountPercentage,
                    images: args.images,
                    price: args.price,
                    rating: args.rating,
                    stock: args.stock,
                    thumbnail: args.thumbnail,
                });

                return newProduct;
            }
        },

        deleteProduct: {
            type: ProductType,
            args: {
                id: { type: GraphQLString },
            },
            async resolve(parent, args) {
                await Product.findByIdAndDelete(args.id);

                return args.id;
            }
        },

        createOrder: {
            type: GraphQLString,
            args: {
                userId: { type: GraphQLString },
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                address: { type: GraphQLString },
                city: { type: GraphQLString },
                country: { type: GraphQLString },
                zipCode: { type: GraphQLString },
                totalAmount: { type: GraphQLFloat },
                items: { type: GraphQLString },
            },
            async resolve(parent, args, req) {
                const newOrder = new Order({
                    userId: args.userId,
                    firstName: args.firstName,
                    lastName: args.lastName,
                    address: args.address,
                    city: args.city,
                    country: args.country,
                    zipCode: args.zipCode,
                    totalAmount: args.totalAmount,
                    items: args.items,
                    createdDate: new Date().toLocaleDateString(),
                });

                await newOrder.save();
                const data = {
                    message: "success",
                };

                return JSON.stringify(data);
            }
        },

        createUser: {
            type: GraphQLString,
            args: {
                username: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString },
                isAdmin: { type: GraphQLBoolean },
            },
            async resolve(parent, args) {
                const newUser = new User({
                    username: args.username,
                    email: args.email,
                    password: args.password,
                    isAdmin: args.isAdmin,
                });

                const user = await User.findOne({ email: newUser.email });
                if (user) {
                    throw new Error("Already in db")
                }

                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(newUser.password, salt);

                await newUser.save();
                const token = newUser.generateAuthToken();

                const data = {
                    token: token,
                    id: newUser.id,
                    isAdmin: newUser.isAdmin
                }
                return JSON.stringify(data);
            }
        },

        loginUser: {
            type: GraphQLString,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args) {
                const user = await User.findOne({ email: args.email });
                if (!user) {
                    throw new Error("Not user with that email")
                }

                const validPassword = await bcrypt.compare(args.password,user.password);
                if (!validPassword) {
                    throw new Error("Invalid password");
                }

                const token = user.generateAuthToken()
                const data = {
                    token: token,
                    userId: user.id,
                    isAdmin: user.isAdmin
                };
                return JSON.stringify(data);
            }
        }
    },
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});