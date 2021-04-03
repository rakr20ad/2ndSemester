var Connection = require('tedious').Connection;
var Request = require('tedious').Request



const config = require('./config.json')

const executeSQL = (context, year) => {
    var result = ''; 

    // Create connection object 
    const connection = new Connection(config)
    // Create command to be executed 
    request = new Request(`SELECT DATEADD(${year}, 1, order_date) as order_date FROM sales.orders`, function(err){
        if (err){
            context.log.error(err); 
            context.res.status = 500; 
            context.res.body = "Error executing T-SQL command";
        }else {
            context.res = {
                body: result
            }
        }
        context.done();
    })

    // Execute request 
    connection.on('connect', function(err){
        if (err){
            context.log.error(err); 
            context.res.status = 500; 
            context.res.body = "Error executing T-SQL command";
            context.done();
        } else {
            //Connection succeeded to execute T-SQL
            connection.execSql(request);
        }
    });

    // Handle result and send back from azure SQL
    request.on('row', columns => {
        columns.forEach(column => {
            result += column.value
        });
    });

    // Connect
    connection.connect();
}


module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const year = (req.query.year || (req.body && req.body.year));
    
    executeSQL(context, year)
}