const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const { buildSchema } = require('graphql')
const { MongoClient } = require('mongodb')

const app = express()

app.use(bodyParser.json())

const context = async () => {
    let client = await MongoClient.connect(
            'mongodb://localhost:27017/local', 
            { useNewUrlParser: true, useUnifiedTopology: true  })
    return client
}

const schema = buildSchema(`
type Resturant {
    id : ID
    name: String
    neighborhood: String
    address: String
    cuisine_type: String
    latlng : LatLang
    reviews: [Review]
    hours: Hours
}

type LatLang {
    lat: String
    lng: String
}

type Review {
    name: String
    date: String
    rating: String
    comments: String
}

type Hours {
    Monday: String
    Tuesday: String
    Wednesday: String
    Thursday: String
    Friday: String
    Saturday: String
    Sunday: String
}

type resturants {
    resturants(cuisine_type: String): [Resturant]
}

schema {
    query: resturants
}
`)

const resolvers = {
    resturants: async (args, context) => {
        const client = await context()
        let cuisine_type = args.cuisine_type
        console.log('cuisine_type : ', cuisine_type)
        let results = await client.db().collection('resturants').find({'cuisine_type':cuisine_type}).toArray()
        return results
        }
}

app.use("/graphql", graphqlHttp({
    schema,
    rootValue: resolvers,
    graphiql: true,
    context
}))

app.listen(3010, () => {
    console.log('App started !')
})
