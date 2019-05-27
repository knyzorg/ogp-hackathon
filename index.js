const express = require('express');
const app = express();
const { Client } = require('pg')
const port = process.env.PORT || 3000;
const config = require('./config/config.js');
const client = new Client(config);

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

app.get('/trade/summary', async (req, res) => {
    let {rows} = await client.query(`
    select 
        country_code, country_description, value 
    from 
        country
    inner join trade 
        on trade.reporter_code = country.country_code
    inner join indicator 
        on indicator.indicator_code = trade.indicator_code
    where 
        indicator_description = 'Total merchandise' and year = 2018 and flow_code = 'X' and partner_code = 'WL'
    and 
        length(reporter_code) < 3 
    and 
        reporter_code != 'G7';`);

    res.json(rows);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));