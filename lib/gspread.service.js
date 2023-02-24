
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const auth = new GoogleAuth({
    keyFile: "keys.json",
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const gspread = google.sheets({ version: 'v4', auth });

const GSpreadService = {

  rangeGet:async(range,spreadsheetId)=>{
    
    validate(range,spreadsheetId)

    const result = await gspread.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const numRows = result.data.values ? result.data.values.length : 0;
    console.log(`${numRows} rows retrieved.`);
    return result.data.values;
  },

  rowsAppend:async(values,range,spreadsheetId)=>{
    if(!values || !values instanceof Array || !values.length){
      throw new Error('Must pass a valid values')
    }
    validate(range,spreadsheetId)

    
    return new Promise((r,x)=>{
            
      sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          resource:{values},
          }, function (err, response) {
              if(err){
                  x(err)
              }
              r(response)
          });
  })
  },
  sheetExists:async(title,spreadsheetId)=>{
    const rangeName = 'A1:B1';

    validate(rangeName,spreadsheetId)

    const request = {
        spreadsheetId,
        ranges: rangeName,
        includeGridData: false
    };

    let res = await gspread.spreadsheets.get(request);
    const sheet = res.sheets.find(a=>a.title === title)
    
    return sheet?.id
  },
  sheetCreate:async(title,spreadsheetId)=>{
    validate(title,spreadsheetId)
    try {
        const request = {
            spreadsheetId,  
            resource: {
                requests: [{
                    addSheet: {
                        properties: {
                            title
                        }
                    }
                }],  
            },
            auth: client,
        };
    
        const resp = await gspread.spreadsheets.batchUpdate(request)
    } catch (error) {
        console.log(error)
    }
  },
}

module.exports = GSpreadService


// abstract out test for range and spreadsheetId
function validate(range,spreadsheetId){
  if(!range){
    throw new Error('Must pass a valid sheet "range"')
  }

  if(!spreadsheetId){
    throw new Error('Must pass a valid spreadsheet id')
  }
}