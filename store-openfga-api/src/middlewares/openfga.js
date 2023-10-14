const { OpenFgaApi } = require("@openfga/sdk");

const config = require("../config/openfga.config.js");
const { all } = require("../routes/products.route.js");

const fgaClient = new OpenFgaApi({
    apiScheme: config.apiScheme,
    apiHost: config.apiHost
});

const discoverStore = async () => {
    try {
        const { stores } = await fgaClient.listStores();
        for (const store of stores) {
            console.log(`[Store API] Store found name: ${store.name} id: ${store.id}`);
            fgaClient.storeId = store.id;
        }
        return fgaClient;  
    }
    catch(e){
        throw new Error('OpenFGA is not initialized properly')
    }
}      

const getClient = async () => {    
    return (fgaClient.storeId) ? fgaClient : await discoverStore();
}

const checkTuple = async function (user, relation, object) {
    console.log(`[Store API] Check tuple (user: '${user}', rel: '${relation}', obj: '${object}')`);
    try {
        let client = await getClient();
        let { allowed } = await client.check({
            tuple_key: {
                user: user,
                relation: relation,
                object: object
            }
        });
        console.log(`[Store API] Check tuple for user: ${user} isAllowed: ${allowed}`); 
        return allowed;
    } catch ( e ) {
        console.log(e);
        return false;
    }
}

const userHasRole = async (userId, roleName) => {
    return await checkTuple( `user:${userId}`, "assignee", `role:${roleName}`);
}

const checkUserHasRole = (roleName) => {
    return async (req, res, next) => {
        let allowed = await userHasRole(req.userId, roleName)
        
        if(allowed) {
            next();
        } 
        else {
            res.status(403).send();
            return;
        }    
    }     
}

module.exports = {
    checkUserHasRole
}