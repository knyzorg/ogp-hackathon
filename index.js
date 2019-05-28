const express = require('express');
const app = express();
const { Client } = require('pg')
const port = process.env.PORT || 3000;
const config = process.env.DATABASE_URL ||  require('./config/config.js');
const client = new Client(config);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

client.connect((err)=>{
    if (err) {
        console.error('error connecting - ', err.stack)
    } else {
        console.log('connected');
    }
});

app.get('/trade/test', (req, res) => res.json({
    "message": "Hello, world!"
}));

app.get('/trade/years', async (req, res) =>{
    let {rows} = await client.query(`
        select distinct 
            year 
        from 
            trade 
        order by year;
    `);

    return res.json(rows.map((el) => +el.year));
});

app.get('/trade/summary/:year?', async (req, res) => {
    let year = req.params.year || 2018;
    let {rows} = await client.query(`
    select 
        country_code, country_description, country_type, value 
    from 
        country
    inner join trade 
        on trade.reporter_code = country.country_code
    inner join indicator 
        on indicator.indicator_code = trade.indicator_code
    where 
        indicator_description = 'Total merchandise' and year = ${year} and flow_code = 'X' and partner_code = 'WL'
    and 
        length(reporter_code) < 3 
    and 
        reporter_code != 'G7';`);

    res.json(rows);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));