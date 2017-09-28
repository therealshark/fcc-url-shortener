const crypto = require('crypto');
const { promisify } = require('util');
const { URL } = require("url");

const { MongoClient } = require('mongodb');

const randomBytes = promisify(crypto.randomBytes);

const generateID = async () => {
  const bytes = await randomBytes(9);
  return bytes.toString("base64");
};

module.exports = async (dbUrl, dbCollection) => {

  const db = await MongoClient.connect(dbUrl);
  const collection = db.collection(dbCollection);

  const addUrl = async url => {
    // Check if Url is valid
    new URL(url); // this will throw an Error if the url is invalid
    // id and url are both defined as unique, so this loop tries to generate a new entry and the find that by url
    // if the url already exists, the generation will fail but the search will work
    // if the id already exists, the generation will fail, as well as the search, so the loop will run again until a free id is found
    // this will eventually produce an infinite loop if no id's are left, but there are  (2^8)^9 possible id's so that won't happen
    let doc = null;
    do {
      try {
        await collection.insertOne({id: await generateID(), url});
      }catch(err){}

      doc = await collection.findOne({url});
    } while(doc == null);
    //console.log(result);
    return doc.id;
  };

  const getUrl = async id => {
    const doc = await collection.findOne({id});
    return doc ? doc.url : null;
  };
  
  return {
    addUrl,
    getUrl
  }
}