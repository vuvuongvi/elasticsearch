const express = require('express');
const request = require('request');
const ejs = require('ejs')
const bodyParser  = require('body-parser')
const app = express();
app.set('view engine', 'ejs')
app.set('views','./views')
app.use(bodyParser.json());
app.use(bodyParser({limit: '4MB'}))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const es = require('elasticsearch');
const client = new es.Client({
    host: 'http://172.16.30.7:9200/',
    log: 'trace'
})
// client.indices.create({
//     index: 'finviet-test'
// }, (error, response, status) => {
//     if(error) {
//         console.log(error)
//     } else {
//         console.log("created a new index", response);
//     }
// })
client.ping({
    requestTimeout: 30000,
}, error =>{
    if(error) {
        console.error('Elasticsearch cluster is down!')
    } else {
        console.log('Everything is ok');
    }
})

const doSearch = ((req, res) => {
    let name = req.res.req.query.param1
    return client.search({
        index: 'finviet',
        type: 'ecom_product',
        body: {
            query: {
                match: {
                    name: name
                }
            }
        }
    })
})

app.get('/', function(req, res) {
    res.render('index', {hits: 0});
});
app.get('/search', (req, res) => {
    doSearch(req, res)
        .then((resp) => {
            let hits = resp.hits.hits,
                total = resp.hits.total;
            console.log(hits)
            console.log(total);
            res.render('index', {hits: JSON.stringify(hits)});
        }, err => {
            console.trace(err.message);
        })
})

const PORT = 5000;
app.listen(PORT, ()=> {
    console.log("Server đang chạy trên PORT" + PORT)
})
