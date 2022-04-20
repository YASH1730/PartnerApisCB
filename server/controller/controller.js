
    // +++++++++++++++++++++++++++ Partner APIs Implementation Starts from here ++++++++++++++++++++++++++++++++++++++
// =========================================================================================================================

require('dotenv').config();
const db = require('../../database/dbConfig')
const JWT = require('jsonwebtoken');
const { route } = require('../route');



// Api for create partner

exports.register = (req,res)=>{

  console.log(req.body)

  if(req.body.name == undefined || req.body.contact == undefined || req.body.email == undefined || req.body.gstin == undefined ||req.body.address == undefined) 
  return res.status(204).send({error_massage : 'Please enter all the required feilds.' })

  let data = {
    Name : req.body.name,
    GSTIN : req.body.gstin,
    Address : req.body.address,
    ContactNumber : req.body.contact,
    Email : req.body.email
  }

  db.table('partnerData')
  .insert(data)
  .then((data) => {
    res.status(200).send({
      status: 'Partner Added Successfully',
    });
  })
  .catch((e) => {
    console.log('ERROR', e);
    res.render('./register.pug',{msg:e.detail,theme : 'danger'});

  });


}

// Api For Genrating the JWT Token 



// Api for getting the JWT token


function getToken(data){

    // { expiresIn: '200s' }
    const token = JWT.sign(data,process.env.ACCESS_SECRET);

    return token;

  }
  

exports.getToken =  async (req, res) => {

  let ContactNumber = req.body.phoneNumber;
  let flag = true;

  console.log(ContactNumber)

  // check that req has the user details or not
  if(ContactNumber === undefined ) return res.sendStatus(204)

  // check the user is exist or not 

  await db.table('partnerData').where({ContactNumber}).then((data)=>{
    console.log(data[0])
    if(data[0] === undefined) return res.status(401).send({massage : 'Please provides the valid credentials'})
    const token = getToken(data[0])
    return res.render('dashboard.pug',{token, data : data[0]})
  })
  .catch((err)=>{
      console.log(err) 
     return res.send(err)
    })

}


// Api for getting the providers list

exports.getProvider = async (req, res) => {
  // for provider list
  await db.table('data').distinct('provider').then((data)=>{
    res.json({data})
    
}).catch((err)=>{
  res.send(err)
})

}

// Api for data fetching

exports.getData = async (req, res) => {
  // console.log(req.query)

  const provider = req.query.provider
  const pageNumber = req.query.page || 1
  const user = req.user
   
  console.log(user)
  // if(req.query)

  // for course count
  let total  = await db.table('data').count('index as total').where({provider})

  console.log(total[0].total)

  const metaData = {
    total : total[0].total,
    numberOfPages : Math.ceil(total[0].total/20),
    page : pageNumber
  }

  const offset = (pageNumber-1)*20
  console.log(offset)

  
  // for course detail 
  let data  = await db.table('data').where({provider}).limit(20).offset(offset)
  
  // console.log(user)

  res.json({metaData,data})
}


// Apis for search bar 

exports.getSearch = async(req,res)=>{

  console.log(JSON.parse(req.query.filter))

  const listProvider = {
                        Udemy : true,
                        Coursera : true,
                        FutureLearn : true,
                        edX : true
                      };

  const Filters = JSON.parse(req.query.filter)

  // for course count
  // let total  = await db.table('data').count('index as total').where('title', 'ilike', `%${req.query.q}%`)

  // const offset = (e.query.pageNumber-1)*100
  // console.log(offset)


  let data  = await db.table('data').select('uuid','provider','title','price','subjects','start_date','university').where((sortQuery)=>{

        // for title 
        sortQuery.where('title', 'ilike', `%${req.query.q}%`)

        // for provider
        
        sortQuery.andWhere((filter)=>{
          
          for (const key in Filters) {
            if (Filters.hasOwnProperty.call(Filters, key)) {
              const element = Filters[key];
              if(element === true)
              {
                if(listProvider.indexOf(key) > -1)
                {
                  filter.orWhere('provider','=',key)
                }
              }
            }}
          })
          
          sortQuery.andWhere((filter)=>{
          // for price checking
          if(Filters.Free === true && (Filters.Paid === false && Filters.Subscription === false))
            filter.whereNull('price')

           else if ((Filters.Paid === true || Filters.Subscription === true) &&  Filters.Free === false)
             filter.andWhere('price','>',0)
              
          else{
            filter.whereNull('price')
            filter.orWhere('price','>',0)
          }})

      
    }).orderBy('ranking_points','ase')

    console.log(data)

    let finalData = [];
    secondData = [];
    
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const element = data[key];

        if(element.provider == 'Udemy' && listProvider[element.provider] == true)
          {
            finalData.push(data[key]);
            listProvider[element.provider] = false;
          }
        else if (element.provider == 'edX' && listProvider[element.provider] == true)
        {
          finalData.push(data[key]);
          listProvider[element.provider] = false;
        }
        else if (element.provider == 'FuturLearn' && listProvider[element.provider] == true)
        {
          finalData.push(data[key]);
          listProvider[element.provider] = false;
        }
        else if (element.provider == 'Coursera' && listProvider[element.provider] == true)
        {
          finalData.push(data[key]);
          listProvider[element.provider] = false;
        }
        else{
          secondData.push(data[key]);
        }

        if(listProvider.Udemy === false && listProvider.Coursera === false && listProvider.edX === false && listProvider.FutureLearn === false)
        {
          listProvider.Udemy = true; listProvider.Coursera = true; listProvider.edX = true; listProvider.FutureLearn = true;
        }
      }
    }

    finalData = finalData.concat(secondData)

    // console.log(finalData)

    res.send(finalData)

}