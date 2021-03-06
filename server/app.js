const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const cookieParser = require('cookie-parser');
// const cors = require('cors');

require('dotenv').config();


const app = express();

// see: https://github.com/expressjs/cors#configuration-options
const corsOptions = {
	origin: `http://localhost:${process.env.GD_DEV_SERVER_PORT}`,
	credentials: true
};

app.use(cookieParser());

const server = new ApolloServer({
	typeDefs,
	resolvers,
	// cors: corsOptions,
	context: ({ req, res }) => {

		// try to retrieve a user with the token
		// const user = getUser(token);
		//
		// // add the user to the context
		// return { user };

		// provides the auth token to all resolvers, plus access to the original request + response objects for
		// more fine-tune stuff
		return {
			res,
			req,
			token: (req.headers.authorization || '').replace('Bearer ', '')
		};
	}
});


server.applyMiddleware({
	app,
	cors: corsOptions
});

app.listen(process.env.GD_API_SERVER_PORT, () => {
	console.log('Server started on port ' + process.env.GD_API_SERVER_PORT);
});
