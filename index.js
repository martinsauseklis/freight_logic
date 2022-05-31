const fs = require('fs');
const parseString = require('xml2js').parseString;
const xlsx = require('xlsx');

const rawXML = fs.readFileSync('file.xml');
const rawXMLOCNT = fs.readFileSync('ocnt.xml');
// const rawSHERLOC = fs.readFileSync('sherloc.xlsx');
const rawXLSX = xlsx.readFile('sherloc.xlsx');

const tempData = xlsx.utils.sheet_to_json(rawXLSX.Sheets[rawXLSX.SheetNames[0]]);
tempData.shift();
const parsedDataXLSX = [];
parsedDataXLSX.push(tempData)



let jsObj;

let jsObjOCNT;
parseString(rawXML, (err, result) => {
    jsObj = result;
})

parseString(rawXMLOCNT, (err, result) => {
    jsObjOCNT = result;
})

const shipments = jsObj[Object.keys(jsObj)[0]][Object.keys(jsObj[Object.keys(jsObj)[0]])[2]];
const shipmentsOCNT = () => {
    const finalArray = [];
    for (let i= 0; i < jsObjOCNT[Object.keys(jsObjOCNT)[0]]['Mawb'][0]['HandlingUnit'].length; i++) {
        for (let j = 0; j < jsObjOCNT[Object.keys(jsObjOCNT)[0]]['Mawb'][0]['HandlingUnit'][i]['Hawb'].length; j++) {
            finalArray.push(jsObjOCNT[Object.keys(jsObjOCNT)[0]]['Mawb'][0]['HandlingUnit'][i]['Hawb'][j])
        } ;
    }


    return finalArray
} 

const shipmentsSHERLOC = parsedDataXLSX[0];


const parseShipmentCount = (shipment) => {
    const count = shipment.NumberOfPieces
    return parseInt(count[0])
}



const pozFilterMS3 = () => {
    const pozCountries = [ 'AT', 'PL',  'DE', 'FR', 'SK', 'ES', 'SI', 'RO', 'GB', 'GR', 'PT', 'CH', 'NL', 'HR', 'HU', 'IT', 'CZ', 'BG', 'MC'];
    const ownPellets = [ 'NL', 'CH', 'PL'];
    const limit = 6;
    const pozArr = [];

    const plMix = {ctr: 'PL-MIX', count: 0, weight: 0,  pellets: 0, lm: 0.5};

    let count = 0;
    let weight = 0;

    const pozShipments = pozCountries.forEach(ctr => {
        shipments.forEach(shipment => {
            if (shipment['ConsigneeCountryCode'][0] === ctr){
                    count += parseShipmentCount(shipment)
                    weight += parseFloat(shipment['ShipmentWeight'][0]);
            }
        })

        const ctrObj = {
            ctr, count, weight: parseFloat(weight.toFixed(2)), pellets: 0, lm: 0.5

        }
        if (ctrObj.count < limit && (ctrObj.ctr !== ownPellets[0] || ctrObj.ctr !== ownPellets[1] || ctrObj.ctr !== ownPellets[2])){
            plMix.count += ctrObj.count;
            plMix.weight += ctrObj.weight;
        } else {
            pozArr.push(ctrObj)
        }
        

        //console.log('Uz ' + ctr + ' iet ' + count + ' sutijumi, ar svaru ' + parseFloat(weight.toFixed(2)) + ' kg.')
        count = 0;
        weight = 0;
    })
    pozArr.sort((a, b) => {
        if( a.weight < b.weight) 
        {return 1} else {return -1}})
    if (plMix.count > 0) {
        pozArr.push(plMix);
    }
    console.log(pozArr)
    return pozArr
}

const pozFilterOCNT = () => {
    const pozCountries = [ 'AT','PL', 'DE', 'FR', 'SK', 'ES', 'SI', 'RO', 'GB', 'GR', 'PT', 'CH', 'NL', 'HR', 'HU', 'IT', 'CZ', 'BG', 'MC'];
    const ownPellets = [ 'NL', 'CH', 'PL'];
    const limit = 6;
    const pozArr = [];

    const plMix = {ctr: 'PL-MIX', count: 0, weight: 0,  pellets: 0, lm: 0.5};

    let count = 0;
    let weight = 0;

    const pozShipments = pozCountries.forEach(ctr => {
        shipmentsOCNT().forEach(shipment => {
            if (shipment['ConsigneeCountryCode'][0] === ctr){
                    count += parseShipmentCount(shipment)
                    weight += parseFloat(shipment['ShipmentActualWeight'][0]);
            }
        })

        const ctrObj = {
            ctr, count, weight: parseFloat(weight.toFixed(2)), pellets: 0, lm: 0.5

        }
        if (ctrObj.count < limit && (ctrObj.ctr !== ownPellets[0] || ctrObj.ctr !== ownPellets[1] || ctrObj.ctr !== ownPellets[2])){
            plMix.count += ctrObj.count;
            plMix.weight += ctrObj.weight;
        } else {
            pozArr.push(ctrObj)
        }
        

        //console.log('Uz ' + ctr + ' iet ' + count + ' sutijumi, ar svaru ' + parseFloat(weight.toFixed(2)) + ' kg.')
        count = 0;
        weight = 0;
    })
    pozArr.sort((a, b) => {
        if( a.weight < b.weight) 
        {return 1} else {return -1}})
    if (plMix.count > 0) {
        pozArr.push(plMix);
    }
    console.log(pozArr)
    console.log('OCNT')
    return pozArr
}

const pozFilterSHERLOC = () => {
    const pozCountries = [ 'AT', 'PL', 'DE', 'FR', 'SK', 'ES', 'SI', 'RO', 'GB', 'GR', 'PT', 'CH', 'NL', 'HR', 'HU', 'IT', 'CZ', 'BG', 'MC'];
    const ownPellets = [ 'NL', 'CH', 'PL'];
    const limit = 6;
    const pozArr = [];
    const volumeOfPellet = 120*80*180;
    

    const plMix = {ctr: 'PL-MIX', count: 0, weight: 0, pellets: 0, lm: 0.5};

    let count = 0;
    let weight = 0;
   

    const pozShipments = pozCountries.forEach(ctr => {
        shipmentsSHERLOC.forEach(shipment => {
            if (shipment['Dest Ctry'] === ctr){
                    count += shipment['Piece No'];
                    weight += parseFloat(shipment['Weight']);
                    
            }
        })
        
        const ctrObj = {
            ctr, count, weight: parseFloat(weight.toFixed(2)), pellets: 0, lm: 0.5 

        }
        if (ctrObj.count < limit && (ctrObj.ctr !== ownPellets[0] || (ctrObj.ctr !== ownPellets[1] || ctrObj.ctr !== ownPellets[2]))){
            plMix.count += ctrObj.count;
            plMix.weight += ctrObj.weight;
            
        } else {
            pozArr.push(ctrObj)
        }
        

        //console.log('Uz ' + ctr + ' iet ' + count + ' sutijumi, ar svaru ' + parseFloat(weight.toFixed(2)) + ' kg.')
        count = 0;
        weight = 0;
        
    })
    pozArr.sort((a, b) => {
        if( a.weight < b.weight) 
        {return 1} else {return -1}})
    if (plMix.count > 0) {
        pozArr.push(plMix);
    }
    console.log(pozArr)
    console.log('SHERLOC')
    return pozArr
}

//pozFilterMS3();
//pozFilterOCNT();
pozFilterSHERLOC(); 

