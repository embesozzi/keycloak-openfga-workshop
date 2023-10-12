const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 8000;
const jwt = require("express-jwt");
const { decode }  = require('jsonwebtoken');
const jwksRsa = require("jwks-rsa");
const { OpenFgaApi } = require("@openfga/sdk");
    
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Create middleware to validate the JWT using express-jwt
const checkJwt = jwt({
  
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: process.env.OIDC_PROVIDER_JWKS_URI || "http://keycloak:8081/realms/master/protocol/openid-connect/certs"
  }),
  audience: process.env.OIDC_PROVIDER_AUDIENCE ||  "http://keycloak:8081/realms/master",
  issuer: process.env.OIDC_PROVIDER_DOMAIN || "http://keycloak:8081/realms/master",
  algorithms: ["RS256"]
});


const fgaClient = new OpenFgaApi({
    apiScheme: process.env.OPENFGA_API_SCHEME || "http",
    apiHost: process.env.OPENFGA_API_HOST || "openfga:8080"
});

const getOpenFGAStore = async () => {
    console.log("[Store API] Getting the OpenFga store...");
    try {
      const { stores } = await fgaClient.listStores();
      for (const store of stores) {
        console.log("[Store API] Store found name: " + store.name + " id: " + store.id);
        fgaClient.storeId = store.id;
      }  
    }
    catch(e){
      console.error(e)
    }
}
getOpenFGAStore();

const userHasRole = async (userId,roleName) => {
    let user = "user:" + userId;
    let relationship = "assignee";
    let object = "role:" + roleName;
    return await checkTuple(user, relationship, object);
}

const checkTuple = async function (user, relationship, object) {
    console.log("[Store API] Check user: " + user + " rel: " + relationship + " obj: " + object);
    try {
        if(!fgaClient.storeId){
          console.log("[Store API] Upps OpenFGA is not initialized properly...");
          await getOpenFGAStore();
          if(!fgaClient.storeId){
            throw new Error('Upps OpenFGA is not initialized properly :(')
          }
        }
      
        let { allowed } = await fgaClient.check({
            tuple_key: {
                user: user,
                relation: relationship,
                object: object
            }
        });
        console.log("[Store API] Is the user allowed: " + allowed); 
        return allowed;
    } catch ( e ) {
        console.log(e);
        return false;
    }
}

app.get("/api/products", async (req, res) => {
    const auth = req.get('Authorization');
    const { sub } = decode(auth.split(' ')[1]);
    console.log("[Store API] Claim sub: " + sub)
    if (await userHasRole(sub, "view-product")) {
        res.send(products);
    } else {
        res.status(403).send();
    }
});

app.post("/api/products/:id/publish", async (req, res) => {
  const auth = req.get('Authorization');
  const { sub } = decode(auth.split(' ')[1]);
  console.log("[Store API] Claim sub: " + sub)
  const id = Number(req.params.id);
  if (await userHasRole(sub, "edit-product")) {
      res.send(200);
  } else {
      res.status(403).send();
  }
});

app.get("/api/products/:id", checkJwt, (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(event => event.id === id);
  res.send(product);
});


app.get("/", (req, res) => {
  res.send(`[Store API] API version 1.0.0`);
});

// listen on the port
app.listen(port);


// Mock data
let products = [
  {
    id: 1,
    name: 'Glasses Ray Ban',
    category: "pre-sale",
    description: 'Ray-Ban Black Original Wayfarer Classic Sunglasses',
    url : "https://source.unsplash.com/K62u25Jk6vo/600x300",
    details : "Brand	<b>Ray-Ban</b> <br> Model Name	Stories <br> Style	Stories<br> Color	Shiny Blue/Dark Blue Polarized <br> Age Range (Description)	Adult",
    status : "publish"
  },
  {
    id: 2,
    name: 'Apple watch',
    category: "pre-sale",
    description: 'Apple Watch Series 3 42MM Special Features',
    url : "https://source.unsplash.com/2cFZ_FB08UM/600x300",
    details : "Brand	<b>Apple</b> <br> Model Name	Apple Watch Series <br> Style	GPS <br> Special Feature Activity Tracker, Heart Rate Monitor, Sleep Monitor, Blood Oxygen",
    status : "publish"
  },
  {
    id: 3,
    name: 'Headphones Bose',
    category: "pre-sale",
    description: 'Bose Noise Cancelling Wireless Headphones 700',
    url : "https://source.unsplash.com/vISNAATFXlE/600x300",
    details: "Brand	<b>Bose</b> <br> Audio Model Name	<br> Performance ANC HeadphonesColor<br>Technology	Bluetooth 5.0",
    status: "published"
  },
  {
    id: 4,
    name: 'Nikon Camera',
    category: "pre-sale",
    description: "Nikon Camera Z50 Two Lens Coolpix B500",
    url : "https://source.unsplash.com/dcgB3CgidlU/600x300",
    status : "publish",
    details: "Brand <b>Nikon</b> <br>Model Name	Nikon Coolpix B500 <br>Form Factor	Point and Shoot <br>Effective Still Resolution	16 MP",
    status : "published"
  },
  {
    id: 5,
    name: 'Chanel N°5 Perfume',
    category: "pre-sale",
    description: 'Ulric De Varens Gold Issime Pour Elle 75ml Estilo Chanel Nº5.',
    url : "https://source.unsplash.com/potCPE_Cw8A/600x300",
    details : "Brand	<b>CHANEL<b> <br>Item Form	Spray <br>Item Volume	3.4 Fluid Ounces <br>  Age Range (Description)Adult",
    status : "published"
  }
];
