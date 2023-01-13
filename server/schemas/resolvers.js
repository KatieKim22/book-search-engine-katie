const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const newUser = await User.findOne({ _id: context.user_id }).select('-__v -password')
                return newUser;
            }
            throw new AuthenticationError('You need to be logged in!')
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });


            if (!user) {
                throw new AuthenticationError('No user with this email!');
            }

            const correctPw = await User.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!')
            }

            const token = singleToken(user);
            return { token, user };
        },
        addUser: async (parent, { email, password }) => {

            const user = await User.create({ email, password });
            const token = singleToken(user);

            return { token, user };

        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                )
                return updatUser;
            } throw new AuthenticationError('You need to be logged in!')
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
               const updateUser= await User.findOneAndUpdate(
                    { _id: context.user_id },
                    { $pull: { savedBooks: {bookId} } },
                    { new: true }
                )
                return updateUser
            }
            throw new AuthenticationError('You need to be logged in!')
        }
    }
}



module.exports = resolvers;